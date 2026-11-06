import { siteText } from "./site-texts.mjs";
/** Блок ответа FAQ: абзац или маркированный список. */
export type FaqAnswerBlock = string | { list: string[] };

export interface FaqItem {
  question: string;
  /** Строка — один абзац; массив — абзацы и списки с интервалом в строку, как в Figma. */
  answer: string | FaqAnswerBlock[];
  /** Текст кнопки. По умолчанию «Записаться на консультацию». */
  cta?: string;
  quiz?: "buy" | "sell";
  popup?: "closed-base";
  /** Колонка 1 или 2. Без значения карточки распределяются по очереди. */
  column?: 1 | 2;
  /** Поворот карточки в градусах (в макете −1, 0 или 1). */
  tilt?: number;
  /** Узел Figma для data-node-id. */
  node?: string;
}

/** Главная, Figma 1380:5736. Порядок — сверху вниз по колонкам макета. */
export const homeFaq: FaqItem[] = [
  {
    column: 1,
    tilt: -1,
    node: "1380:5740",
    question:
      siteText("faq-card.question.1"),
    answer:
      siteText("faq-card.answer.2"),
  },
  {
    column: 1,
    tilt: 1,
    node: "1380:5742",
    question:
      siteText("faq.question.1"),
    answer:
      siteText("faq.answer.2"),
  },
  {
    column: 1,
    tilt: -1,
    node: "1380:5744",
    question:
      siteText("faq.question.3"),
    answer:
      siteText("faq.answer.4"),
  },
  {
    column: 1,
    node: "1380:5747",
    question:
      siteText("faq.question.5"),
    answer: [
      siteText("faq.text.6"),
      {
        list: [
          siteText("faq.text.7"),
          siteText("faq.text.8"),
        ],
      },
      siteText("faq.text.9"),
    ],
  },
  {
    column: 1,
    tilt: -1,
    node: "1380:5749",
    cta: siteText("certificates.label.3"),
    question: siteText("faq.question.10"),
    answer:
      siteText("faq.answer.11"),
  },
  {
    column: 1,
    node: "1380:5751",
    cta: siteText("certificates.label.3"),
    question:
      siteText("faq.question.12"),
    answer:
      siteText("faq.answer.13"),
  },
  {
    column: 2,
    node: "1468:10630",
    cta: siteText("certificates.label.3"),
    question:
      siteText("faq.question.14"),
    answer:
      siteText("faq.answer.15"),
  },
  {
    column: 2,
    tilt: -1,
    node: "1380:5743",
    cta: siteText("certificates.label.3"),
    question: siteText("faq.question.16"),
    answer:
      siteText("faq.answer.17"),
  },
  {
    column: 2,
    tilt: -1,
    node: "1380:5745",
    cta: siteText("certificates.label.3"),
    question:
      siteText("faq.question.18"),
    answer:
      siteText("faq.answer.19"),
  },
  {
    column: 2,
    tilt: 1,
    node: "1380:5748",
    question:
      siteText("faq.question.20"),
    answer:
      siteText("faq.answer.21"),
  },
  {
    column: 2,
    tilt: 1,
    node: "1380:5750",
    question:
      siteText("faq.question.22"),
    answer:
      siteText("faq.answer.23"),
  },
  {
    column: 2,
    tilt: 1,
    node: "1380:5752",
    question: siteText("faq.question.24"),
    answer:
      siteText("faq.answer.25"),
  },
];

