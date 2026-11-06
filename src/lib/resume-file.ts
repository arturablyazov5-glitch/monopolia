export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const formats: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  rtf: ["application/rtf", "text/rtf", "application/x-rtf"],
  txt: ["text/plain"],
  odt: ["application/vnd.oasis.opendocument.text"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
  heic: ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"],
  heif: ["image/heif", "image/heic", "image/heif-sequence", "image/heic-sequence"],
};
export const RESUME_ACCEPT = Object.keys(formats).map(extension => `.${extension}`).join(",");

export async function resumeFileError(file: File): Promise<string> {
  if (file.size > MAX_RESUME_BYTES)
    return "Файл больше 10 МБ. Выберите файл меньшего размера.";
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (
    !formats[extension] ||
    (file.type && !formats[extension].includes(file.type.toLowerCase()))
  ) {
    return "Недопустимый формат. Выберите PDF, DOC, DOCX, ODT, RTF, TXT, PNG, JPEG, WebP или HEIC/HEIF.";
  }
  if (!file.size) return "Файл пустой. Выберите другой файл.";
  const bytes = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  const starts = (signature: number[]) =>
    signature.every((byte, index) => bytes[index] === byte);
  const text = new TextDecoder().decode(bytes);
  let imageValid: boolean | undefined;
  if (extension === "png") imageValid = starts([137, 80, 78, 71, 13, 10, 26, 10]);
  if (extension === "jpg" || extension === "jpeg") imageValid = starts([255, 216, 255]);
  if (extension === "webp") {
    imageValid = text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WEBP";
  }
  if (extension === "heic" || extension === "heif") {
    const header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const boxSize = bytes.length >= 16 ? header.getUint32(0) : 0;
    const brands = ["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"];
    const brandAt = (offset: number) => String.fromCharCode(...bytes.slice(offset, offset + 4));
    imageValid = false;
    if (text.slice(4, 8) === "ftyp" && boxSize >= 16) {
      imageValid = brands.includes(brandAt(8));
      for (let offset = 16; offset + 4 <= Math.min(boxSize, bytes.length); offset += 4) {
        imageValid ||= brands.includes(brandAt(offset));
      }
    }
  }
  const valid =
    imageValid ?? (extension === "pdf"
      ? starts([37, 80, 68, 70, 45])
      : extension === "doc"
        ? starts([208, 207, 17, 224, 161, 177, 26, 225])
        : extension === "docx" || extension === "odt"
          ? starts([80, 75, 3, 4])
          : extension === "rtf"
            ? text.startsWith("{\\rtf")
            : !bytes.includes(0));
  return valid
    ? ""
    : "Содержимое файла не соответствует формату. Выберите другой файл.";
}
