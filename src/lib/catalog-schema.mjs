// Shared card contract. Array position is the display order.
// Stored objects keep structured fields; title/address/price strings shown on
// the public site are derived here so every consumer sees one format.
export const legacyImage = "/assets/property-card-default-photo.webp";
export const isMediaPath = (value) =>
  typeof value === "string" && /^\/media\/[a-f0-9]{48}\.webp$/.test(value);
export const TRASH_TTL = 30 * 24 * 60 * 60 * 1000;

export const propertyKinds = {
  flat: "Квартира",
  studio: "Студия",
  house: "Дом",
  plot: "Участок",
  commercial: "Коммерческое помещение",
};
export const kindOptions = [
  ["flat", "Квартира"],
  ["studio", "Студия"],
  ["house", "Дом"],
  ["plot", "Участок"],
  ["commercial", "Коммерческое помещение"],
];
export const settlementPrefixes = {
  city: "г.",
  village: "с.",
  settlement: "пос.",
  pgt: "пгт.",
  derevnya: "д.",
};
export const settlementOptions = [
  ["city", "Город"],
  ["village", "Село"],
  ["settlement", "Посёлок"],
  ["pgt", "ПГТ"],
  ["derevnya", "Деревня"],
];
export const streetPrefixes = {
  street: "ул.",
  avenue: "пр-т",
  lane: "пер.",
  proezd: "пр-д",
  highway: "ш.",
  boulevard: "б-р",
  square: "пл.",
  embankment: "наб.",
  tupik: "туп.",
  line: "линия",
};
export const streetOptions = [
  ["street", "Улица"],
  ["avenue", "Проспект"],
  ["lane", "Переулок"],
  ["proezd", "Проезд"],
  ["highway", "Шоссе"],
  ["boulevard", "Бульвар"],
  ["square", "Площадь"],
  ["embankment", "Набережная"],
  ["tupik", "Тупик"],
  ["line", "Линия"],
];
export const displayCities = ["Белогорск", "Благовещенск"];

const NBSP = " ";
const num = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n =
    typeof value === "number"
      ? value
      : Number(
          String(value)
            .replace(",", ".")
            .replace(/[^\d.,-]/g, ""),
        );
  return Number.isFinite(n) ? n : NaN;
};
const intOrNull = (value) => {
  const n = num(value);
  return n !== null && Number.isInteger(n) ? n : null;
};
const decOrNull = (value, max) => {
  const n = num(value);
  return n !== null && n > 0 && n <= max ? Math.round(n * 100) / 100 : null;
};

// "4 900 000 ₽" / "900000" / 900000 -> 900000
export function parseMoney(value) {
  if (typeof value === "number")
    return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value !== "string") return null;
  const compact = value
    .replace(/[\s ]/g, "")
    .replace(/(?:₽|руб\.?)(?:\/м[²2])?$/iu, "");
  const n = Number(compact.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}
const fmtInt = (n) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
export function formatMoney(value) {
  const n = num(value);
  if (n === null || !Number.isFinite(n)) return "";
  const rounded = Math.round(n * 100) / 100;
  const [i, f] = String(rounded).split(".");
  return fmtInt(Number(i)) + (f ? "," + f.replace(/0+$/, "") : "") + " ₽";
}
const fmtArea = (n) => String(n).replace(".", ",");
const plural = (n, one, few, many) => {
  const a = Math.abs(n) % 100,
    b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
};

