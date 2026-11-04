import { siteText } from "./site-texts.mjs";

export type QuizVariant = "buy" | "sell";

// Shared by the first screen and the dialog; answers belong to each instance.
interface QuizIntro {
  formText: string;
  image: { src: string; ratio: string; width: number; height: number; alt: string; mobile?: string };
  shadow: { src: string; left: number; top: number; width: number; height: number; bleed: string };
}
export const heroQuiz: Record<QuizVariant, QuizIntro> = {
  buy: {
    formText: siteText("buy.formtext.4"),
    image: {
      src: "/assets/buyer-catalog-booklet.webp",
      ratio: "2055 / 1531",
      width: 1024,
      height: 248.454,
      alt: "Пример подборки объектов Монополии",
      mobile: "/assets/buyer-catalog-booklet-640w.webp",
    },
    shadow: {
      src: "buy-catalog-quiz-shadow.svg",
      left: 20.5,
      top: 29.5,
      width: 303,
      height: 185,
      bleed: "-36.52% -15.61% -36.28% -31.99%",
    },
  },
  sell: {
    formText: siteText("sell.formtext.6"),
    image: {
      src: "/assets/buy-quiz-booklet-shadow.webp",
      ratio: "1081 / 812",
      width: 1081,
      height: 250.368,
      alt: "Пример анкеты объекта и базы покупателей",
    },
    shadow: {
      src: "sell-quiz-booklet-shadow.svg",
      left: 30.5,
      top: 15.5,
      width: 300,
      height: 191,
      bleed: "-35.4% -15.91% -35.38% -32.33%",
    },
  },
};
