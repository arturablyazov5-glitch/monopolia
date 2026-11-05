export type PersonId =
  | "aleksandra-barkovskaya"
  | "evgeniya-matukhnova"
  | "darya-shport"
  | "elena-murashkina"
  | "tatyana-savchenko"
  | "pavel-barkovsky"
  | "ekaterina-korneeva"
  | "tatyana-tsmokanich"
  | "anna-stetsenko"
  | "viktoriya-kuznetsova"
  | "karina-basova"
  | "nina-karakulina"
  | "anastasiya-medvedeva"
  | "elena-gorbaneva"
  | "ekaterina-mikhaylenko"
  | "dana-gurova"
  | "elena-sidelina";
export interface Person {
  name: string;
  role: string;
}
export const people: Record<PersonId, Person>;