export function pricePerMeterValue(p) {
  const price = num(p.price),
    area = num(p.area);
  if (price === null || area === null || area <= 0) return "";
  return formatMoney(price / area).replace(" ₽", " ₽/м²");
}
export function discountValue(p) {
  const price = num(p.price),
    old = num(p.oldPrice);
  if (price === null || old === null || old <= price || old <= 0) return "";
  const pct = Math.round(((old - price) / old) * 1000) / 10;
  if (!(pct > 0)) return "";
  const text = Number.isInteger(pct)
    ? String(pct)
    : String(pct).replace(".", ",");
  return "−" + text + "%";
}
export function buildTitle(p) {
  const kind = propertyKinds[p.kind];
  if (!kind) return typeof p.title === "string" ? p.title : "";
  const parts = [];
  if (p.kind === "studio") parts.push("Студия");
  else if (p.kind === "flat")
    parts.push((p.rooms ? p.rooms + "-комнатная " : "") + "квартира");
  else parts.push(kind);
  const area = num(p.area);
  if (area !== null && area > 0) parts.push(fmtArea(area) + " м²");
  const floor = intOrNull(p.floor),
    floors = intOrNull(p.floors);
  if (floor !== null && floors !== null)
    parts.push(floor + "/" + floors + " этаж");
  else if (floor !== null) parts.push(floor + " этаж");
  const land = decOrNull(p.landArea, 100000);
  if (land !== null)
    parts.push(fmtArea(land) + " " + plural(land, "сотка", "сотки", "соток"));
  return parts.join(", ");
}
export function buildAddress(p) {
  const parts = [];
  const settlement =
    typeof p.settlement === "string" ? p.settlement.trim() : "";
  if (settlement) {
    const prefix = settlementPrefixes[p.settlementKind];
    parts.push((prefix ? prefix + " " : "") + settlement);
  }
  const street = typeof p.street === "string" ? p.street.trim() : "";
  if (street) {
    const prefix = streetPrefixes[p.streetKind] || "";
    parts.push((prefix ? prefix + " " : "") + street);
  }
  const house = typeof p.house === "string" ? p.house.trim() : "";
  if (house)
    parts.push(/^[а-яёa-z]{1,5}\.\s*/i.test(house) ? house : "д. " + house);
  return parts.join(", ");
}

const SETTLE_PREFIX =
  /^(?:г|с|пос|пгт|д|город|село|посёлок|поселок|деревня)\.?\s+/i;
const SETTLE_KIND = {
  г: "city",
  город: "city",
  с: "village",
  село: "village",
  пос: "settlement",
  посёлок: "settlement",
  поселок: "settlement",
  пгт: "pgt",
  д: "derevnya",
  деревня: "derevnya",
};
const STREET_PREFIX =
  /^(ул|улица|проспект|пр-т|пр|переулок|пер|проезд|пр-д|шоссе|ш|бульвар|б-р|площадь|пл|набережная|наб|тупик|туп|линия|аллея|тракт|мкр|микрорайон)\.?\s+/i;
const STREET_KIND = {
  ул: "street",
  улица: "street",
  проспект: "avenue",
  "пр-т": "avenue",
  пр: "avenue",
  переулок: "lane",
  пер: "lane",
  проезд: "proezd",
  "пр-д": "proezd",
  шоссе: "highway",
  ш: "highway",
  бульвар: "boulevard",
  "б-р": "boulevard",
  площадь: "square",
  пл: "square",
  набережная: "embankment",
  наб: "embankment",
  тупик: "tupik",
  туп: "tupik",
  линия: "line",
  аллея: "line",
  тракт: "line",
  мкр: "line",
  микрорайон: "line",
};
const HOUSE_PREFIX = /^(?:д|дом|вл|владение|стр|строение|корп|к)\.?\s*/i;

