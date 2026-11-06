import { people, type PersonId } from "./people.mjs";

export interface Staff {
  id: PersonId;
  name: string;
  role: string;
  badge: string;
  badgeTextWidth: number;
  facts: string[];
  certificate?: string;
  image?: string;
  variant?: string;
}

export const staff: Staff[] = [
  {
    id: "aleksandra-barkovskaya",
    ...people["aleksandra-barkovskaya"],
    badgeTextWidth: 9.08,
    badge: "Доведет любую сделку по результата",
    image: "/assets/staff-aleksandra-barkovskaya.webp",
    certificate: "Nº POCC RU РГР TOC 27.01AH Nº01043",
    facts: [
      "5 лет опыта работы",
      "Закрыла первую сделку через 4 дня после начала работы",
      "Сама освоила профессиональную съемку, чтобы ваш объект выглядел как конфетка",
    ],
  },
  {
    id: "evgeniya-matukhnova",
    ...people["evgeniya-matukhnova"],
    badgeTextWidth: 7.08,
    badge: "Самый душный юрист в области",
    image: "/assets/staff-evgeniya-matukhnova.webp",
    variant: "team-lawyer",
    facts: [
      "2 года опыта работы",
      "Работала в МФЦ и знает все нюансы оформления документов",
      "Нашла в договоре покупателя ошибку, которая могла стоить клиенту 50 млн ₽",
    ],
  },
  {
    id: "darya-shport",
    ...people["darya-shport"],
    badgeTextWidth: 9.85,
    badge: "Учила школьников — теперь учит риелторов",
    certificate: "Nº POCC RU РГР TOC 27.01AH Nº01045",
    image: "/assets/staff-darya-shport.webp",
    variant: "team-trainer",
    facts: [
      "3 года опыта работы",
      "Обучает стажеров и помогает им вырасти до самостоятельных специалистов",
      "Лично помогает агентам разруливать сложные сделки",
    ],
  },

  {
    id: "elena-murashkina",
    ...people["elena-murashkina"],
    badgeTextWidth: 9.68,
    badge: "Проверяет объект так, будто покупает себе",
    image: "/assets/staff-elena-murashkina.webp",
    facts: [
      "5 лет опыта работы",
      "Лично обучила двух стажеров до уровня специалистов",
      "По образованию медик — сохраняет спокойствие в любых ситуациях",
    ],
  },
  {
    id: "tatyana-savchenko",
    ...people["tatyana-savchenko"],
    badgeTextWidth: 9.64,
    badge: "150+ закрытых сделок",
    image: "/assets/staff-tatyana-savchenko.webp",
    facts: [
      "4 года опыта работы",
      "Продает даже сложную недвижимость на 15‑20% дороже рыночной стоимости",
      "Замечает скрытые риски объекта в первые 10 минут просмотра",
    ],
  },
  {
    id: "pavel-barkovsky",
    ...people["pavel-barkovsky"],
    badgeTextWidth: 11.25,
    badge: "Знает, как купить выгодно и продать дорого",
    image: "/assets/staff-pavel-barkovsky.webp",
    facts: [
      "4 года опыта работы",
      "Досконально анализирует ситуацию, чтобы понять, что человеку нужно на самом деле",
      "Превращает сложный процесс покупки жилья в понятный и безопасный алгоритм",
    ],
  },
  {
    id: "ekaterina-korneeva",
    ...people["ekaterina-korneeva"],
    badgeTextWidth: 10.74,
    badge: "Найдет ваше место силы",
    image: "/assets/staff-ekaterina-korneeva.webp",
    facts: [
      "4 года опыта работы",
      "Спортивная закалка помогает довести сделку до конца, даже если переговоры затянулись",
      "Бывший учитель — проверяет документы как контрольную, ошибку не пропустит",
    ],
  },
  {
    id: "tatyana-tsmokanich",
    ...people["tatyana-tsmokanich"],
    badgeTextWidth: 11.25,
    badge: "Договорится с кем‑угодно и о чем угодно",
    certificate: "Nº POCC RU РГР TOC 27.01AH Nº01046",
    image: "/assets/staff-tatyana-tsmokanich.webp",
    facts: [
      "3 года опыта работы",
      "Выбьет для вас выгодные условия на любой объект",
      "Сопроводит на всех этапах — от подбора варианта до оформления сделки",
    ],
  },
  {
    id: "anna-stetsenko",
    ...people["anna-stetsenko"],
    badgeTextWidth: 7.15,
    badge: "Посчитает вашу выгоду до рубля",
    certificate: "Nº POCC RU РГР TOC 27.01AH Nº01044",
    image: "/assets/staff-anna-stetsenko.webp",
    facts: [
      "1,5 года опыта работы",
      "До сделки посчитает все расходы и покажет, сколько вы реально сэкономите",
      "Сложная сделка ее точно не испугает — справляется с тремя детьми",
    ],
  },
  {
    id: "viktoriya-kuznetsova",
    ...people["viktoriya-kuznetsova"],
    badgeTextWidth: 8.27,
    badge: "Работала в банке и знает все лазейки",
    image: "/assets/staff-viktoriya-kuznetsova.webp",
    facts: [
      "1,5 года опыта работы",
      "Знает ипотечные и семейные программы изнутри — подберет для вас самую выгодную",
      "Не упустит ни одной мелочи в документах за счет опыта работы инженером",
    ],
  },
  {
    id: "karina-basova",
    ...people["karina-basova"],
    badgeTextWidth: 12.08,
    badge: "Разбирается в юридических рисках объекта",
    image: "/assets/staff-karina-basova.webp",
    facts: [
      "1,5 года опыта работы",
      "Получает высшее юридическое образование параллельно с работой",
      "Помогает избежать юридических ошибок, скрытых комиссий и затягивания сроков",
    ],
  },
  {
    id: "nina-karakulina",
    ...people["nina-karakulina"],
    badgeTextWidth: 12.7,
    badge: "Знает, что нужно именно вам",
    image: "/assets/staff-nina-karakulina.webp",
    facts: [
      "1 год опыта работы",
      "Знает рынок недвижимости и находит топовые объекты до их выхода в продажу",
      "Подбирает объекты под реальные потребности и образ жизни клиента",
    ],
  },
  {
    id: "anastasiya-medvedeva",
    ...people["anastasiya-medvedeva"],
    badgeTextWidth: 5.97,
    badge: "На связи 24/7",
    image: "/assets/staff-anastasiya-medvedeva.webp",
    facts: [
      "8 месяцев опыта работы",
      "Помогает выгодно продавать и безопасно покупать недвижимость",
      "Ценит ваше время — все вопросы с документами и ипотекой берет на себя",
    ],
  },
  {
    id: "elena-gorbaneva",
    ...people["elena-gorbaneva"],
    badgeTextWidth: 8.99,
    badge: "Обращает внимание на любые мелочи",
    image: "/assets/staff-elena-gorbaneva.webp",
    facts: [
      "7 месяцев опыта работы",
      "По образованию инженер — подходит к сделке системно, шаг за шагом",
      "Помогает людям находить дом своей мечты без стресса и скрытых рисков",
    ],
  },
  {
    id: "ekaterina-mikhaylenko",
    ...people["ekaterina-mikhaylenko"],
    badgeTextWidth: 10.84,
    badge: "Знает, о чем вы мечтаете",
    image: "/assets/staff-ekaterina-mikhaylenko.webp",
    facts: [
      "4 месяца опыта работы",
      "Экономит ваше время — берет на себя поиск, проверки и показы",
      "Остается на связи даже после сделки, если вопросы возникнут уже после переезда",
    ],
  },
  {
    id: "dana-gurova",
    ...people["dana-gurova"],
    badgeTextWidth: 10.18,
    badge: "Решает все оргвопросы",
    image: "/assets/staff-dana-gurova.webp",
    facts: [
      "1,5 месяца опыта работы",
      "Отвечает за закупки, встречи и все организационные вопросы агентства",
      "Помогает подбирать новых специалистов вместе с руководителем",
    ],
  },
];
