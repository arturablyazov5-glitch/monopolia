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
      src: "/assets/009e6.webp",
      width: 2939,
      height: 1718,
      alt: "Конвейер с одинаковыми домиками и площадка с подходящими вариантами",
    },
    text: "Выявим, что вам реально подходит,\nа не будем пытаться навязать,\nкак на китайском рынке",
    chips: [
      { text: "Бюджет", rotate: -1, box: [75.495, 30.305] },
      { text: "Способ оплаты", rotate: 1, box: [118.488, 31.055] },
      { text: "Тип жилья", rotate: -1, box: [90.492, 30.566] },
      { text: "Район", rotate: -2, box: [65.972, 31.251] },
      { text: "Кол‑во комнат", rotate: 2, box: [114.943, 32.961] },
      { text: "Площадь", rotate: 2, box: [83.962, 31.879] },
      { text: "Этаж", rotate: -0.5, box: [58.251, 29.505] },
      { text: "Вид из окна", rotate: -1, box: [99.491, 30.723] },
      { text: "Балкон", rotate: -1, box: [71.495, 30.235] },
      { text: "Парковка", rotate: -1, box: [85.493, 30.479] },
      { text: "Соседи", rotate: -1, box: [71.495, 30.235] },
    ],
    line: dash("/assets/ff581.svg", 546.879),
  },
  {
    node: "1380:6873",
    image: {
      src: "/assets/3696d.webp",
      width: 1793,
      height: 1715,
      alt: "Стопка документов для ипотеки с печатью",
    },
    text: "Если планируете купить жилье в ипотеку,\nподготовим документы так, чтобы банк\nодобрил ее",
    line: dash("/assets/fadd0.svg", 563.381),
  },
  {
    node: "1380:6885",
    text: "Подберем объекты из нашей закрытой\nбазы, а также промониторим открытые\nисточники. Отсеем то, что вам не подходит,\nчтобы вы не тратили время на просмотр",
    funnel: {
      width: 272.86,
      height: 184.96,
      labels: [
        { text: "Далеко от работы", x: 62.17, y: 81.35, rotate: 61.45 },
        { text: "Шумные соседи", x: 139.97, y: 109.6, rotate: 83.85 },
        { text: "Идеальные варианты", x: 204.75, y: 66.07, rotate: -70.4 },
        { text: "Рядом стройка", x: 36.86, y: 135.37, rotate: 57.31 },
        { text: "Первый этаж", x: 236.19, y: 142.45, rotate: -52.78 },
      ],
      image: {
        src: "/assets/80e7e.webp",
        width: 1408,
        height: 2104,
        alt: "Воронка отбора объектов",
      },
      icon: { src: "/assets/5cf65.webp", width: 86, height: 34, alt: "" },
      result: "Идеальные варианты",
    },
    line: dash("/assets/d6751.svg", 876.43),
  },
  {
    node: "1380:6897",
    text: "Проверим подходящие объекты\nпо 52 параметрам — от долгов\nдо психического здоровья собственника",
    chips: [
      { text: "Залог", rotate: -1, box: [61.497, 30.06] },
      { text: "Наследство", rotate: 1, box: [97.491, 30.688] },
      { text: "Прописка", rotate: -1, box: [86.493, 30.496] },
      { text: "Банкротство", rotate: -2, box: [102.95, 32.542] },
      { text: "Аварийность дома", rotate: 2, box: [140.927, 33.868] },
      { text: "Арест", rotate: 2, box: [62.974, 31.146] },
      {
        text: "Психическое здоровье собственника",
        rotate: -0.5,
        box: [248.244, 31.163],
      },
      { text: "Пакет документов", rotate: -1, box: [137.485, 31.387] },
      { text: "И еще 43+ параметра", rotate: 2, box: [156.917, 34.427] },
    ],
    line: dash("/assets/bcfde.svg", 326.224),
  },
  {
    node: "1380:6910",
    image: {
      src: "/assets/3032e.webp",
      width: 2875,
      height: 1729,
      alt: "Карта с маршрутом просмотров отобранных объектов",
    },
    text: "Повозим вас по отобранным объектам\nили покажем их онлайн",
    line: dash("/assets/f761b.svg", 387.395),
  },
  {
    node: "1380:6928",
    text: "Договоримся вместо вас с продавцом\nо цене, мебели и сроках переезда",
    note: {
      text: "Весь процесс запишем на видео на всякий случай :)",
      icon: { src: "/assets/0e361.svg", width: 32, height: 32 },
    },
    line: dash("/assets/634e2.svg", 204),
  },
  {
    node: "1380:6941",
    image: {
      src: "/assets/4099d.webp",
      width: 2292,
      height: 1876,
      alt: "Предварительный договор и деньги на скрепке",
    },
    text: "Заключим предварительный договор. Цену\nи сроки переезда зафиксируем письменно,\nа не на словах. И только после этого вы\nвносите предоплату продавцу",
    line: dash("/assets/62fba.svg", 528.318),
  },
  {
    node: "1380:6952",
    text: "Отправим пакет документов в банк,\nчтобы оформить сделку",
    line: dash("/assets/583a1.svg", 114),
  },
  {
    node: "1380:6963",
    text: "Заключим основной договор, проведем\nрасчет, зарегистрируем право\nсобственности на ваше имя",
    line: dash("/assets/52b27.svg", 138),
  },
  {
    node: "1380:6976",
    image: {
      src: "/assets/ae81a.webp",
      width: 2760,
      height: 1762,
      alt: "Передача ключей от квартиры",
    },
    text: "Передадим вам ключи — сделка завершена",
  },
];