// Best-effort migration of a legacy one-line address into structured fields.
// Unknown remainder is preserved in settlement so nothing is lost.
export function parseLegacyAddress(address) {
  const text = String(address || "").trim();
  if (!text) return null;
  const out = {
    settlement: "",
    settlementKind: "",
    street: "",
    streetKind: "",
    house: "",
  };
  const segments = text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const rest = [];
  for (const segment of segments) {
    const settle = segment.match(SETTLE_PREFIX);
    const street = segment.match(STREET_PREFIX);
    const house = segment.match(HOUSE_PREFIX);
    // Order matters: "д. 1" is a house number, not a деревня settlement.
    if (!out.street && street) {
      out.streetKind =
        STREET_KIND[street[0].replace(/[.\s]+$/, "").toLowerCase()] || "street";
      out.street = segment.slice(street[0].length).trim();
    } else if (!out.house && house && /\d/.test(segment)) {
      out.house = segment.replace(HOUSE_PREFIX, "").trim();
    } else if (!out.settlement && settle) {
      out.settlementKind =
        SETTLE_KIND[settle[0].replace(/[.\s]+$/, "").toLowerCase()] || "";
      out.settlement = segment.slice(settle[0].length).trim();
    } else {
      rest.push(segment);
    }
  }
  // Leftover segments fill gaps in order: settlement, street, house.
  if (!out.settlement && rest.length) out.settlement = rest.shift();
  if (!out.street && rest.length) out.street = rest.shift();
  if (!out.house && rest.length && /\d/.test(rest[0])) out.house = rest.shift();
  if (!out.settlement && !out.street && !out.house) return null;
  if (!out.streetKind && out.street) out.streetKind = "";
  return out;
}

export function parseLegacyTitle(title) {
  const text = String(title || "");
  const out = {
    kind: "",
    rooms: null,
    area: null,
    floor: null,
    floors: null,
    landArea: null,
  };
  if (/студи/i.test(text)) out.kind = "studio";
  else if (/квартир/i.test(text)) out.kind = "flat";
  else if (/коммерческ/i.test(text)) out.kind = "commercial";
  else if (/участок/i.test(text)) out.kind = "plot";
  else if (/(?<![\p{L}\p{N}])дом(?![\p{L}\p{N}])/iu.test(text))
    out.kind = "house";
  const rooms = text.match(/(\d+)\s*[-‑–—]\s*комнат/i);
  if (rooms) out.rooms = Math.min(10, Math.max(1, Number(rooms[1])));
  const area = text.match(/([\d]+(?:[.,]\d+)?)\s*м²/i);
  if (area) out.area = Number(area[1].replace(",", "."));
  const floor =
    text.match(/(\d+)\s*\/\s*(\d+)\s*этаж/i) || text.match(/(\d+)\s*этаж/i);
  if (floor) {
    out.floor = Number(floor[1]);
    if (floor[2]) out.floors = Number(floor[2]);
  }
  const land = text.match(/([\d]+(?:[.,]\d+)?)\s*сот/i);
  if (land) out.landArea = Number(land[1].replace(",", "."));
  return out;
}

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const oneOf = (v, allowed) => (allowed.includes(v) ? v : "");

