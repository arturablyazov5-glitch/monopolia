import { siteText } from "./site-texts.mjs";
// Данные для DealSteps (Figma 1380:6839 «Покупка»; аналог на «Продаже» —
// 1380:6182 внутри 1380:5932). Каждый шаг — бумажная карточка с номером,
// необязательной картинкой, текстом и одним из «слотов»: метки, воронка,
// заметка или список.

export interface DealImage {
  src: string;
  /** Пропорции исходного кадра в Figma (aspect-ratio слота) */
  width: number;
  height: number;
  alt: string;
  /** Белая плашка с зелёной галочкой в правом верхнем углу фото */
  badge?: string;
}

export interface DealChip {
  text: string;
  /** Поворот из макета, градусы */
  rotate?: number;
  /** Габарит повёрнутой метки в Figma [w, h] — по нему идёт перенос строк */
  box?: [number, number];
}

/** Заметка на ленте внутри карточки (например «Весь процесс запишем на видео») */
export interface DealNote {
  text: string;
  icon?: { src: string; width: number; height: number };
}

/** Метка, разлетающаяся над воронкой: центр бокса Figma и поворот */
export interface DealFunnelLabel {
  text: string;
  x: number;
  y: number;
  rotate: number;
}

export interface DealFunnel {
  labels: DealFunnelLabel[];
  /** Габарит области меток (inline-grid в Figma) */
  width: number;
  height: number;
  image: DealImage;
  icon: DealImage;
  result: string;
}

/** Дашевая вертикаль под номером: исходный SVG и его размеры */
export interface DealLine {
  src: string;
  height: number;
}

export interface DealStep {
  /** \n — перенос строки как в макете (white-space: pre-line) */
  text: string;
  textParts?: { text: string; muted?: boolean }[];
  image?: DealImage;
  chips?: DealChip[];
  note?: DealNote;
  funnel?: DealFunnel;
  /** Маркированный список (на «Продаже» встречаются шаги со списком) */
  list?: string[];
  /** Линия под номером; у последнего шага в Figma скрыта */
  line?: DealLine;
  node?: string;
}

const dash = (src: string, height: number): DealLine => ({ src, height });