/** Продажа, Figma 1380:6327. */
export const sellFaq: FaqItem[] = [
  {
    column: 1,
    tilt: -1,
    node: "1380:6331",
    question: siteText("faq.question.26"),
    answer:
      siteText("faq.answer.27"),
    cta: siteText("faq.cta.28"),
  },
  {
    column: 1,
    tilt: 0,
    node: "1380:6332",
    question: siteText("faq.question.29"),
    answer:
      siteText("faq.answer.30"),
    cta: siteText("faq.cta.28"),
  },
  {
    column: 1,
    tilt: 1,
    node: "1380:6333",
    question: siteText("faq.question.31"),
    answer:
      siteText("faq.answer.32"),
    cta: siteText("buyer-audience.label.10"),
    quiz: "sell",
  },
  {
    column: 1,
    tilt: -1,
    node: "1380:6334",
    question:
      siteText("faq.question.33"),
    answer:
      siteText("faq.answer.34"),
    cta: siteText("buyer-audience.label.10"),
    quiz: "sell",
  },
  {
    column: 1,
    tilt: -1,
    node: "1380:6335",
    question:
      siteText("faq.question.35"),
    answer:
      siteText("faq.answer.36"),
    cta: siteText("certificates.label.3"),
  },
  {
    column: 2,
    tilt: 0,
    node: "1380:6337",
    question: siteText("faq.question.37"),
    answer:
      siteText("faq.answer.38"),
    cta: siteText("buyer-audience.label.10"),
    quiz: "sell",
  },
  {
    column: 2,
    tilt: 1,
    node: "1380:6338",
    question:
      siteText("faq.question.39"),
    answer:
      siteText("faq.answer.40"),
    cta: siteText("buyer-audience.label.10"),
    quiz: "sell",
  },
  {
    column: 2,
    tilt: -1,
    node: "1380:6339",
    question:
      siteText("faq.question.41"),
    answer:
      siteText("faq.answer.42"),
    cta: siteText("faq.cta.28"),
  },
  {
    column: 2,
    tilt: 1,
    node: "1380:6340",
    question:
      siteText("faq.question.43"),
    answer:
      siteText("faq.answer.44"),
    cta: siteText("certificates.label.3"),
  },
  {
    column: 2,
    tilt: 0,
    node: "1380:6341",
    question:
      siteText("faq.question.45"),
    answer:
      siteText("faq.answer.46"),
    cta: siteText("faq.cta.28"),
  },
];

/** Покупка, Figma 1380:7007. */
export const buyFaq: FaqItem[] = [
  {
    column: 1,
    tilt: -1,
    node: "1380:7011",
    question:
      siteText("faq.question.47"),
    answer:
      siteText("faq.answer.48"),
    cta: siteText("faq.cta.49"),
    popup: "closed-base",
  },
  {
    column: 1,
    tilt: 0,
    node: "1380:7012",
    question: siteText("faq.question.50"),
    answer:
      siteText("faq.answer.51"),
    cta: siteText("faq.cta.49"),
    popup: "closed-base",
  },
  {
    column: 1,
    tilt: 1,
    node: "1380:7013",
    question:
      siteText("faq.question.52"),
    answer:
      siteText("faq.answer.53"),
    cta: siteText("faq.cta.28"),
  },
  {
    column: 1,
    tilt: -1,
    node: "1380:7014",
    question:
      siteText("faq.question.54"),
    answer:
      siteText("faq.answer.55"),
    cta: siteText("certificates.label.3"),
  },
  {
    column: 1,
    tilt: -1,
    node: "1380:7015",
    question:
      siteText("faq.question.56"),
    answer:
      siteText("faq.answer.57"),
    cta: siteText("certificates.label.3"),
  },
  {
    column: 2,
    tilt: 0,
    node: "1380:7017",
    question: siteText("faq.question.58"),
    answer:
      siteText("faq.answer.59"),
    cta: siteText("faq.cta.60"),
  },
  {
    column: 2,
    tilt: 1,
    node: "1380:7018",
    question:
      siteText("faq.question.61"),
    answer:
      siteText("faq.answer.62"),
    cta: siteText("faq.cta.63"),
    quiz: "buy",
  },
  {
    column: 2,
    tilt: -1,
    node: "1380:7019",
    question:
      siteText("faq.question.64"),
    answer:
      siteText("faq.answer.65"),
    cta: siteText("faq.cta.28"),
  },
  {
    column: 2,
    tilt: 1,
    node: "1380:7020",
    question:
      siteText("faq.question.66"),
    answer:
      siteText("faq.answer.67"),
    cta: siteText("faq.cta.28"),
  },
  {
    column: 2,
    tilt: 0,
    node: "1380:7021",
    question: siteText("faq.question.68"),
    answer:
      siteText("faq.answer.69"),
    cta: siteText("faq.cta.63"),
    quiz: "buy",
  },
];