export function normalizeProperty(p) {
  if (!p || typeof p !== "object") return p;
  const out = {
    id: p.id,
    visible: p.visible === true,
    image:
      p.image && typeof p.image === "object"
        ? { small: p.image.small, large: p.image.large }
        : null,
    kind: oneOf(p.kind, Object.keys(propertyKinds)),
    rooms: p.kind === "flat" || !p.kind ? intOrNull(p.rooms) : null,
    area: decOrNull(p.area, 1000000),
    floor:
      intOrNull(p.floor) !== null &&
      intOrNull(p.floor) >= 1 &&
      intOrNull(p.floor) <= 200
        ? intOrNull(p.floor)
        : null,
    floors:
      intOrNull(p.floors) !== null &&
      intOrNull(p.floors) >= 1 &&
      intOrNull(p.floors) <= 300
        ? intOrNull(p.floors)
        : null,
    landArea: decOrNull(p.landArea, 100000),
    settlement: str(p.settlement, 120),
    settlementKind: oneOf(p.settlementKind, Object.keys(settlementPrefixes)),
    street: str(p.street, 120),
    streetKind: oneOf(p.streetKind, Object.keys(streetPrefixes)),
    house: str(p.house, 60),
    city: displayCities.includes(p.city) ? p.city : "",
    price: parseMoney(p.price),
    oldPrice: parseMoney(p.oldPrice),
    mortgage: str(p.mortgage, 100),
    title: str(p.title, 160),
    address: str(p.address, 200),
  };
  if (!out.city) {
    out.city = /^\s*благовещенск/i.test(out.address)
      ? "Благовещенск"
      : "Белогорск";
  }
  // Legacy rows: migrate free-text title/address once, then derive canonically.
  if (!out.kind || (!out.settlement && !out.street && !out.house)) {
    const t = parseLegacyTitle(out.title || "");
    if (!out.kind) out.kind = t.kind;
    if (out.rooms === null) out.rooms = t.rooms;
    if (out.area === null)
      out.area = t.area !== null ? Math.round(t.area * 100) / 100 : null;
    if (out.floor === null) out.floor = t.floor;
    if (out.floors === null) out.floors = t.floors;
    if (out.landArea === null)
      out.landArea =
        t.landArea !== null ? Math.round(t.landArea * 100) / 100 : null;
  }
  if (!out.settlement && !out.street && !out.house && out.address) {
    const a = parseLegacyAddress(out.address);
    if (a) Object.assign(out, a);
    else out.settlement = out.address; // keep the whole legacy string visible
  }
  out.rooms = out.kind === "flat" ? out.rooms : null;
  out.title = buildTitle(out) || out.title;
  out.address = buildAddress(out) || out.address;
  return out;
}

const objectKeys = [
  "id",
  "visible",
  "image",
  "kind",
  "rooms",
  "area",
  "floor",
  "floors",
  "landArea",
  "settlement",
  "settlementKind",
  "street",
  "streetKind",
  "house",
  "city",
  "price",
  "oldPrice",
  "mortgage",
  "title",
  "address",
];
const numOk = (v, min, max, integer) =>
  v === null ||
  (typeof v === "number" &&
    Number.isFinite(v) &&
    v >= min &&
    v <= max &&
    (!integer || Number.isInteger(v)));