export const buyDealSteps: DealStep[] = [
  {
    node: "1380:6860",
    image: {
      src: "/assets/property-selection-catalog.webp",
      width: 2939,
      height: 1718,
      alt: "Конвейер с одинаковыми домиками и площадка с подходящими вариантами",
    },
    text: siteText("deal-steps.text.4"),
    chips: [
      { text: siteText("deal-steps.text.5"), rotate: -1, box: [75.495, 30.305] },
      { text: siteText("deal-steps.text.6"), rotate: 1, box: [118.488, 31.055] },
      { text: siteText("deal-steps.text.7"), rotate: -1, box: [90.492, 30.566] },
      { text: siteText("deal-steps.text.8"), rotate: -2, box: [65.972, 31.251] },
      { text: siteText("deal-steps.text.9"), rotate: 2, box: [114.943, 32.961] },
      { text: siteText("sell-answers.text.5"), rotate: 2, box: [83.962, 31.879] },
      { text: siteText("deal-steps.text.10"), rotate: -0.5, box: [58.251, 29.505] },
      { text: siteText("deal-steps.text.11"), rotate: -1, box: [99.491, 30.723] },
      { text: siteText("deal-steps.text.12"), rotate: -1, box: [71.495, 30.235] },
      { text: siteText("deal-steps.text.13"), rotate: -1, box: [85.493, 30.479] },
      { text: siteText("deal-steps.text.14"), rotate: -1, box: [71.495, 30.235] },
    ],
    line: dash("/assets/buy-steps-budget-connector.svg", 546.879),
  },
  {
    node: "1380:6873",
    image: {
      src: "/assets/mortgage-documents-stack.webp",
      width: 1793,
      height: 1715,
      alt: "Стопка документов для ипотеки с печатью",
      badge: "Одобрение 91%",
    },
    text: siteText("deal-steps.text.15"),
    line: dash("/assets/buy-steps-mortgage-connector.svg", 563.381),
  },
  {
    node: "1380:6885",
    text: siteText("deal-steps.text.16"),
    funnel: {
      width: 272.86,
      height: 184.96,
      labels: [
        { text: siteText("deal-steps.text.17"), x: 62.17, y: 81.35, rotate: 61.45 },
        { text: siteText("deal-steps.text.18"), x: 139.97, y: 109.6, rotate: 83.85 },
        { text: siteText("deal-steps.text.19"), x: 204.75, y: 66.07, rotate: -70.4 },
        { text: siteText("deal-steps.text.20"), x: 36.86, y: 135.37, rotate: 57.31 },
        { text: siteText("deal-steps.text.21"), x: 236.19, y: 142.45, rotate: -52.78 },
      ],
      image: {
        src: "/assets/property-selection-funnel.webp",
        width: 1408,
        height: 2104,
        alt: "Воронка отбора объектов",
      },
      icon: { src: "/assets/funnel-selection-icon.webp", width: 86, height: 34, alt: "" },
      result: siteText("deal-steps.text.19"),
    },
    line: dash("/assets/buy-steps-selection-connector.svg", 876.43),
  },
  {
    node: "1380:6897",
    text: siteText("deal-steps.text.22"),
    chips: [
      { text: siteText("private-catalog.checks.1"), rotate: -1, box: [61.497, 30.06] },
      { text: siteText("private-catalog.checks.2"), rotate: 1, box: [97.491, 30.688] },
      { text: siteText("private-catalog.checks.3"), rotate: -1, box: [86.493, 30.496] },
      { text: siteText("private-catalog.checks.4"), rotate: -2, box: [102.95, 32.542] },
      { text: siteText("private-catalog.checks.5"), rotate: 2, box: [140.927, 33.868] },
      { text: siteText("private-catalog.checks.6"), rotate: 2, box: [62.974, 31.146] },
      {
        text: siteText("private-catalog.checks.7"),
        rotate: -0.5,
        box: [248.244, 31.163],
      },
      { text: siteText("private-catalog.checks.8"), rotate: -1, box: [137.485, 31.387] },
      { text: siteText("private-catalog.checks.9"), rotate: 2, box: [156.917, 34.427] },
    ],
    line: dash("/assets/buy-steps-checks-connector.svg", 326.224),
  },
  {
    node: "1380:6910",
    image: {
      src: "/assets/property-viewing-route-map.webp",
      width: 2875,
      height: 1729,
      alt: "Карта с маршрутом просмотров отобранных объектов",
    },
    text: siteText("deal-steps.text.23"),
    line: dash("/assets/buy-steps-route-connector.svg", 387.395),
  },
  {
    node: "1380:6928",
    text: siteText("deal-steps.text.24"),
    note: {
      text: siteText("deal-steps.text.25"),
      icon: { src: "/assets/icon-transaction-note.svg", width: 32, height: 32 },
    },
    line: dash("/assets/transaction-step-final-connector.svg", 204),
  },
  {
    node: "1380:6941",
    image: {
      src: "/assets/transaction-preliminary-contract.webp",
      width: 2292,
      height: 1876,
      alt: "Предварительный договор и деньги на скрепке",
    },
    text: siteText("deal-steps.text.26"),
    line: dash("/assets/transaction-step-connector.svg", 528.318),
  },
  {
    node: "1380:6952",
    text: siteText("deal-steps.text.27"),
    line: dash("/assets/transaction-step-note-icon.svg", 114),
  },
  {
    node: "1380:6963",
    text: siteText("deal-steps.text.28"),
    line: dash("/assets/transaction-documents-icon.svg", 138),
  },
  {
    node: "1380:6976",
    image: {
      src: "/assets/transaction-key-handover.webp",
      width: 2760,
      height: 1762,
      alt: "Передача ключей от квартиры",
    },
    text: siteText("deal-steps.text.29"),
  },
];
