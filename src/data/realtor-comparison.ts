import { siteText } from "./site-texts.mjs";
// Строки сравнения «Самостоятельно / С риелтором» (Figma 1380:6996–7002,
// «Покупка»). Для ComparisonTable variant="risk"; risk — шкала 1–5 из макета.
const rows = [
  {
    node: "1380:6996",
    label: siteText("sell-realtor-comparison.label.1"),
    risk: 1,
    others:
      siteText("realtor-comparison.others.8"),
    ours: siteText("realtor-comparison.ours.9"),
  },
  {
    node: "1380:6997",
    label: siteText("realtor-comparison.label.10"),
    risk: 5,
    others:
      siteText("realtor-comparison.others.11"),
    ours: siteText("realtor-comparison.ours.12"),
  },
  {
    node: "1380:6998",
    label: siteText("realtor-comparison.label.13"),
    risk: 5,
    others:
      siteText("realtor-comparison.others.14"),
    ours: siteText("realtor-comparison.ours.15"),
  },
  {
    node: "1380:6999",
    label: siteText("sell-realtor-comparison.label.7"),
    risk: 5,
    others:
      siteText("realtor-comparison.others.16"),
    ours: siteText("sell-realtor-comparison.ours.9"),
  },
  {
    node: "1380:7000",
    label: siteText("sell-realtor-comparison.label.13"),
    risk: 4,
    others:
      siteText("realtor-comparison.others.17"),
    ours: siteText("realtor-comparison.ours.18"),
  },
  {
    node: "1380:7001",
    label: siteText("realtor-comparison.label.19"),
    risk: 3,
    others:
      siteText("realtor-comparison.others.20"),
    ours: siteText("realtor-comparison.ours.21"),
  },
  {
    node: "1380:7002",
    label: siteText("realtor-comparison.label.22"),
    risk: 5,
    others:
      siteText("realtor-comparison.others.23"),
    ours: siteText("realtor-comparison.ours.24"),
  },
];

export const buyRealtorComparison = rows;