export function validateCatalog(data) {
  const errors = [];
  const fail = (path, message) => errors.push({ path, message });
  const object = (v) => v && typeof v === "object" && !Array.isArray(v);
  const keys = (v, allowed, path) => {
    if (!object(v)) {
      fail(path, "Ожидается объект");
      return false;
    }
    for (const k of Object.keys(v))
      if (!allowed.includes(k)) fail(path + "." + k, "Неизвестное поле");
    return true;
  };
  if (!keys(data, ["revision", "objects", "trash"], "catalog"))
    return { valid: false, errors };
  if (!Number.isSafeInteger(data.revision) || data.revision < 0)
    fail("revision", "Некорректная версия");
  if (!Array.isArray(data.objects) || data.objects.length > 100)
    fail("objects", "Не более 100 карточек");
  const checkObject = (p, path, extra = []) => {
    if (!keys(p, [...objectKeys, ...extra], path)) return;
    if (typeof p.id !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(p.id))
      fail(path + ".id", "Некорректный ID");
    if (typeof p.visible !== "boolean")
      fail(path + ".visible", "Выберите видимость");
    if (p.image !== null) {
      if (keys(p.image, ["small", "large"], path + ".image")) {
        const legacy =
          p.image.small === legacyImage && p.image.large === legacyImage;
        if (
          !legacy &&
          (!isMediaPath(p.image.small) ||
            !isMediaPath(p.image.large) ||
            p.image.small === p.image.large)
        )
          fail(path + ".image", "Выберите фотографию");
      }
    }
    if (!Object.keys(propertyKinds).includes(p.kind))
      fail(path + ".kind", "Выберите тип объекта");
    if (!numOk(p.rooms, 1, 10, true))
      fail(path + ".rooms", "Некорректное число комнат");
    if (!numOk(p.area, 0.01, 1000000, false))
      fail(path + ".area", "Некорректная площадь");
    if (!numOk(p.floor, 1, 200, true))
      fail(path + ".floor", "Некорректный этаж");
    if (!numOk(p.floors, 1, 300, true))
      fail(path + ".floors", "Некорректная этажность");
    if (!numOk(p.landArea, 0.01, 100000, false))
      fail(path + ".landArea", "Некорректная площадь участка");
    if (typeof p.settlement !== "string" || p.settlement.length > 120)
      fail(path + ".settlement", "Укажите населенный пункт");
    if (
      !Object.keys(settlementPrefixes).includes(p.settlementKind) &&
      p.settlementKind !== ""
    )
      fail(path + ".settlementKind", "Некорректный тип населенного пункта");
    if (typeof p.street !== "string" || p.street.length > 120)
      fail(path + ".street", "Укажите улицу");
    if (
      !Object.keys(streetPrefixes).includes(p.streetKind) &&
      p.streetKind !== ""
    )
      fail(path + ".streetKind", "Некорректный тип улицы");
    if (typeof p.house !== "string" || p.house.length > 60)
      fail(path + ".house", "Укажите номер дома");
    if (!displayCities.includes(p.city))
      fail(path + ".city", "Выберите город отображения");
    if (
      typeof p.price !== "number" ||
      !Number.isFinite(p.price) ||
      p.price <= 0 ||
      p.price > 1e12
    )
      fail(path + ".price", "Укажите цену объекта");
    if (
      p.oldPrice !== null &&
      (typeof p.oldPrice !== "number" ||
        !Number.isFinite(p.oldPrice) ||
        p.oldPrice <= 0 ||
        p.oldPrice > 1e12)
    )
      fail(path + ".oldPrice", "Некорректная старая цена");
    if (typeof p.mortgage !== "string" || p.mortgage.length > 100)
      fail(path + ".mortgage", "Некорректная подпись об ипотеке");
    if (typeof p.title !== "string" || !p.title.trim() || p.title.length > 160)
      fail(path + ".title", "Укажите название объекта");
    if (typeof p.address !== "string" || p.address.length > 200)
      fail(path + ".address", "Укажите адрес объекта");
    for (const k of extra)
      if (
        k === "deletedAt" &&
        (!Number.isSafeInteger(p.deletedAt) || p.deletedAt < 0)
      )
        fail(path + ".deletedAt", "Некорректная дата удаления");
  };
  const ids = new Set();
  for (const [i, p] of (Array.isArray(data.objects)
    ? data.objects
    : []
  ).entries()) {
    checkObject(p, "objects." + i);
    if (typeof p?.id === "string") {
      if (ids.has(p.id)) fail("objects." + i + ".id", "Повторный ID");
      ids.add(p.id);
    }
  }
  if (data.trash !== undefined) {
    if (!Array.isArray(data.trash) || data.trash.length > 200)
      fail("trash", "Некорректная корзина");
    else
      for (const [i, p] of data.trash.entries())
        checkObject(p, "trash." + i, ["deletedAt"]);
  }
  return { valid: errors.length === 0, errors };
}

export function normalizeCatalog(data) {
  return {
    revision: data.revision,
    objects: (data.objects || []).map(normalizeProperty),
    trash: (data.trash || []).map((p) => ({
      ...normalizeProperty(p),
      deletedAt: Number.isSafeInteger(p?.deletedAt) ? p.deletedAt : Date.now(),
    })),
  };
}

export function publicCatalog(catalog) {
  return {
    revision: catalog.revision,
    objects: (catalog.objects || [])
      .map(normalizeProperty)
      .filter((p) => p.visible && p.image)
      .map((p) => ({
        title: p.title,
        address: p.address,
        price: formatMoney(p.price),
        oldPrice: p.oldPrice ? formatMoney(p.oldPrice) : "",
        pricePerMeter: pricePerMeterValue(p),
        mortgage: p.mortgage,
        discount: discountValue(p),
        image: p.image,
        city: p.city,
      })),
  };
}
