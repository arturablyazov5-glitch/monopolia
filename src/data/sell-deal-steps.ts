import { siteText } from "./site-texts.mjs";
// Figma 1380:6187 — 11 шагов продажи; данные для общего DealSteps.
import type { DealStep } from "./deal-steps";

export const sellDealSteps: DealStep[] = [
  {
    node: "1380:6188",
    text: siteText("sell-deal-steps.text.1"),
    line: {
      src: "/assets/sell-steps-plan-connector.svg",
      height: 603.805,
    },
    image: {
      src: "/assets/property-sale-plan.webp",
      width: 2512,
      height: 1776,
      alt: "План продажи объекта: цели и документы",
    },
    chips: [
      {
        text: siteText("sell-deal-steps.text.2"),
        rotate: -1.0,
        box: [114.489, 30.985],
      },
      {
        text: siteText("sell-deal-steps.text.3"),
        rotate: 1.0,
        box: [131.486, 31.282],
      },
      {
        text: siteText("sell-deal-steps.text.4"),
        rotate: -1.0,
        box: [146.484, 31.544],
      },
      {
        text: siteText("sell-deal-steps.text.5"),
        rotate: -2.0,
        box: [114.943, 32.961],
      },
      {
        text: siteText("sell-deal-steps.text.6"),
        rotate: 2.0,
        box: [185.899, 35.439],
      },
      {
        text: siteText("sell-deal-steps.text.7"),
        rotate: 2.0,
        box: [96.954, 32.333],
      },
      {
        text: siteText("sell-deal-steps.text.8"),
        rotate: -0.5,
        box: [155.247, 30.352],
      },
      {
        text: siteText("sell-deal-steps.text.9"),
        rotate: -1.0,
        box: [185.478, 32.224],
      },
    ],
  },
  {
    node: "1380:6199",
    text: siteText("sell-deal-steps.text.10"),
    line: {
      src: "/assets/sell-steps-object-details-connector.svg",
      height: 219.538,
    },
    chips: [
      {
        text: siteText("sell-deal-steps.text.11"),
        rotate: -1.0,
        box: [65.496, 30.13],
      },
      {
        text: siteText("sell-answers.text.5"),
        rotate: 1.0,
        box: [83.493, 30.444],
      },
      {
        text: siteText("sell-answers.text.3"),
        rotate: -1.0,
        box: [113.489, 30.968],
      },
      {
        text: siteText("sell-deal-steps.text.12"),
        rotate: -2.0,
        box: [84.961, 31.914],
      },
      {
        text: siteText("sell-deal-steps.text.13"),
        rotate: 2.0,
        box: [133.931, 33.624],
      },
      {
        text: siteText("sell-deal-steps.text.14"),
        rotate: 2.0,
        box: [92.956, 32.193],
      },
    ],
  },
  {
    node: "1380:6210",
    text: siteText("sell-deal-steps.text.15"),
    line: {
      src: "/assets/sell-steps-viewing-connector.svg",
      height: 335,
    },
    list: [
      siteText("sell-deal-steps.text.16"),
      siteText("sell-deal-steps.text.17"),
      siteText("sell-deal-steps.text.18"),
      siteText("sell-deal-steps.text.19"),
      siteText("sell-deal-steps.text.20"),
    ],
  },
  {
    node: "1380:6223",
    text: siteText("sell-deal-steps.text.21"),
    line: {
      src: "/assets/sell-steps-document-check-connector.svg",
      height: 643.347,
    },
    image: {
      src: "/assets/property-advertising-channels.webp",
      width: 2928,
      height: 1870,
      alt: "Реклама объекта через разные каналы",
    },
    list: [
      siteText("sell-deal-steps.text.22"),
      siteText("sell-deal-steps.text.23"),
      siteText("sell-deal-steps.text.24"),
      siteText("sell-deal-steps.text.25"),
      siteText("sell-deal-steps.text.26"),
    ],
  },
  {
    node: "1380:6226",
    text: siteText("sell-deal-steps.text.27"),
    line: {
      src: "/assets/sell-steps-house-viewing-connector.svg",
      height: 397.069,
    },
    image: {
      src: "/assets/property-viewing-house.webp",
      width: 2734,
      height: 1706,
      alt: "Показы дома потенциальным покупателям",
    },
  },
  {
    node: "1380:6239",
    text: "Проверим покупателя на платежеспособность и его документы (если в паспорте фамилия Долина — откажем). И даже возьмем справочку о том, что он психически здоров",
    line: {
      src: "/assets/sell-steps-advertising-connector.svg",
      height: 614.53,
    },
    image: {
      src: "/assets/transaction-buyer-documents.webp",
      width: 1992,
      height: 1920,
      alt: "Проверка документов покупателя",
    },
    textParts: [
      {
        text: siteText("sell-deal-steps.text.28") + " ",
        muted: false,
      },
      {
        text: siteText("sell-deal-steps.text.29"),
        muted: true,
      },
      {
        text: siteText("sell-deal-steps.text.30"),
        muted: false,
      },
    ],
  },
  {
    node: "1380:6257",
    text: siteText("sell-deal-steps.text.31"),
    line: {
      src: "/assets/transaction-step-final-connector.svg",
      height: 204,
    },
    note: {
      text: siteText("sell-deal-steps.text.32"),
      icon: {
        src: "/assets/icon-transaction-note.svg",
        width: 32,
        height: 32,
      },
    },
  },
  {
    node: "1380:6260",
    text: siteText("sell-deal-steps.text.33"),
    line: {
      src: "/assets/transaction-step-connector.svg",
      height: 528.318,
    },
    image: {
      src: "/assets/transaction-preliminary-contract.webp",
      width: 2292,
      height: 1876,
      alt: "Предварительный договор",
    },
  },
  {
    node: "1380:6271",
    text: siteText("deal-steps.text.27"),
    line: {
      src: "/assets/transaction-step-note-icon.svg",
      height: 114,
    },
  },
  {
    node: "1380:6282",
    text: siteText("sell-deal-steps.text.34"),
    line: {
      src: "/assets/transaction-documents-icon.svg",
      height: 138,
    },
  },
  {
    node: "1380:6295",
    text: siteText("sell-deal-steps.text.35"),
    image: {
      src: "/assets/transaction-money-and-keys.webp",
      width: 2281,
      height: 1929,
      alt: "Деньги и ключи после завершения сделки",
    },
  },
];
