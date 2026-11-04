export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const formats: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  rtf: ["application/rtf", "text/rtf", "application/x-rtf"],
  txt: ["text/plain"],
};

export async function resumeFileError(file: File): Promise<string> {
  if (file.size > MAX_RESUME_BYTES)
    return "Файл больше 10 МБ. Выберите файл меньшего размера.";
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (
    !formats[extension] ||
    (file.type && !formats[extension].includes(file.type.toLowerCase()))
  ) {
    return "Недопустимый формат. Выберите PDF, DOC, DOCX, RTF или TXT.";
  }
  if (!file.size) return "Файл пустой. Выберите другой файл.";
  const bytes = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  const starts = (signature: number[]) =>
    signature.every((byte, index) => bytes[index] === byte);
  const text = new TextDecoder().decode(bytes);
  const valid =
    extension === "pdf"
      ? starts([37, 80, 68, 70, 45])
      : extension === "doc"
        ? starts([208, 207, 17, 224, 161, 177, 26, 225])
        : extension === "docx"
          ? starts([80, 75, 3, 4])
          : extension === "rtf"
            ? text.startsWith("{\\rtf")
            : !bytes.includes(0);
  return valid
    ? ""
    : "Содержимое файла не соответствует формату. Выберите другой файл.";
}
