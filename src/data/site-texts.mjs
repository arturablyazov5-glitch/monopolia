import { people } from "./people.mjs";

// TASK-081: stable IDs; defaults are the existing copy. Do not regenerate IDs.
export const siteTexts = [
  {
    "id": "site-layout.text.4",
    "page": "Общие блоки",
    "block": "site-layout",
    "label": "Перейти к содержимому",
    "defaultValue": "Перейти к содержимому",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "lead-form.title.1",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Остались вопросы? Задайте их здесь",
    "defaultValue": "Остались вопросы?\nЗадайте их здесь",
    "maxLength": 200,
    "multiline": true,
    "lines": 2
  },
  {
    "id": "lead-form.buttonlabel.2",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Задать вопрос",
    "defaultValue": "Задать вопрос",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "lead-form.buttonlabel.3",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Оставить заявку",
    "defaultValue": "Оставить заявку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "lead-form.text.4",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Ваш вопрос",
    "defaultValue": "Ваш вопрос",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "lead-form.text.6",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Телефон",
    "defaultValue": "Телефон",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "lead-form.text.7",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Или свяжитесь",
    "defaultValue": "Или свяжитесь",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "lead-form.text.8",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "с нами сами",
    "defaultValue": "с нами сами",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-header.label.1",
    "page": "Общие блоки",
    "block": "site-header",
    "label": "Хочу продать",
    "defaultValue": "Хочу продать",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-header.label.2",
    "page": "Общие блоки",
    "block": "site-header",
    "label": "Хочу купить",
    "defaultValue": "Хочу купить",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-header.label.3",
    "page": "Общие блоки",
    "block": "site-header",
    "label": "Кейсы",
    "defaultValue": "Кейсы",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-header.text.4",
    "page": "Общие блоки",
    "block": "site-header",
    "label": "Агентство недвижимости с 2006 года",
    "defaultValue": "Агентство недвижимости с 2006 года",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-header.text.5",
    "page": "Общие блоки",
    "block": "site-header",
    "label": "Пн‑Пт 09:00‑18:00",
    "defaultValue": "Пн‑Пт 09:00‑18:00",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-nav.label.1",
    "page": "Общие блоки",
    "block": "site-nav",
    "label": "Купить недвижимость",
    "defaultValue": "Купить недвижимость",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-nav.label.2",
    "page": "Общие блоки",
    "block": "site-nav",
    "label": "Продать недвижимость",
    "defaultValue": "Продать недвижимость",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-nav.label.3",
    "page": "Общие блоки",
    "block": "site-nav",
    "label": "Отзывы",
    "defaultValue": "Отзывы",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-nav.label.4",
    "page": "Общие блоки",
    "block": "site-nav",
    "label": "Команда",
    "defaultValue": "Команда",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-nav.label.5",
    "page": "Общие блоки",
    "block": "site-nav",
    "label": "Услуги",
    "defaultValue": "Услуги",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-nav.label.6",
    "page": "Общие блоки",
    "block": "site-nav",
    "label": "Для соискателей",
    "defaultValue": "Для соискателей",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-nav.label.7",
    "page": "Общие блоки",
    "block": "site-nav",
    "label": "Вопрос‑ответ",
    "defaultValue": "Вопрос‑ответ",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "consent.text.1",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Согласие: начало",
    "defaultValue": "Я согласен(а) на",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "consent.text.2",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Согласие: обработка данных",
    "defaultValue": "обработку персональных данных",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "consent.text.3",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Согласие: середина",
    "defaultValue": "и принимаю",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "consent.text.4",
    "page": "Общие блоки",
    "block": "lead-form",
    "label": "Согласие: политика",
    "defaultValue": "политику конфиденциальности",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.1",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "ИП Сиделина Елена Юрьевна",
    "defaultValue": "ИП Сиделина Елена Юрьевна",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.2",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "ИНН: 280403620684",
    "defaultValue": "ИНН: 280403620684",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.3",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "ОГРНИП: 316280100058921",
    "defaultValue": "ОГРНИП: 316280100058921",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.4",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "Адрес: 676805, Амурская область, г. Белогорск, ул. Ленина, д. 48",
    "defaultValue": "Адрес: 676805, Амурская область, г. Белогорск, ул. Ленина, д. 48",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.5",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "Политика конфиденциальности",
    "defaultValue": "Политика конфиденциальности",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.6",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "Согласие на",
    "defaultValue": "Согласие на",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.7",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "обработку персональных данных",
    "defaultValue": "обработку персональных данных",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.8",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "Пн‑Пт с 09:00 до 18:00",
    "defaultValue": "Пн‑Пт с 09:00 до 18:00",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.9",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "Сб с 10:00 до 15:00",
    "defaultValue": "Сб с 10:00 до 15:00",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.10",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "Свяжитесь",
    "defaultValue": "Свяжитесь",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.11",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "с нами",
    "defaultValue": "с нами",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.12",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "Подписывайтесь",
    "defaultValue": "Подписывайтесь",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.13",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "на наши соцсети",
    "defaultValue": "на наши соцсети",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.14",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "Meta Platforms Inc. признана экстремистской организацией в России",
    "defaultValue": "Meta Platforms Inc. признана экстремистской организацией в России",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "site-footer.text.15",
    "page": "Общие блоки",
    "block": "site-footer",
    "label": "© Все права защищены, 2026",
    "defaultValue": "© Все права защищены, 2026",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.18",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "недвижимости",
    "defaultValue": "недвижимости",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-hero.text.1",
    "page": "Главная",
    "block": "home-hero",
    "label": "Агентство",
    "defaultValue": "Агентство",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-hero.text.2",
    "page": "Главная",
    "block": "home-hero",
    "label": "Контора",
    "defaultValue": "Контора",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-hero.text.3",
    "page": "Главная",
    "block": "home-hero",
    "label": "недвижимости",
    "defaultValue": "недвижимости",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-hero.text.4",
    "page": "Главная",
    "block": "home-hero",
    "label": "с 2006 года",
    "defaultValue": "с 2006 года",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-hero.text.5",
    "page": "Главная",
    "block": "home-hero",
    "label": "Поможем выгодно купить или срочно продать квартиру,",
    "defaultValue": "Поможем выгодно купить или срочно продать квартиру,",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-hero.text.6",
    "page": "Главная",
    "block": "home-hero",
    "label": "дом или коммерческую недвижимость",
    "defaultValue": "дом или коммерческую недвижимость",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-hero.label.7",
    "page": "Главная",
    "block": "home-hero",
    "label": "Купить объект",
    "defaultValue": "Купить объект",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-hero.label.8",
    "page": "Главная",
    "block": "home-hero",
    "label": "Продать объект",
    "defaultValue": "Продать объект",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buyer-audience.text.1",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": "А что если я скажу,",
    "defaultValue": "А что если я скажу,",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buyer-audience.text.2",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": "что",
    "defaultValue": "что",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buyer-audience.text.3",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": "1 500 человек",
    "defaultValue": "1 500 человек",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buyer-audience.text.4",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": "хотят купить вашу",
    "defaultValue": "хотят купить вашу",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buyer-audience.text.5",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": "недвижимость уже",
    "defaultValue": "недвижимость уже",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buyer-audience.text.6",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": "сейчас?",
    "defaultValue": "сейчас?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buyer-audience.text.7",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": "В нашей базе только проверенные потенциальные покупатели",
    "defaultValue": "В нашей базе только проверенные потенциальные покупатели",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buyer-audience.text.8",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": "с наличкой или с предодобренной ипотекой",
    "defaultValue": "с наличкой или с предодобренной ипотекой",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buyer-audience.text.9",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": ". Они готовы в ближайшее время купить квартиру, дом или помещение для бизнеса",
    "defaultValue": ". Они готовы в ближайшее время купить квартиру, дом или помещение для бизнеса",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "buyer-audience.label.10",
    "page": "Покупка",
    "block": "buyer-audience",
    "label": "Найти покупателя",
    "defaultValue": "Найти покупателя",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "fast-sale.text.1",
    "page": "Общие блоки",
    "block": "fast-sale",
    "label": "Недавно мы продали",
    "defaultValue": "Недавно мы продали",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "fast-sale.text.2",
    "page": "Общие блоки",
    "block": "fast-sale",
    "label": "квартиру за",
    "defaultValue": "квартиру за",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "fast-sale.text.3",
    "page": "Общие блоки",
    "block": "fast-sale",
    "label": "3 часа",
    "defaultValue": "3 часа",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "fast-sale.text.4",
    "page": "Общие блоки",
    "block": "fast-sale",
    "label": "которую другое агентство",
    "defaultValue": "которую другое агентство",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "fast-sale.text.5",
    "page": "Общие блоки",
    "block": "fast-sale",
    "label": "не могло продать за год",
    "defaultValue": "не могло продать за год",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "fast-sale.text.6",
    "page": "Общие блоки",
    "block": "fast-sale",
    "label": "А среднее время продажи",
    "defaultValue": "А среднее время продажи",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "fast-sale.text.7",
    "page": "Общие блоки",
    "block": "fast-sale",
    "label": "объектов в Монополии —",
    "defaultValue": "объектов в Монополии —",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "fast-sale.text.8",
    "page": "Общие блоки",
    "block": "fast-sale",
    "label": "2 недели",
    "defaultValue": "2 недели",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.checks.1",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Залог",
    "defaultValue": "Залог",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.checks.2",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Наследство",
    "defaultValue": "Наследство",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.checks.3",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Прописка",
    "defaultValue": "Прописка",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.checks.4",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Банкротство",
    "defaultValue": "Банкротство",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.checks.5",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Аварийность дома",
    "defaultValue": "Аварийность дома",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.checks.6",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Арест",
    "defaultValue": "Арест",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.checks.7",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Психическое здоровье собственника",
    "defaultValue": "Психическое здоровье собственника",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.checks.8",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Пакет документов",
    "defaultValue": "Пакет документов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.checks.9",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "И еще 43+ параметра",
    "defaultValue": "И еще 43+ параметра",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.text.10",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "А если вы хотите купить недвижку —",
    "defaultValue": "А если вы хотите купить недвижку —",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.text.11",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "у нас есть",
    "defaultValue": "у нас есть",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.text.12",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "800+ объектов",
    "defaultValue": "800+ объектов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.text.13",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "в закрытой базе,",
    "defaultValue": "в закрытой базе,",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.text.14",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "которых нет на",
    "defaultValue": "которых нет на",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.text.15",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Авито",
    "defaultValue": "Авито",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.text.16",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Циан",
    "defaultValue": "Циан",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.text.17",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Каждый проверили по 52 параметрам,",
    "defaultValue": "Каждый проверили по 52 параметрам,",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.text.18",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "чтобы исключить все риски при оформлении сделки",
    "defaultValue": "чтобы исключить все риски при оформлении сделки",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "private-catalog.label.19",
    "page": "Общие блоки",
    "block": "private-catalog",
    "label": "Получить доступ к базе",
    "defaultValue": "Получить доступ к базе",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "certificates.text.1",
    "page": "Общие блоки",
    "block": "certificates",
    "label": "Маткапитал, СВО‑выплаты и сертификаты",
    "defaultValue": "Маткапитал, СВО‑выплаты и сертификаты",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "certificates.text.2",
    "page": "Общие блоки",
    "block": "certificates",
    "label": "работаем со всем",
    "defaultValue": "работаем со всем",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "certificates.label.3",
    "page": "Общие блоки",
    "block": "certificates",
    "label": "Получить консультацию",
    "defaultValue": "Получить консультацию",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "certificates.text.4",
    "page": "Общие блоки",
    "block": "certificates",
    "label": "Знаем все законные лазейки — запишитесь на бесплатную консультацию",
    "defaultValue": "Знаем все законные лазейки — запишитесь на бесплатную консультацию",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "equal-interests.text.1",
    "page": "Общие блоки",
    "block": "equal-interests",
    "label": "Любим одинаково и продавцов, и покупателей —",
    "defaultValue": "Любим одинаково и продавцов, и покупателей —",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "equal-interests.text.2",
    "page": "Общие блоки",
    "block": "equal-interests",
    "label": "поэтому отстаиваем их интересы тоже одинаково",
    "defaultValue": "поэтому отстаиваем их интересы тоже одинаково",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "honest-reviews.text.1",
    "page": "Общие блоки",
    "block": "honest-reviews",
    "label": "Развод на деньги,",
    "defaultValue": "Развод на деньги,",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "honest-reviews.text.2",
    "page": "Общие блоки",
    "block": "honest-reviews",
    "label": "нечестные агенты —",
    "defaultValue": "нечестные агенты —",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "honest-reviews.text.3",
    "page": "Общие блоки",
    "block": "honest-reviews",
    "label": "эти и другие отзывы",
    "defaultValue": "эти и другие отзывы",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "honest-reviews.text.4",
    "page": "Общие блоки",
    "block": "honest-reviews",
    "label": "мы удаляем",
    "defaultValue": "мы удаляем",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "honest-reviews.text.5",
    "page": "Общие блоки",
    "block": "honest-reviews",
    "label": "В Белогорске конкуренция",
    "defaultValue": "В Белогорске конкуренция",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "honest-reviews.text.6",
    "page": "Общие блоки",
    "block": "honest-reviews",
    "label": "не совсем честная",
    "defaultValue": "не совсем честная",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "honest-reviews.text.7",
    "page": "Общие блоки",
    "block": "honest-reviews",
    "label": ". К счастью площадки позволяют удалять заказные отзывы, жаль нельзя удалить неправдивые ",
    "defaultValue": ". К счастью площадки позволяют удалять заказные отзывы, жаль нельзя удалить неправдивые слухи",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "proven-trust.reviews.2",
    "page": "Общие блоки",
    "block": "proven-trust",
    "label": "206 отзывов",
    "defaultValue": "206 отзывов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "proven-trust.reviews.3",
    "page": "Общие блоки",
    "block": "proven-trust",
    "label": "164 отзыва",
    "defaultValue": "164 отзыва",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "proven-trust.reviews.4",
    "page": "Общие блоки",
    "block": "proven-trust",
    "label": "39 отзывов",
    "defaultValue": "39 отзывов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "proven-trust.text.5",
    "page": "Общие блоки",
    "block": "proven-trust",
    "label": "По факту за",
    "defaultValue": "По факту за",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "proven-trust.text.6",
    "page": "Общие блоки",
    "block": "proven-trust",
    "label": "сделок — у нас",
    "defaultValue": "сделок — у нас",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "proven-trust.text.7",
    "page": "Общие блоки",
    "block": "proven-trust",
    "label": "ни одного",
    "defaultValue": "ни одного",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "proven-trust.text.8",
    "page": "Общие блоки",
    "block": "proven-trust",
    "label": "суда и истории обмана",
    "defaultValue": "суда и истории обмана",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.object.1799-5356",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Объект: Александр П.",
    "defaultValue": "Дом с земельным участком в сельской местности, 154,8 м²",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.object.1947-4762",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Объект: Ирина В.",
    "defaultValue": "Дом с земельным участком",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.situation.1",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "8 месяцев пыталась продать квартиру сама",
    "defaultValue": "8 месяцев пыталась продать квартиру сама",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.situation.2",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Покупатели звонили, но не доходили до показов или пропадали после просмотра",
    "defaultValue": "Покупатели звонили, но не доходили до показов или пропадали после просмотра",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "client-cases.situation.3",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Один покупатель был готов выйти на сделку, но в последний момент начал сильно торговатьс",
    "defaultValue": "Один покупатель был готов выйти на сделку, но в последний момент начал сильно торговаться.",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "client-cases.actions.4",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Написали продающее объявление с акцентом на преимущества квартиры",
    "defaultValue": "Написали продающее объявление с акцентом на преимущества квартиры",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.actions.5",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Сняли профессиональный видеообзор квартиры, подъезда и двора",
    "defaultValue": "Сняли профессиональный видеообзор квартиры, подъезда и двора",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.actions.6",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Запустили продвижение объявления на целевые сегменты покупателей",
    "defaultValue": "Запустили продвижение объявления на целевые сегменты покупателей",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.actions.7",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Организовали показы в удобное для покупателей время",
    "defaultValue": "Организовали показы в удобное для покупателей время",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.actions.8",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Все переговоры взяли на себя и защитили цену объекта",
    "defaultValue": "Все переговоры взяли на себя и защитили цену объекта",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.person.9",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Имя",
    "defaultValue": "Имя",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.object.10",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "2‑х комнатная квартира, 55 м², 3/5 этажей",
    "defaultValue": "2‑х комнатная квартира, 55 м², 3/5 этажей",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.result.11",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "8 месяцев безрезультатных попыток продать квартиру самостоятельно. С Монополией вышла на",
    "defaultValue": "8 месяцев безрезультатных попыток продать квартиру самостоятельно. С Монополией вышла на сделку за 7 дней и продала квартиру на 270 000 ₽ дороже, чем планировала",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "client-cases.object.12",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Здесь будет кейс 2",
    "defaultValue": "Здесь будет кейс 2",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.result.13",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Текст",
    "defaultValue": "Текст",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.situation.14",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Описание ситуации",
    "defaultValue": "Описание ситуации",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.actions.15",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Описание действия",
    "defaultValue": "Описание действия",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.object.17",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Здесь будет кейс 3",
    "defaultValue": "Здесь будет кейс 3",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.text.18",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Даже когда кажется, что",
    "defaultValue": "Даже когда кажется, что",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.text.19",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "выхода нет — находим решение",
    "defaultValue": "выхода нет — находим решение",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.text.20",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Читайте кейсы",
    "defaultValue": "Читайте кейсы",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.options.21",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Помогли продать",
    "defaultValue": "Помогли продать",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.options.22",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Помогли купить",
    "defaultValue": "Помогли купить",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.options.23",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Помогли отжать",
    "defaultValue": "Помогли отжать",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.text.24",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Объект:",
    "defaultValue": "Объект:",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.title.25",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Ситуация клиента:",
    "defaultValue": "Ситуация клиента:",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.title.26",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Что было сделано:",
    "defaultValue": "Что было сделано:",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.text.27",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Сделка сорвалась",
    "defaultValue": "Сделка сорвалась",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.label.28",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Записаться на консультацию",
    "defaultValue": "Записаться на консультацию",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "client-cases.text.30",
    "page": "Общие блоки",
    "block": "client-cases",
    "label": "Кейсы этой категории пока не добавлены.",
    "defaultValue": "Кейсы этой категории пока не добавлены.",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.stats.1",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "20 лет",
    "defaultValue": "20 лет",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.stats.2",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "на рынке в Белогорске",
    "defaultValue": "на рынке в Белогорске",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.stats.3",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "и Амурской области",
    "defaultValue": "и Амурской области",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.stats.4",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "клиентов и ни одного",
    "defaultValue": "клиентов и ни одного",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.stats.5",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "судебного спора",
    "defaultValue": "судебного спора",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.stats.6",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "сделок в год — одна",
    "defaultValue": "сделок в год — одна",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.stats.7",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "каждый рабочий день",
    "defaultValue": "каждый рабочий день",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.8",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "Суперагент",
    "defaultValue": "Суперагент",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.9",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "Надежный партнер",
    "defaultValue": "Надежный партнер",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.10",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "Монополия — название,",
    "defaultValue": "Монополия — название,",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.11",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "на которое вдохновила",
    "defaultValue": "на которое вдохновила",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.12",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "нас игра",
    "defaultValue": "нас игра",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.13",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "Белогорская компания с Московским уровнем сервиса, потому что клиенты в маленьком городе",
    "defaultValue": "Белогорская компания с Московским уровнем сервиса, потому что клиенты в маленьком городе заслуживают не меньше",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "company-about.text.14",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "40% клиентов возвращаются к нам снова, еще 40% приходят по рекомендациям, а",
    "defaultValue": "40% клиентов возвращаются к нам снова, еще 40% приходят по рекомендациям, а",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "company-about.text.15",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "конкуренты направляют к нам",
    "defaultValue": "конкуренты направляют к нам",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.16",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "сложные сделки",
    "defaultValue": "сложные сделки",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.17",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "Скачать презентацию компании",
    "defaultValue": "Скачать презентацию компании",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.18",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "Познакомимся поближе, чтобы вы знали, кому платите комиссию :)",
    "defaultValue": "Познакомимся поближе, чтобы вы знали, кому платите комиссию :)",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-about.text.19",
    "page": "Общие блоки",
    "block": "company-about",
    "label": "Презентация компании пока не добавлена.",
    "defaultValue": "Презентация компании пока не добавлена.",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-guild.text.1",
    "page": "Общие блоки",
    "block": "company-guild",
    "label": "Входим в Российскую",
    "defaultValue": "Входим в Российскую",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-guild.text.2",
    "page": "Общие блоки",
    "block": "company-guild",
    "label": "и Дальневосточную",
    "defaultValue": "и Дальневосточную",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-guild.text.3",
    "page": "Общие блоки",
    "block": "company-guild",
    "label": "гильдию риелторов",
    "defaultValue": "гильдию риелторов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-guild.text.4",
    "page": "Общие блоки",
    "block": "company-guild",
    "label": "Это как звезда Мишлен, но только",
    "defaultValue": "Это как звезда Мишлен, но только",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-guild.text.5",
    "page": "Общие блоки",
    "block": "company-guild",
    "label": "вместо повара —",
    "defaultValue": "вместо повара —",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-guild.text.6",
    "page": "Общие блоки",
    "block": "company-guild",
    "label": "риелтор",
    "defaultValue": "риелтор",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "company-guild.text.7",
    "page": "Общие блоки",
    "block": "company-guild",
    "label": "Гильдия следит за тем, чтобы агенты работали по кодексу этики и единым стандартам",
    "defaultValue": "Гильдия следит за тем, чтобы агенты работали по кодексу этики и единым стандартам",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "office-expansion.text.1",
    "page": "Общие блоки",
    "block": "office-expansion",
    "label": "Мы добрались до Благовещенска",
    "defaultValue": "Мы добрались до Благовещенска",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-expansion.text.2",
    "page": "Общие блоки",
    "block": "office-expansion",
    "label": "— открываем второй офис",
    "defaultValue": "— открываем второй офис",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-expansion.text.3",
    "page": "Общие блоки",
    "block": "office-expansion",
    "label": "Благовещенск",
    "defaultValue": "Благовещенск",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-expansion.text.4",
    "page": "Общие блоки",
    "block": "office-expansion",
    "label": "Скоро",
    "defaultValue": "Скоро",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-expansion.text.5",
    "page": "Общие блоки",
    "block": "office-expansion",
    "label": "Фото офиса",
    "defaultValue": "Фото офиса",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-partners.text.1",
    "page": "Главная",
    "block": "home-partners",
    "label": "Наши партнеры",
    "defaultValue": "Наши партнеры",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-partners.text.2",
    "page": "Главная",
    "block": "home-partners",
    "label": "И еще 90+ партнеров",
    "defaultValue": "И еще 90+ партнеров",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "director-invitation.text.1",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "Лично провела",
    "defaultValue": "Лично провела",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "director-invitation.text.2",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "сделок, которые научили",
    "defaultValue": "сделок, которые научили",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "director-invitation.text.3",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "видеть скрытые риски",
    "defaultValue": "видеть скрытые риски",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "director-invitation.text.4",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "Здравствуйте, я Елена Сиделина. Сегодня мое агентство входит",
    "defaultValue": "Здравствуйте, я Елена Сиделина. Сегодня мое агентство входит",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "director-invitation.text.5",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "в ТОП‑3 рейтинга Домклик в Белогорске",
    "defaultValue": "в ТОП‑3 рейтинга Домклик в Белогорске",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "director-invitation.text.6",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "За 8 лет я лично провела более 3 000 сделок как юрист‑практик и поняла, что в недвижимос",
    "defaultValue": "За 8 лет я лично провела более 3 000 сделок как юрист‑практик и поняла, что в недвижимости нет типовых сделок. У каждого объекта свои риски и нюансы, которые не видны на первый взгляд",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "director-invitation.text.7",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "Приглашаю вас в офис. Познакомимся за чашечкой кофе, разберем ситуацию и дадим",
    "defaultValue": "Приглашаю вас в офис. Познакомимся за чашечкой кофе, разберем ситуацию и дадим",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "director-invitation.text.8",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "рекомендации под ваш случай",
    "defaultValue": "рекомендации под ваш случай",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "director-invitation.label.9",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "Хочу в офис на кофеек",
    "defaultValue": "Хочу в офис на кофеек",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "director-invitation.text.10",
    "page": "Общие блоки",
    "block": "director-invitation",
    "label": "Это бесплатно и без обязательств, но сэкономит вам месяцы и сотни тысяч или даже миллион",
    "defaultValue": "Это бесплатно и без обязательств, но сэкономит вам месяцы и сотни тысяч или даже миллионы рублей на предотвращении ошибок",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "blockbuster-case.text.1",
    "page": "Общие блоки",
    "block": "blockbuster-case",
    "label": "Случай‑блокбастер",
    "defaultValue": "Случай‑блокбастер",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "blockbuster-case.text.2",
    "page": "Общие блоки",
    "block": "blockbuster-case",
    "label": "Как чуть не сорвалась дистанционная продажа",
    "defaultValue": "Как чуть не сорвалась дистанционная продажа",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "blockbuster-case.text.3",
    "page": "Общие блоки",
    "block": "blockbuster-case",
    "label": "дома, пока владельца не было в городе",
    "defaultValue": "дома, пока владельца не было в городе",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "blockbuster-case.text.4",
    "page": "Общие блоки",
    "block": "blockbuster-case",
    "label": "Наша беременная Саша сама перенесла забор, чтобы ускорить регистрацию и не ждать владель",
    "defaultValue": "Наша беременная Саша сама перенесла забор, чтобы ускорить регистрацию и не ждать владельца. После подобных случаев нас часто называют дружочками‑пирожочками",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "blockbuster-case.text.5",
    "page": "Общие блоки",
    "block": "blockbuster-case",
    "label": "У вас забор на 2 метра вышел за границы. Сделки НЕ БУДЕТ!!!!!",
    "defaultValue": "У вас забор на 2 метра вышел за границы. Сделки НЕ БУДЕТ!!!!!",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "blockbuster-case.text.6",
    "page": "Общие блоки",
    "block": "blockbuster-case",
    "label": "Спокойно, я прямо сейчас все перенесу",
    "defaultValue": "Спокойно, я прямо сейчас все перенесу",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "speech-bubble.text.1",
    "page": "Общие блоки",
    "block": "speech-bubble",
    "label": "Клава, ты слыхала? Васька за квартиру просит годовой бюджет Белогорска",
    "defaultValue": "Клава, ты слыхала?\nВаська за квартиру просит\nгодовой бюджет Белогорска",
    "maxLength": 200,
    "multiline": true,
    "lines": 2
  },
  {
    "id": "home-team.text.1",
    "page": "Главная",
    "block": "home-team",
    "label": "В нашей команде 20+",
    "defaultValue": "В нашей команде 20+",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-team.text.2",
    "page": "Главная",
    "block": "home-team",
    "label": "специалистов по недвижимости",
    "defaultValue": "специалистов по недвижимости",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-team.text.3",
    "page": "Главная",
    "block": "home-team",
    "label": "ваших дружочков пирожочков",
    "defaultValue": "ваших дружочков пирожочков",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-team.text.4",
    "page": "Главная",
    "block": "home-team",
    "label": "Все они готовы в любое время и день недели показать объект или приехать в офис для оформ",
    "defaultValue": "Все они готовы в любое время и день недели показать объект или приехать в офис для оформления сделки.",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "home-team.text.5",
    "page": "Главная",
    "block": "home-team",
    "label": "Даже 1 января или в 12 часов ночи в субботу :)",
    "defaultValue": "Даже 1 января или в 12 часов ночи в субботу :)",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "staff-card.role.1",
    "page": "Общие блоки",
    "block": "staff-card",
    "label": "Юрист по сопровождению сделок",
    "defaultValue": people["evgeniya-matukhnova"].role,
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "staff-card.badge.2",
    "page": "Общие блоки",
    "block": "staff-card",
    "label": "Самый душный юрист в области",
    "defaultValue": "Самый душный юрист в области",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "staff-card.facts.3",
    "page": "Общие блоки",
    "block": "staff-card",
    "label": "2 года опыта работы",
    "defaultValue": "2 года опыта работы",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "staff-card.facts.4",
    "page": "Общие блоки",
    "block": "staff-card",
    "label": "Работала в МФЦ и знает все нюансы оформления документов",
    "defaultValue": "Работала в МФЦ и знает все нюансы оформления документов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "staff-card.facts.5",
    "page": "Общие блоки",
    "block": "staff-card",
    "label": "Нашла в договоре покупателя ошибку, которая могла стоить клиенту 50 млн ₽",
    "defaultValue": "Нашла в договоре покупателя ошибку, которая могла стоить клиенту 50 млн ₽",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "staff-card.text.6",
    "page": "Общие блоки",
    "block": "staff-card",
    "label": "Аттестат:",
    "defaultValue": "Аттестат:",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-telegram.text.1",
    "page": "Главная",
    "block": "home-telegram",
    "label": "Семейную ипотеку",
    "defaultValue": "Семейную ипотеку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-telegram.text.2",
    "page": "Главная",
    "block": "home-telegram",
    "label": "завтра отменят!",
    "defaultValue": "завтра отменят!",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-telegram.text.3",
    "page": "Главная",
    "block": "home-telegram",
    "label": "Лааадно, это ненастоящая новость, но такое не исключено",
    "defaultValue": "Лааадно, это ненастоящая новость, но такое не исключено",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-telegram.text.4",
    "page": "Главная",
    "block": "home-telegram",
    "label": "Чтобы не пропустить важное, подписывайтесь на наш Telegram",
    "defaultValue": "Чтобы не пропустить важное, подписывайтесь на наш Telegram",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-telegram.text.5",
    "page": "Главная",
    "block": "home-telegram",
    "label": "Квартиры и дома по цене ниже рынка до 30%",
    "defaultValue": "Квартиры и дома по цене ниже рынка до 30%",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-telegram.text.6",
    "page": "Главная",
    "block": "home-telegram",
    "label": "Важные новости про недвижку и ипотеку",
    "defaultValue": "Важные новости про недвижку и ипотеку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-telegram.text.7",
    "page": "Главная",
    "block": "home-telegram",
    "label": "Истории‑блокбастеры наших клиентов",
    "defaultValue": "Истории‑блокбастеры наших клиентов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-telegram.text.8",
    "page": "Главная",
    "block": "home-telegram",
    "label": "Полезные статьи о сложном простым языком",
    "defaultValue": "Полезные статьи о сложном простым языком",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-telegram.text.9",
    "page": "Главная",
    "block": "home-telegram",
    "label": "Подписаться на канал",
    "defaultValue": "Подписаться на канал",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.title.1",
    "page": "Главная",
    "block": "home-services",
    "label": "Помощь в одобрении ипотеки с вероятностью 91%",
    "defaultValue": "Помощь в одобрении ипотеки с вероятностью 91%",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.description.2",
    "page": "Главная",
    "block": "home-services",
    "label": "Подберем выгодную программу. Поможем собрать документы и подать заявки в банк",
    "defaultValue": "Подберем выгодную программу. Поможем собрать документы и подать заявки в банк",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "home-services.title.3",
    "page": "Главная",
    "block": "home-services",
    "label": "Оформление сделки купли‑продажи",
    "defaultValue": "Оформление сделки купли‑продажи",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.description.4",
    "page": "Главная",
    "block": "home-services",
    "label": "Проверим документы, проконтролируем процесс и доведем сделку до регистрации в Росреестре",
    "defaultValue": "Проверим документы, проконтролируем процесс и доведем сделку до регистрации в Росреестре",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "home-services.title.5",
    "page": "Главная",
    "block": "home-services",
    "label": "Юридическая проверка объекта или собственника",
    "defaultValue": "Юридическая проверка объекта или собственника",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.description.6",
    "page": "Главная",
    "block": "home-services",
    "label": "Проверяем риски на объекте: ограничения, долги, аресты, судебные споры и историю собстве",
    "defaultValue": "Проверяем риски на объекте: ограничения, долги, аресты, судебные споры и историю собственников",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "home-services.title.7",
    "page": "Главная",
    "block": "home-services",
    "label": "Оформление всех документов",
    "defaultValue": "Оформление всех документов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.description.8",
    "page": "Главная",
    "block": "home-services",
    "label": "Поможем оформить наследство, приватизацию, право собственности, перепланировку, реконстр",
    "defaultValue": "Поможем оформить наследство, приватизацию, право собственности, перепланировку, реконструкцию и т. д.",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "home-services.title.9",
    "page": "Главная",
    "block": "home-services",
    "label": "Оценка недвижимости",
    "defaultValue": "Оценка недвижимости",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.description.10",
    "page": "Главная",
    "block": "home-services",
    "label": "Сравним объект с аналогичными в том же районе, определим рыночную стоимость, позицию в р",
    "defaultValue": "Сравним объект с аналогичными в том же районе, определим рыночную стоимость, позицию в рейтинге предложений и срок продажи",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "home-services.title.11",
    "page": "Главная",
    "block": "home-services",
    "label": "Налоговое сопровождение",
    "defaultValue": "Налоговое сопровождение",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.description.12",
    "page": "Главная",
    "block": "home-services",
    "label": "Рассчитаем сумму налогов, поможем оформить 3‑НДФЛ и получить налоговый вычет до 13% стои",
    "defaultValue": "Рассчитаем сумму налогов, поможем оформить 3‑НДФЛ и получить налоговый вычет до 13% стоимости недвижимости",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "home-services.title.13",
    "page": "Главная",
    "block": "home-services",
    "label": "Подготовка объекта к заселению",
    "defaultValue": "Подготовка объекта к заселению",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.description.14",
    "page": "Главная",
    "block": "home-services",
    "label": "Подберем проверенных подрядчиков по ремонту, оформлению интерьера и клинингу. При необхо",
    "defaultValue": "Подберем проверенных подрядчиков по ремонту, оформлению интерьера и клинингу. При необходимости поможем с переездом",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "home-services.title.15",
    "page": "Главная",
    "block": "home-services",
    "label": "Аренда недвижимости",
    "defaultValue": "Аренда недвижимости",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.description.16",
    "page": "Главная",
    "block": "home-services",
    "label": "Подберем проверенных арендаторов или подходящие объекты для сдачи в аренду. Сопроводим с",
    "defaultValue": "Подберем проверенных арендаторов или подходящие объекты для сдачи в аренду. Сопроводим сделку до подписания договора",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "home-services.title.17",
    "page": "Главная",
    "block": "home-services",
    "label": "Страхование",
    "defaultValue": "Страхование",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.description.18",
    "page": "Главная",
    "block": "home-services",
    "label": "Поможем застраховать объект недвижимости, автомобиль и личные риски, включая несчастные ",
    "defaultValue": "Поможем застраховать объект недвижимости, автомобиль и личные риски, включая несчастные случаи",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "home-services.text.19",
    "page": "Главная",
    "block": "home-services",
    "label": "Один визит к нам вместо часовых очередей в разных кабинетах",
    "defaultValue": "Один визит к нам вместо часовых очередей в разных кабинетах",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-services.text.20",
    "page": "Главная",
    "block": "home-services",
    "label": "Все вопросы решаем в одном окне — от подбора ипотеки до приватизации",
    "defaultValue": "Все вопросы решаем в одном окне — от подбора ипотеки до приватизации",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.benefitcolumns.1",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Высокий доход, премии, бонусы и подарки за результат",
    "defaultValue": "Высокий доход, премии, бонусы и подарки за результат",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.benefitcolumns.2",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Эксклюзивная база объектов, которых нет на Авито и Циане",
    "defaultValue": "Эксклюзивная база объектов, которых нет на Авито и Циане",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.benefitcolumns.3",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Входящие заявки, вам не придется звонить в холодную",
    "defaultValue": "Входящие заявки, вам не придется звонить в холодную",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.benefitcolumns.4",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Командировки на тренинги и мероприятия по всей РФ",
    "defaultValue": "Командировки на тренинги и мероприятия по всей РФ",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.text.5",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Ищем в команду тех, кто любит шелестящие звуки купюр в банкомате",
    "defaultValue": "Ищем в команду тех, кто любит шелестящие звуки купюр в банкомате",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.text.6",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Опыт не нужен.",
    "defaultValue": "Опыт не нужен.",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.text.7",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Бесплатно обучим, закрепим наставника и доведем до первых сделок",
    "defaultValue": "Бесплатно обучим, закрепим наставника и доведем до первых сделок",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.label.8",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Хочу в команду",
    "defaultValue": "Хочу в команду",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.text.9",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Мы постоянно растем, поэтому завели канал с вакансиями",
    "defaultValue": "Мы постоянно растем, поэтому завели канал с вакансиями",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "home-recruiting.text.10",
    "page": "Главная",
    "block": "home-recruiting",
    "label": "Ссылка на канал с вакансиями скоро появится.",
    "defaultValue": "Ссылка на канал с вакансиями скоро появится.",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq-section.title.1",
    "page": "Общие блоки",
    "block": "faq-section",
    "label": "Отвечаем на вопросы до того, как вы их зададите",
    "defaultValue": "Отвечаем на вопросы до того, как вы их зададите",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq-card.question.1",
    "page": "Общие блоки",
    "block": "faq-card",
    "label": "Как понять, что вы не обманете и не уйдете с деньгами или объектом?",
    "defaultValue": "Как понять, что вы не обманете и не уйдете с деньгами или объектом?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq-card.answer.2",
    "page": "Общие блоки",
    "block": "faq-card",
    "label": "Это самый честный вопрос и мы его слышим часто, поэтому не просим доверять на слово. До ",
    "defaultValue": "Это самый честный вопрос и мы его слышим часто, поэтому не просим доверять на слово. До подписания договора вы получаете все условия работы и размер комиссии на бумаге. Расчеты проходят через банк: деньги переходят к продавцу только после регистрации права собственности. Хотите разобраться подробнее — приходите на консультацию.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.1",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как проходит сделка — от первого звонка до получения ключей или денег?",
    "defaultValue": "Как проходит сделка — от первого звонка до получения ключей или денег?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.2",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Объясняем весь процесс простым языком до старта. Вы знаете, что происходит на каждом эта",
    "defaultValue": "Объясняем весь процесс простым языком до старта. Вы знаете, что происходит на каждом этапе, какие документы нужны и что будет дальше. Юристов, банки и всех участников координируем сами. Раз в неделю присылаем отчет, чтобы вы понимали, на каком этапе находится сделка.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.3",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Можно полностью делегировать сделку, если я живу в другом городе?",
    "defaultValue": "Можно полностью делегировать сделку, если я живу в другом городе?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.4",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Да, мы проводим показы, собираем документы и координируем всех участников сами. Если нуж",
    "defaultValue": "Да, мы проводим показы, собираем документы и координируем всех участников сами. Если нужно — оформляем нотариальную доверенность, чтобы вы приехали только на финальное подписание.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.5",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Сколько стоят услуги и появятся ли дополнительные расходы?",
    "defaultValue": "Сколько стоят услуги и появятся ли дополнительные расходы?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.text.6",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Все расходы обсуждаем до подписания договора.",
    "defaultValue": "Все расходы обсуждаем до подписания договора.",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.text.7",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Продажа недвижимости — 3% от стоимости объекта, но не менее 150 000 ₽",
    "defaultValue": "Продажа недвижимости — 3% от стоимости объекта, но не менее 150 000 ₽",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.text.8",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Покупка недвижимости — 3% от стоимости объекта, но не менее 100 000 ₽",
    "defaultValue": "Покупка недвижимости — 3% от стоимости объекта, но не менее 100 000 ₽",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.text.9",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Никаких сюрпризов по ходу — вы заранее знаете размер комиссии, кто ее платит и какие соп",
    "defaultValue": "Никаких сюрпризов по ходу — вы заранее знаете размер комиссии, кто ее платит и какие сопутствующие расходы возможны в вашей ситуации.",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "faq.question.10",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Что будет с авансом, если сделка сорвется?",
    "defaultValue": "Что будет с авансом, если сделка сорвется?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.11",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Зависит от причины и от того, как оформлены документы. До старта объясняем разницу между",
    "defaultValue": "Зависит от причины и от того, как оформлены документы. До старта объясняем разницу между авансом и задатком — это разные вещи с разными последствиями. Правильно составленный договор защищает ваши деньги даже если сделка не состоялась. Разберем это на консультации на вашей конкретной ситуации.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.12",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Почему стоит обращаться к риелтору, если можно провести сделку самостоятельно?",
    "defaultValue": "Почему стоит обращаться к риелтору, если можно провести сделку самостоятельно?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.13",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Самостоятельная сделка кажется способом сэкономить, но любая ошибка в документах, сроках",
    "defaultValue": "Самостоятельная сделка кажется способом сэкономить, но любая ошибка в документах, сроках или расчетах может обойтись значительно дороже комиссии. Мы берем на себя организацию процесса, проверяем юридические риски и защищаем ваши интересы. Сделка проходит спокойно — без сюрпризов и самостоятельного погружения в юридические тонкости.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.14",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как вы защищаете от мошенников, ошибок в документах и оспаривания сделки?",
    "defaultValue": "Как вы защищаете от мошенников, ошибок в документах и оспаривания сделки?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.15",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Перед сделкой проверяем документы, историю объекта и полномочия всех сторон. Выясняем юр",
    "defaultValue": "Перед сделкой проверяем документы, историю объекта и полномочия всех сторон. Выясняем юридические риски заранее, а не в момент подписания. Все договоренности фиксируем письменно, каждый этап объясняем простыми словами. Это снижает риск мошенничества, ошибок и ситуаций, когда сделку пытаются оспорить после.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.16",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Какие документы нужно подготовить и кто их собирает?",
    "defaultValue": "Какие документы нужно подготовить и кто их собирает?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.17",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Мы выдаем конкретный список документов именно под вашу ситуацию. Если что‑то нужно восст",
    "defaultValue": "Мы выдаем конкретный список документов именно под вашу ситуацию. Если что‑то нужно восстановить, оформить или получить в госорганах — поможем организовать этот процесс. Вам не придется самостоятельно разбираться в требованиях и бегать по кабинетам.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.18",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как я буду контролировать сделку, если не могу постоянно участвовать в процессе?",
    "defaultValue": "Как я буду контролировать сделку, если не могу постоянно участвовать в процессе?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.19",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Раз в неделю мы будем отправлять вам отчет о ходе сделки, чтобы вы понимали, на каком эт",
    "defaultValue": "Раз в неделю мы будем отправлять вам отчет о ходе сделки, чтобы вы понимали, на каком этапе находится процесс. Если будут какие‑то изменения или возникнут вопросы — мы сразу свяжемся с вами и объясним, что делать дальше.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.20",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Если приду на консультацию — сразу заставят подписывать договор?",
    "defaultValue": "Если приду на консультацию — сразу заставят подписывать договор?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.21",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Нет. Консультация — это обсуждение вашей ситуации без обязательств. За 40 минут разберем",
    "defaultValue": "Нет. Консультация — это обсуждение вашей ситуации без обязательств. За 40 минут разберем бюджет, цели и варианты, которые вам подходят. Договор подписываем только тогда, когда вы сами решили, что готовы. Никакого давления. Записывайтесь на консультацию в офис, на этой неделе у нас осталось 4 свободных места.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.22",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Поможете, если с документами на недвижимость есть проблемы?",
    "defaultValue": "Поможете, если с документами на недвижимость есть проблемы?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.23",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Да. Оформим наследство, узаконим перепланировку, восстановим документы, поможем с приват",
    "defaultValue": "Да. Оформим наследство, узаконим перепланировку, восстановим документы, поможем с приватизацией или разберем ситуацию с долями. Сначала разбираемся в ситуации и предлагаем законный путь — без лишних трат и хождений по кабинетам.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.24",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Чем вы отличаетесь от других агентств?",
    "defaultValue": "Чем вы отличаетесь от других агентств?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.25",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Мы не просто ищем покупателя или объект. Сопровождаем сделку целиком: проверяем документ",
    "defaultValue": "Мы не просто ищем покупателя или объект. Сопровождаем сделку целиком: проверяем документы, координируем всех участников, объясняем каждый этап и остаемся на связи до передачи ключей или денег. Для нас важно, чтобы сделка была не только выгодной, но и безопасной.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.26",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как понять, за сколько реально продать объект и не продешевить?",
    "defaultValue": "Как понять, за сколько реально продать объект и не продешевить?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.27",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Мы не берем цену с потолка и не обещаем, что продадим объект дороже других агентств. Сна",
    "defaultValue": "Мы не берем цену с потолка и не обещаем, что продадим объект дороже других агентств. Сначала сравниваем ваш объект с проданными и актуальными, анализируем спрос в вашем районе и текущую ситуацию на рынке. После этого предлагаем выгодную для вас цену, которая поможет продать объект без многомесячного ожидания и потери денег. А также показываем, на каком месте вы окажетесь среди конкурентов в своем районе.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.cta.28",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Записаться на консультацию",
    "defaultValue": "Записаться на консультацию",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.question.29",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Нужен ли ремонт перед продажей или можно продать как есть?",
    "defaultValue": "Нужен ли ремонт перед продажей или можно продать как есть?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.30",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Не всегда. Иногда достаточно уборки, починить то, что сломано, и сделать качественные фо",
    "defaultValue": "Не всегда. Иногда достаточно уборки, починить то, что сломано, и сделать качественные фотографии. Смотрим на объект и честно говорим, что реально повысит цену, а на что не стоит тратить деньги. Мы не навязываем ремонт без объективной причины.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.31",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Мне обязательно лично присутствовать на показах?",
    "defaultValue": "Мне обязательно лично присутствовать на показах?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.32",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Нет. Мы сами договариваемся с покупателями, проводим показы и отвечаем на все вопросы об",
    "defaultValue": "Нет. Мы сами договариваемся с покупателями, проводим показы и отвечаем на все вопросы об объекте. Не нужно отпрашиваться с работы или менять планы. Организуем показы в удобное время для покупателей — в том числе в выходные и праздники.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.33",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как получить деньги и защититься от фальшивых купюр или задержки выплат?",
    "defaultValue": "Как получить деньги и защититься от фальшивых купюр или задержки выплат?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.34",
    "page": "Общие блоки",
    "block": "faq",
    "label": "При наличном расчете проверяем и пересчитываем деньги в банке в день сделки. При ипотеке",
    "defaultValue": "При наличном расчете проверяем и пересчитываем деньги в банке в день сделки. При ипотеке, маткапитале или военной ипотеке деньги поступают от банка или государства напрямую — фальшивки физически невозможны. До подписания документов говорим, когда именно поступят деньги в вашем случае.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.35",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Можно продать квартиру и одновременно купить другую, не оказавшись без жилья?",
    "defaultValue": "Можно продать квартиру и одновременно купить другую, не оказавшись без жилья?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.36",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Да, это альтернативная сделка. Синхронизируем продажу и покупку так, чтобы вы не зависли",
    "defaultValue": "Да, это альтернативная сделка. Синхронизируем продажу и покупку так, чтобы вы не зависли между двумя сделками без денег и без крыши над головой. Заранее прорабатываем все сценарии и фиксируем сроки с обеими сторонами письменно.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.37",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Сколько времени потребуется на продажу объекта?",
    "defaultValue": "Сколько времени потребуется на продажу объекта?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.38",
    "page": "Общие блоки",
    "block": "faq",
    "label": "После анализа объекта назовем реалистичный срок. На него влияют цена, состояние объекта ",
    "defaultValue": "После анализа объекта назовем реалистичный срок. На него влияют цена, состояние объекта и спрос в районе. Раз в неделю будем присылать отчет о просмотрах, звонках и показах, чтобы вы понимали, когда ждать результата.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.39",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Что вы делаете, чтобы объект увидело как можно больше покупателей?",
    "defaultValue": "Что вы делаете, чтобы объект увидело как можно больше покупателей?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.40",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Делаем профессиональные фото и видео, пишем продающее объявление и размещаем объект на п",
    "defaultValue": "Делаем профессиональные фото и видео, пишем продающее объявление и размещаем объект на популярных площадках. Предлагаем объект нашей закрытой базе покупателей и коллегам‑партнерам. Раз в неделю показываем, сколько было просмотров, звонков и показов, чтобы вы видели, как идет работа.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.41",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как проверяете покупателей, чтобы сделка не сорвалась в последний момент?",
    "defaultValue": "Как проверяете покупателей, чтобы сделка не сорвалась в последний момент?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.42",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Проверяем платежеспособность, способ оплаты и документы до показа. Если покупатель берет",
    "defaultValue": "Проверяем платежеспособность, способ оплаты и документы до показа. Если покупатель берет ипотеку, уточняем статус одобрения. Это отсекает тех, кто очень хочет купить, но денег нет — и защищает вас от срыва на финальном этапе.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.43",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Продадите квартиру, если у нее сложная ситуация — ипотека, опека или несколько собственн",
    "defaultValue": "Продадите квартиру, если у нее сложная ситуация — ипотека, опека или несколько собственников?",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "faq.answer.44",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Да. Такие сделки требуют больше подготовки, но это не значит, что объект не продать. Про",
    "defaultValue": "Да. Такие сделки требуют больше подготовки, но это не значит, что объект не продать. Проверяем документы заранее, объясняем риски и составляем план. Большинство сложных вопросов решаем до выхода на сделку.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.45",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как вы защищаете мои интересы, если покупатель начинает продавливать по цене?",
    "defaultValue": "Как вы защищаете мои интересы, если покупатель начинает продавливать по цене?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.46",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Мы не позволяем покупателю манипулировать условиями сделки. Все переговоры ведем сами, в",
    "defaultValue": "Мы не позволяем покупателю манипулировать условиями сделки. Все переговоры ведем сами, вы не оказываетесь один на один с давлением и аргументами чужого агента. Если торг обоснован — объясняем это цифрами. Если нет — держим цену и объясняем почему.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.47",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как проверяете объект, чтобы после покупки не появились чужие долги, прописанные люди ил",
    "defaultValue": "Как проверяете объект, чтобы после покупки не появились чужие долги, прописанные люди или незаконная перепланировка?",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "faq.answer.48",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Проверяем каждый объект по 52 параметрам из государственных баз и документов: залог, зад",
    "defaultValue": "Проверяем каждый объект по 52 параметрам из государственных баз и документов: залог, задолженность, арест, наследство, прописка, банкротство, аварийность дома и т. д. До сделки выдадим вам понятное заключение с конкретным разбором каждого риска.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.cta.49",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Получить доступ к базе",
    "defaultValue": "Получить доступ к базе",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.question.50",
    "page": "Общие блоки",
    "block": "faq",
    "label": "А вдруг хороший объект купят раньше меня?",
    "defaultValue": "А вдруг хороший объект купят раньше меня?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.51",
    "page": "Общие блоки",
    "block": "faq",
    "label": "У нас 800+ объектов в закрытой базе, которых нет на Авито и Циан. Вы видите варианты ран",
    "defaultValue": "У нас 800+ объектов в закрытой базе, которых нет на Авито и Циан. Вы видите варианты раньше других покупателей. Следим за рынком постоянно и сразу сообщаем о новых предложениях, пропустить подходящий вариант значительно сложнее.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.52",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Что если банк откажет в ипотеке или одобрит ее на невыгодных условиях?",
    "defaultValue": "Что если банк откажет в ипотеке или одобрит ее на невыгодных условиях?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.53",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Помогаем подобрать банк с лучшими условиями под вашу ситуацию и правильно оформить заявк",
    "defaultValue": "Помогаем подобрать банк с лучшими условиями под вашу ситуацию и правильно оформить заявку. Объясняем, какие факторы влияют на одобрение и как их улучшить до подачи. Если один банк отказал — знаем, куда идти дальше и не будем предлагать менее выгодные условия ради своего интереса.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.54",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Можно купить через маткапитал или военную ипотеку — это не отпугнет продавца?",
    "defaultValue": "Можно купить через маткапитал или военную ипотеку — это не отпугнет продавца?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.55",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Работаем с обоими инструментами. Объясняем продавцу сроки и процесс — большинство соглаш",
    "defaultValue": "Работаем с обоими инструментами. Объясняем продавцу сроки и процесс — большинство соглашаются, когда понимают, что все организовано и деньги придут от банка или государства напрямую. Помогаем оформить все документы правильно с первого раза.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.56",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как вы защищаете мои интересы, если продавец или его агент начинают давить?",
    "defaultValue": "Как вы защищаете мои интересы, если продавец или его агент начинают давить?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.57",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Все переговоры ведем мы — вы не оказываетесь один на один с чужим агентом и его аргумент",
    "defaultValue": "Все переговоры ведем мы — вы не оказываетесь один на один с чужим агентом и его аргументами. Не позволяем навязывать невыгодные условия и фиксируем все договоренности письменно. Вы принимаете решения на основе фактов, а не под давлением.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.58",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Как понять, что цена не завышена и не переплатить?",
    "defaultValue": "Как понять, что цена не завышена и не переплатить?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.59",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Анализируем стоимость похожих объектов, историю изменения цены и ситуацию на рынке. Если",
    "defaultValue": "Анализируем стоимость похожих объектов, историю изменения цены и ситуацию на рынке. Если продавец завысил — помогаем аргументированно снизить цену. Наша задача — чтобы вы не переплатили только потому, что квартира или дом красиво выглядят в объявлении.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.cta.60",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Записаться на консультацию в офис",
    "defaultValue": "Записаться на консультацию в офис",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.question.61",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Откуда вы знаете, что с объектом реально все в порядке, а не только по бумагам?",
    "defaultValue": "Откуда вы знаете, что с объектом реально все в порядке, а не только по бумагам?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.62",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Лично осматриваем объекты перед тем, как добавить в базу. На показах смотрим на то, что ",
    "defaultValue": "Лично осматриваем объекты перед тем, как добавить в базу. На показах смотрим на то, что обычно скрывают в объявлениях: плесень, протечки, состояние коммуникаций, подъезда, соседей и двора. Вы узнаете о недостатках до того, как потратить время на просмотр.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.cta.63",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Получить подборку",
    "defaultValue": "Получить подборку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.question.64",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Какие расходы будут сверх цены объекта, чтобы не получить сюрприз после сделки?",
    "defaultValue": "Какие расходы будут сверх цены объекта, чтобы не получить сюрприз после сделки?",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "faq.answer.65",
    "page": "Общие блоки",
    "block": "faq",
    "label": "До подписания расписываем все статьи: налоги, госпошлины, страховки и т. д. Также расска",
    "defaultValue": "До подписания расписываем все статьи: налоги, госпошлины, страховки и т. д. Также расскажем, как законно сэкономить на налогах и расходах до 2 млн при покупке недвижимости. Вы знаете полную сумму сделки заранее, без неожиданных платежей в процессе.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.66",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Что входит в сопровождение сделки при покупке и когда я получу ключи?",
    "defaultValue": "Что входит в сопровождение сделки при покупке и когда я получу ключи?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.67",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Сопровождаем от первого просмотра до получения ключей. Проверяем документы, согласовывае",
    "defaultValue": "Сопровождаем от первого просмотра до получения ключей. Проверяем документы, согласовываем условия, готовим договоры, контролируем регистрацию права собственности и передачу объекта. До подписания говорим точные сроки в вашем случае, чтобы вы могли планировать переезд.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "faq.question.68",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Почему выгоднее покупать через агентство, а не самостоятельно?",
    "defaultValue": "Почему выгоднее покупать через агентство, а не самостоятельно?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "faq.answer.69",
    "page": "Общие блоки",
    "block": "faq",
    "label": "Самостоятельный поиск кажется способом сэкономить на комиссии, но с нами вы экономите де",
    "defaultValue": "Самостоятельный поиск кажется способом сэкономить на комиссии, но с нами вы экономите десятки часов на поиске, просмотрах и проверке документов. А также получаете доступ к 800+ объектам, которых нет на Авито и Циан, профессиональную проверку по 52 параметрам, помощь в переговорах и сопровождение до получения ключей. Одна ошибка в документах или пропущенное обременение могут обойтись дороже любой комиссии.",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "sell.title.1",
    "page": "Продажа",
    "block": "sell",
    "label": "Продадим вашу",
    "defaultValue": "Продадим вашу",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell.title.2",
    "page": "Продажа",
    "block": "sell",
    "label": "недвижимость",
    "defaultValue": "недвижимость",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell.title.3",
    "page": "Продажа",
    "block": "sell",
    "label": "по рыночной цене или выше",
    "defaultValue": "по рыночной цене или выше",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell.accent.4",
    "page": "Продажа",
    "block": "sell",
    "label": "за 2 недели",
    "defaultValue": "за 2 недели",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell.description.5",
    "page": "Продажа",
    "block": "sell",
    "label": "В нашей базе 1 500+ покупателей с одобренной ипотекой или наличкой — готовы купить прямо",
    "defaultValue": "В нашей базе 1 500+ покупателей с одобренной ипотекой или наличкой — готовы купить прямо сейчас",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell.formtext.6",
    "page": "Продажа",
    "block": "sell",
    "label": "Ответьте на 5 вопросов и мы добавим ваш объект в закрытую базу на 1 500 покупателей",
    "defaultValue": "Ответьте на 5 вопросов и мы добавим ваш объект в закрытую базу на 1 500 покупателей",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "inner-hero.options.1",
    "page": "Общие блоки",
    "block": "inner-hero",
    "label": "Квартира",
    "defaultValue": "Квартира",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "inner-hero.options.2",
    "page": "Общие блоки",
    "block": "inner-hero",
    "label": "Дом",
    "defaultValue": "Дом",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "inner-hero.options.3",
    "page": "Общие блоки",
    "block": "inner-hero",
    "label": "Гараж",
    "defaultValue": "Гараж",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "inner-hero.options.4",
    "page": "Общие блоки",
    "block": "inner-hero",
    "label": "Участок",
    "defaultValue": "Участок",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "inner-hero.options.5",
    "page": "Общие блоки",
    "block": "inner-hero",
    "label": "Коммерческая недвижимость",
    "defaultValue": "Коммерческая недвижимость",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "inner-hero.options.6",
    "page": "Общие блоки",
    "block": "inner-hero",
    "label": "Другое",
    "defaultValue": "Другое",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "inner-hero.text.7",
    "page": "Общие блоки",
    "block": "inner-hero",
    "label": "нет",
    "defaultValue": "нет",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "inner-hero.text.8",
    "page": "Общие блоки",
    "block": "inner-hero",
    "label": "на",
    "defaultValue": "на",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-gossip.text.1",
    "page": "Продажа",
    "block": "sell-gossip",
    "label": "Да не слушай их. Пусть Монополия оценит твою квартиру",
    "defaultValue": "Да не слушай их.\nПусть Монополия\nоценит твою квартиру",
    "maxLength": 200,
    "multiline": true,
    "lines": 3
  },
  {
    "id": "sell-valuation.text.1",
    "page": "Продажа",
    "block": "sell-valuation",
    "label": "Узнайте реальную цену",
    "defaultValue": "Узнайте реальную цену",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-valuation.text.2",
    "page": "Продажа",
    "block": "sell-valuation",
    "label": "вашей недвижимости",
    "defaultValue": "вашей недвижимости",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-valuation.text.3",
    "page": "Продажа",
    "block": "sell-valuation",
    "label": "за 5 минут",
    "defaultValue": "за 5 минут",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-valuation.label.4",
    "page": "Продажа",
    "block": "sell-valuation",
    "label": "Получить анализ объекта",
    "defaultValue": "Получить анализ объекта",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-valuation.text.5",
    "page": "Продажа",
    "block": "sell-valuation",
    "label": "PDF‑файл",
    "defaultValue": "PDF‑файл",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-valuation.text.6",
    "page": "Продажа",
    "block": "sell-valuation",
    "label": "0,5 МБ",
    "defaultValue": "0,5 МБ",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.1",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "Хотите продать жилье на этой неделе?",
    "defaultValue": "Хотите продать жилье на этой неделе?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.2",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "Посмотрите историю",
    "defaultValue": "Посмотрите историю",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.3",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "продажи квартиры за 1 день",
    "defaultValue": "продажи квартиры за 1 день",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.4",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "История как в кино",
    "defaultValue": "История как в кино",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.5",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "К нам обратилась Наталья, которая давно",
    "defaultValue": "К нам обратилась Наталья, которая давно",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.6",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "собиралась продавать квартиру. Она",
    "defaultValue": "собиралась продавать квартиру. Она",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.7",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "идеально подходила для Максима,",
    "defaultValue": "идеально подходила для Максима,",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.8",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "который обратился к нам утром. В итоге",
    "defaultValue": "который обратился к нам утром. В итоге",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.9",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "оформили сделку одним днем",
    "defaultValue": "оформили сделку одним днем",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.10",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "Татьяна",
    "defaultValue": "Татьяна",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.11",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "Старший эксперт по недвижимости",
    "defaultValue": "Старший эксперт по недвижимости",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.12",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "Заполните форму, свяжемся с вами в течение 10 минут и назначим время встречи",
    "defaultValue": "Заполните форму, свяжемся с вами в течение 10 минут и назначим время встречи",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-week-case.label.13",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "Хочу срочно продать объект",
    "defaultValue": "Хочу срочно продать объект",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.14",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "Или напишите нам",
    "defaultValue": "Или напишите нам",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-week-case.text.15",
    "page": "Продажа",
    "block": "sell-week-case",
    "label": "в мессенджерах",
    "defaultValue": "в мессенджерах",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.1",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Инфраструктура района",
    "defaultValue": "Инфраструктура района",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.2",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Контингент соседей",
    "defaultValue": "Контингент соседей",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.3",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Год постройки",
    "defaultValue": "Год постройки",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.4",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Планировка",
    "defaultValue": "Планировка",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.5",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Площадь",
    "defaultValue": "Площадь",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.6",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Электрика",
    "defaultValue": "Электрика",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.7",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Сантехника",
    "defaultValue": "Сантехника",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.8",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Коммуналка",
    "defaultValue": "Коммуналка",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.9",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Состояние объекта",
    "defaultValue": "Состояние объекта",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.10",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Материалы конструкций",
    "defaultValue": "Материалы конструкций",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-answers.text.11",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "История ремонтов",
    "defaultValue": "История ремонтов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-process.title.1",
    "page": "Продажа",
    "block": "sell-process",
    "label": "Хотите переехать из Белогорска?",
    "defaultValue": "Хотите переехать из Белогорска?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-process.description.2",
    "page": "Продажа",
    "block": "sell-process",
    "label": "У нас 100+ партнеров среди агентств и застройщиков по всей России, которые готовы помочь",
    "defaultValue": "У нас 100+ партнеров среди агентств и застройщиков по всей России, которые готовы помочь вам купить квартиру безопасно и выгодно",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "relocation-map.title.1",
    "page": "Общие блоки",
    "block": "relocation-map",
    "label": "Хотите переехать в Белогорск?",
    "defaultValue": "Хотите переехать в Белогорск?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "relocation-map.annotation.2",
    "page": "Общие блоки",
    "block": "relocation-map",
    "label": "В тесноте, да не в обиде",
    "defaultValue": "В тесноте, да не в обиде",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "relocation-map.description.3",
    "page": "Общие блоки",
    "block": "relocation-map",
    "label": "Поможем найти уютное жилье, в котором будете прекрасно себя чувствовать",
    "defaultValue": "Поможем найти уютное жилье, в котором будете прекрасно себя чувствовать",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "deal-steps.missiontitle.1",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Наша миссия",
    "defaultValue": "Наша миссия",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.missionaccent.2",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "— комиссия",
    "defaultValue": "— комиссия",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.missiontext.3",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Да, мы заинтересованы в комиссии, но получаем ее не за красивые глазки, а за безопасност",
    "defaultValue": "Да, мы заинтересованы в комиссии, но получаем ее не за красивые глазки, а за безопасность вашей сделки, экономию времени и нервов",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "deal-steps.text.4",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Выявим, что вам реально подходит, а не будем пытаться навязать, как на китайском рынке",
    "defaultValue": "Выявим, что вам реально подходит, а не будем пытаться навязать, как на китайском рынке",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "deal-steps.text.5",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Бюджет",
    "defaultValue": "Бюджет",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.6",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Способ оплаты",
    "defaultValue": "Способ оплаты",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.7",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Тип жилья",
    "defaultValue": "Тип жилья",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.8",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Район",
    "defaultValue": "Район",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.9",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Кол‑во комнат",
    "defaultValue": "Кол‑во комнат",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.10",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Этаж",
    "defaultValue": "Этаж",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.11",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Вид из окна",
    "defaultValue": "Вид из окна",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.12",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Балкон",
    "defaultValue": "Балкон",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.13",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Парковка",
    "defaultValue": "Парковка",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.14",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Соседи",
    "defaultValue": "Соседи",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.15",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Если планируете купить жилье в ипотеку, подготовим документы так, чтобы банк одобрил ее",
    "defaultValue": "Если планируете купить жилье в ипотеку, подготовим документы так, чтобы банк одобрил ее",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "deal-steps.text.16",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Подберем объекты из нашей закрытой базы, а также промониторим открытые источники. Отсеем",
    "defaultValue": "Подберем объекты из нашей закрытой базы, а также промониторим открытые источники. Отсеем то, что вам не подходит, чтобы вы не тратили время на просмотр",
    "maxLength": 2000,
    "multiline": true
  },
  {
    "id": "deal-steps.text.17",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Далеко от работы",
    "defaultValue": "Далеко от работы",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.18",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Шумные соседи",
    "defaultValue": "Шумные соседи",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.19",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Идеальные варианты",
    "defaultValue": "Идеальные варианты",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.20",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Рядом стройка",
    "defaultValue": "Рядом стройка",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.21",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Первый этаж",
    "defaultValue": "Первый этаж",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.22",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Проверим подходящие объекты по 52 параметрам — от долгов до психического здоровья собств",
    "defaultValue": "Проверим подходящие объекты по 52 параметрам — от долгов до психического здоровья собственника",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "deal-steps.text.23",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Повозим вас по отобранным объектам или покажем их онлайн",
    "defaultValue": "Повозим вас по отобранным объектам или покажем их онлайн",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.24",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Договоримся вместо вас с продавцом о цене, мебели и сроках переезда",
    "defaultValue": "Договоримся вместо вас с продавцом о цене, мебели и сроках переезда",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.25",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Весь процесс запишем на видео на всякий случай :)",
    "defaultValue": "Весь процесс запишем на видео на всякий случай :)",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.26",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Заключим предварительный договор. Цену и сроки переезда зафиксируем письменно, а не на с",
    "defaultValue": "Заключим предварительный договор. Цену и сроки переезда зафиксируем письменно, а не на словах. И только после этого вы вносите предоплату продавцу",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "deal-steps.text.27",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Отправим пакет документов в банк, чтобы оформить сделку",
    "defaultValue": "Отправим пакет документов в банк, чтобы оформить сделку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-steps.text.28",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Заключим основной договор, проведем расчет, зарегистрируем право собственности на ваше и",
    "defaultValue": "Заключим основной договор, проведем расчет, зарегистрируем право собственности на ваше имя",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "deal-steps.text.29",
    "page": "Общие блоки",
    "block": "deal-steps",
    "label": "Передадим вам ключи — сделка завершена",
    "defaultValue": "Передадим вам ключи — сделка завершена",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.note.1",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Комиссия за сделку — всего 3%",
    "defaultValue": "Комиссия за сделку — всего 3%",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.title.2",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Ошибки без риелтора могут привести к потере жилья или всех денег",
    "defaultValue": "Ошибки без риелтора могут привести к потере жилья или всех денег",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.text.3",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "На этой неделе есть еще",
    "defaultValue": "На этой неделе есть еще",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.text.4",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "4 свободных места",
    "defaultValue": "4 свободных места",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.text.5",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Кстати,",
    "defaultValue": "Кстати,",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.text.6",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "оплату берем только после передачи ключей.",
    "defaultValue": "оплату берем только после передачи ключей.",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.text.7",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "А если вы покупаете в новостройке — комиссию платит застройщик",
    "defaultValue": "А если вы покупаете в новостройке — комиссию платит застройщик",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "comparison-table.columns.1",
    "page": "Общие блоки",
    "block": "comparison-table",
    "label": "Самостоятельно",
    "defaultValue": "Самостоятельно",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "comparison-table.columns.2",
    "page": "Общие блоки",
    "block": "comparison-table",
    "label": "С риелтором",
    "defaultValue": "С риелтором",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "comparison-table.text.3",
    "page": "Общие блоки",
    "block": "comparison-table",
    "label": "Риск",
    "defaultValue": "Риск",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.1",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Узнаем ваши цели и всем офисом подумаем, как можно продать объект быстрее, не теряя в це",
    "defaultValue": "Узнаем ваши цели и всем офисом подумаем, как можно продать объект быстрее, не теряя в цене",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.2",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Цель продажи",
    "defaultValue": "Цель продажи",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.3",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Желаемая сумма",
    "defaultValue": "Желаемая сумма",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.4",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Минимальная цена",
    "defaultValue": "Минимальная цена",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.5",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Срок продажи",
    "defaultValue": "Срок продажи",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.6",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Сильные стороны объекта",
    "defaultValue": "Сильные стороны объекта",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.7",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Документы",
    "defaultValue": "Документы",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.8",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Готовность к показам",
    "defaultValue": "Готовность к показам",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.9",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Условия передачи ключей",
    "defaultValue": "Условия передачи ключей",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.10",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Определим реальную рыночную стоимость на основании аналогичных предложений",
    "defaultValue": "Определим реальную рыночную стоимость на основании аналогичных предложений",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.11",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Адрес",
    "defaultValue": "Адрес",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.12",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Тип дома",
    "defaultValue": "Тип дома",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.13",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Общая стоимость",
    "defaultValue": "Общая стоимость",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.14",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Цена за м²",
    "defaultValue": "Цена за м²",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.15",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Превратим объект в конфетку:",
    "defaultValue": "Превратим объект в конфетку:",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.16",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Организуем уборку",
    "defaultValue": "Организуем уборку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.17",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "При необходимости найдем мастера, чтобы починить что‑то мелкое в квартире",
    "defaultValue": "При необходимости найдем мастера, чтобы починить что‑то мелкое в квартире",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.18",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Сделаем уютные фоточки",
    "defaultValue": "Сделаем уютные фоточки",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.19",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Запишем видеообзор",
    "defaultValue": "Запишем видеообзор",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.20",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Напишем объявление, где выделим сильные стороны, чтобы люди захотели купить",
    "defaultValue": "Напишем объявление, где выделим сильные стороны, чтобы люди захотели купить",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.21",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Запустим рекламу из каждого утюга:",
    "defaultValue": "Запустим рекламу из каждого утюга:",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.22",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Расклеим яркие объявления по городу",
    "defaultValue": "Расклеим яркие объявления по городу",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.23",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Сделаем рассылку по 1 500+ покупателям из базы, которые готовы купить объект прямо сейча",
    "defaultValue": "Сделаем рассылку по 1 500+ покупателям из базы, которые готовы купить объект прямо сейчас",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.24",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Если хотите срочно продать объект, то добавим его в подборку горячих предложений и запус",
    "defaultValue": "Если хотите срочно продать объект, то добавим его в подборку горячих предложений и запустим рекламу",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-deal-steps.text.25",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Разместим ваш объект на Авито, Циан и Домклик, будем еженедельно его продвигать за свой ",
    "defaultValue": "Разместим ваш объект на Авито, Циан и Домклик, будем еженедельно его продвигать за свой счет",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-deal-steps.text.26",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Разместим объявление в своих соцсетях",
    "defaultValue": "Разместим объявление в своих соцсетях",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.27",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Организуем показы для потенциальных покупателей или покажем онлайн",
    "defaultValue": "Организуем показы для потенциальных покупателей или покажем онлайн",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.28",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Проверим покупателя на платежеспособность и его документы",
    "defaultValue": "Проверим покупателя на платежеспособность и его документы",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.29",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "(если в паспорте фамилия Долина — откажем)",
    "defaultValue": "(если в паспорте фамилия Долина — откажем)",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.30",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": ". И даже возьмем справочку о том, что он психически здоров",
    "defaultValue": ". И даже возьмем справочку о том, что он психически здоров",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.31",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Будем самостоятельно вести переговоры с покупателем и отстаивать ваши интересы",
    "defaultValue": "Будем самостоятельно вести переговоры с покупателем и отстаивать ваши интересы",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.32",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Весь процесс запишем на видео на всякий случай :)",
    "defaultValue": "Весь процесс запишем на видео на всякий случай :)",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-deal-steps.text.33",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Цену и сроки переезда зафиксируем в предварительном договоре, а не на словах. Затем возь",
    "defaultValue": "Цену и сроки переезда зафиксируем в предварительном договоре, а не на словах. Затем возьмем предоплату с покупателя",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-deal-steps.text.34",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Заключим основной договор, проведем расчет, зарегистрируем право собственности на нового",
    "defaultValue": "Заключим основной договор, проведем расчет, зарегистрируем право собственности на нового владельца",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-deal-steps.text.35",
    "page": "Продажа",
    "block": "sell-deal-steps",
    "label": "Передадим вам деньги — сделка завершена",
    "defaultValue": "Передадим вам деньги — сделка завершена",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.label.1",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Скорость покупки",
    "defaultValue": "Скорость покупки",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.others.2",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "До 6‑24 месяцев. Много времени уходит на поиск покупателя, показы и звонки",
    "defaultValue": "До 6‑24 месяцев. Много времени уходит на поиск покупателя, показы и звонки",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.ours.3",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Подбираем покупателя в среднем за 14 дней из закрытой базы, где 1 500+ человек с одобрен",
    "defaultValue": "Подбираем покупателя в среднем за 14 дней из закрытой базы, где 1 500+ человек с одобренной ипотекой или наличкой",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-realtor-comparison.label.4",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Проверка покупателя",
    "defaultValue": "Проверка покупателя",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.others.5",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Риск продать неудачно и придется судиться годами, либо покупатель заплатит фальшивыми де",
    "defaultValue": "Риск продать неудачно и придется судиться годами, либо покупатель заплатит фальшивыми деньгами",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-realtor-comparison.ours.6",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Проверяем документы и наличные на подлинность. А также берем справку о психологическом з",
    "defaultValue": "Проверяем документы и наличные на подлинность. А также берем справку о психологическом здоровье",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-realtor-comparison.label.7",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Оформление сделки",
    "defaultValue": "Оформление сделки",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.others.8",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Покупатель может сорвать сделку в последний момент, а ошибки в договоре — оставят вас бе",
    "defaultValue": "Покупатель может сорвать сделку в последний момент, а ошибки в договоре — оставят вас без денег и без недвижимости",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-realtor-comparison.ours.9",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Мы составляем юридически грамотные предварительный и основной договоры, а также контроли",
    "defaultValue": "Мы составляем юридически грамотные предварительный и основной договоры, а также контролируем сделку",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-realtor-comparison.label.10",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Написание объявления",
    "defaultValue": "Написание объявления",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.others.11",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Объявление и фотографии могут быть оформлены неправильно, из‑за чего продажа затянется",
    "defaultValue": "Объявление и фотографии могут быть оформлены неправильно, из‑за чего продажа затянется",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.ours.12",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Сделаем фото, видеообзор и напишем объявление, которое будет притягивать покупателей",
    "defaultValue": "Сделаем фото, видеообзор и напишем объявление, которое будет притягивать покупателей",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.label.13",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Переплата",
    "defaultValue": "Переплата",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.others.14",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Риск продать дешево или долго искать покупателя из‑за нереалистичных ожиданий",
    "defaultValue": "Риск продать дешево или долго искать покупателя из‑за нереалистичных ожиданий",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.ours.15",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Помогаем продать объект по рыночной цене и даже выше",
    "defaultValue": "Помогаем продать объект по рыночной цене и даже выше",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.label.16",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Координация и переговоры",
    "defaultValue": "Координация и переговоры",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-realtor-comparison.others.17",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Показы, звонки и торги забирают много времени. Есть риск потерять того самого покупателя",
    "defaultValue": "Показы, звонки и торги забирают много времени. Есть риск потерять того самого покупателя в суматохе",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "sell-realtor-comparison.ours.18",
    "page": "Продажа",
    "block": "sell-realtor-comparison",
    "label": "Представляем ваши интересы на переговорах, координируем всех участников и планируем пока",
    "defaultValue": "Представляем ваши интересы на переговорах, координируем всех участников и планируем показы под ваш график",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "office-consultation.text.1",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "Бесплатная консультация",
    "defaultValue": "Бесплатная консультация",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.2",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "По телефону хорошо говорить про погоду.",
    "defaultValue": "По телефону хорошо говорить про погоду.",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.3",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "Про сделку на миллионы лучше в офисе за кофе",
    "defaultValue": "Про сделку на миллионы лучше в офисе за кофе",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.4",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "По телефону хорошо говорить про погоду. Про недвижку, ипотеку и риски лучше в офисе с пе",
    "defaultValue": "По телефону хорошо говорить про погоду. Про недвижку, ипотеку и риски лучше в офисе с печеньками",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "office-consultation.text.5",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "За 40 минут сделаем прогноз по срокам",
    "defaultValue": "За 40 минут сделаем прогноз по срокам",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.6",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "продажи и цене, а не будем переписываться",
    "defaultValue": "продажи и цене, а не будем переписываться",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.7",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "неделю в заблокированных Telegram или WhatsApp",
    "defaultValue": "неделю в заблокированных Telegram или WhatsApp",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.8",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "За 40 минут разберем бюджет, цели и образ жизни — и сразу отсечем",
    "defaultValue": "За 40 минут разберем бюджет, цели и образ жизни — и сразу отсечем",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.9",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "варианты, которые вам не подходят, а не будем переписываться",
    "defaultValue": "варианты, которые вам не подходят, а не будем переписываться",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.10",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "Возможно, в нашей базе",
    "defaultValue": "Возможно, в нашей базе",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.11",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "уже есть человек, который",
    "defaultValue": "уже есть человек, который",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.12",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "ждет ваше предложение",
    "defaultValue": "ждет ваше предложение",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.13",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "А еще расскажем, как законно сэкономить",
    "defaultValue": "А еще расскажем, как законно сэкономить",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.14",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "на налогах и расходах до 2 млн при покупке",
    "defaultValue": "на налогах и расходах до 2 млн при покупке",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.15",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "На этой неделе есть",
    "defaultValue": "На этой неделе есть",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.16",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "еще",
    "defaultValue": "еще",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "office-consultation.text.17",
    "page": "Общие блоки",
    "block": "office-consultation",
    "label": "4 свободных места",
    "defaultValue": "4 свободных места",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.1",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "Страхуем сделку",
    "defaultValue": "Страхуем сделку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.2",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "от мошенников",
    "defaultValue": "от мошенников",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.3",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "на 10 млн",
    "defaultValue": "на 10 млн",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.4",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "Если суд признает сделку недействительной, страховая возместит убытки",
    "defaultValue": "Если суд признает сделку недействительной, страховая возместит убытки",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.5",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "Но к счастью, наша дотошность",
    "defaultValue": "Но к счастью, наша дотошность",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.6",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "отпугивает",
    "defaultValue": "отпугивает",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.7",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "всех мошенников",
    "defaultValue": "всех мошенников",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.8",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "и таких случаев не было",
    "defaultValue": "и таких случаев не было",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.9",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "4 свободных места",
    "defaultValue": "4 свободных места",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.10",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "Клиент",
    "defaultValue": "Клиент",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "deal-insurance.text.11",
    "page": "Общие блоки",
    "block": "deal-insurance",
    "label": "Я спросила не мошенники ли они? Они сказали нет",
    "defaultValue": "Я спросила не мошенники ли они?\nОни сказали нет",
    "maxLength": 200,
    "multiline": true,
    "lines": 2
  },
  {
    "id": "prepared-viewing.lists.1",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Приведем клинеров и подскажем, что исправить перед съемкой",
    "defaultValue": "Приведем клинеров и подскажем, что исправить перед съемкой",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.lists.2",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Снимем фото так, чтобы визуально было эстетично и красиво",
    "defaultValue": "Снимем фото так, чтобы визуально было эстетично и красиво",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.lists.3",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Сделаем крутой видеообзор объекта как у блогеров",
    "defaultValue": "Сделаем крутой видеообзор объекта как у блогеров",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.lists.4",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Напишем текст объявления такой, чтобы хотелось сразу позвонить",
    "defaultValue": "Напишем текст объявления такой, чтобы хотелось сразу позвонить",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.5",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Почему жилье с нами",
    "defaultValue": "Почему жилье с нами",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.6",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "продается быстрее?",
    "defaultValue": "продается быстрее?",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.7",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Бесплатно организуем",
    "defaultValue": "Бесплатно организуем",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.8",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "комфортный показ объекта",
    "defaultValue": "комфортный показ объекта",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.9",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Заранее подготовим недвижимость к просмотру: внутри будет чисто и прибрано, не будет жил",
    "defaultValue": "Заранее подготовим недвижимость к просмотру: внутри будет чисто и прибрано, не будет жильцов и лишних запахов",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "prepared-viewing.text.10",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Мы сделаем так, что",
    "defaultValue": "Мы сделаем так, что",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.11",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "покупатель влюбится в жилье с первого взгляда",
    "defaultValue": "покупатель влюбится в жилье с первого взгляда",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.12",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "— сделаем фоточки, как в Pinterest, и напишем продающее объявление",
    "defaultValue": "— сделаем фоточки, как в Pinterest, и напишем продающее объявление",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.13",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "При этом мы ничего не скрываем и говорим о недостатках сразу.",
    "defaultValue": "При этом мы ничего не скрываем и говорим о недостатках сразу.",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.14",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Фотографии и описание соответствуют реальности",
    "defaultValue": "Фотографии и описание соответствуют реальности",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.label.15",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Хочу продать быстрее и дороже",
    "defaultValue": "Хочу продать быстрее и дороже",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.16",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "Вероятность",
    "defaultValue": "Вероятность",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "prepared-viewing.text.17",
    "page": "Общие блоки",
    "block": "prepared-viewing",
    "label": "покупки недвижимости",
    "defaultValue": "покупки недвижимости",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell-commission-note.text.1",
    "page": "Продажа",
    "block": "sell-commission-note",
    "label": "вы платите комиссию только после зачисления денег на ваш счет",
    "defaultValue": "вы платите комиссию только после зачисления денег на ваш счет",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.bank.1",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "СберБанк",
    "defaultValue": "СберБанк",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.time.2",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "52 минуты назад",
    "defaultValue": "52 минуты назад",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.bank.3",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "Т‑Банк",
    "defaultValue": "Т‑Банк",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.time.4",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "12 минут назад",
    "defaultValue": "12 минут назад",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.bank.5",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "Альфа Банк",
    "defaultValue": "Альфа Банк",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.time.6",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "7 минут назад",
    "defaultValue": "7 минут назад",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.bank.7",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "Ozon Банк",
    "defaultValue": "Ozon Банк",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.time.8",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "4 минуты назад",
    "defaultValue": "4 минуты назад",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.bank.9",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "МТС Деньги",
    "defaultValue": "МТС Деньги",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.time.10",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "Сейчас",
    "defaultValue": "Сейчас",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.bank.11",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "WB Банк",
    "defaultValue": "WB Банк",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.text.12",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "Получите 5 000 ₽",
    "defaultValue": "Получите 5 000 ₽",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.text.13",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "за каждого приведенного",
    "defaultValue": "за каждого приведенного",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.text.14",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "друга до конца (месяц подставляется автоматически)",
    "defaultValue": "друга до конца сентября",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.text.15",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "При заключении договора",
    "defaultValue": "При заключении договора",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.text.16",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "До конца акции:",
    "defaultValue": "До конца акции:",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-bonus.text.17",
    "page": "Общие блоки",
    "block": "referral-bonus",
    "label": "Счетчик акции (автоматический, сохраненное значение не применяется)",
    "defaultValue": "13 дней",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "referral-notification.text.1",
    "page": "Общие блоки",
    "block": "referral-notification",
    "label": "Пополнение на 5 000 ₽",
    "defaultValue": "Пополнение на 5 000 ₽",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy.title.1",
    "page": "Покупка",
    "block": "buy",
    "label": "800+ проверенных объектов",
    "defaultValue": "800+ проверенных объектов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy.title.2",
    "page": "Покупка",
    "block": "buy",
    "label": "недвижимости, которых нет",
    "defaultValue": "недвижимости, которых",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy.description.3",
    "page": "Покупка",
    "block": "buy",
    "label": "За 5 дней поможем без рисков купить объект по цене ниже рынка и получить одобрение по ип",
    "defaultValue": "За 5 дней поможем без рисков купить объект по цене ниже рынка и получить одобрение по ипотеке",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "buy.formtext.4",
    "page": "Покупка",
    "block": "buy",
    "label": "Ответьте на 5 вопросов и получите подборку объектов, готовых к продаже, под ваши требова",
    "defaultValue": "Ответьте на 5 вопросов и получите подборку объектов, готовых к продаже, под ваши требования",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "buy.buttonlabel.5",
    "page": "Покупка",
    "block": "buy",
    "label": "Смотреть подборку",
    "defaultValue": "Смотреть подборку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.programs.1",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Семейная ипотека",
    "defaultValue": "Семейная ипотека",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.programs.2",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Военная ипотека",
    "defaultValue": "Военная ипотека",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.programs.3",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "ИТ‑ипотека",
    "defaultValue": "ИТ‑ипотека",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.programs.4",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Сельская ипотека",
    "defaultValue": "Сельская ипотека",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.programs.5",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Дальневосточная и арктическая ипотека",
    "defaultValue": "Дальневосточная и арктическая ипотека",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.steps.6",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Подберем выгодные",
    "defaultValue": "Подберем выгодные",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.steps.7",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "условия",
    "defaultValue": "условия",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.steps.8",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Поможем собрать",
    "defaultValue": "Поможем собрать",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.steps.9",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "документы",
    "defaultValue": "документы",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.steps.10",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Правильно подадим",
    "defaultValue": "Правильно подадим",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.steps.11",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "заявку в банк",
    "defaultValue": "заявку в банк",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.12",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "9 из 10 человек",
    "defaultValue": "9 из 10 человек",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.13",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "получают",
    "defaultValue": "получают",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.14",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "одобрение по ипотеке через нас",
    "defaultValue": "одобрение по ипотеке через нас",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.15",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Банки‑партнеры:",
    "defaultValue": "Банки‑партнеры:",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.16",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Посчитайте ежемесячный платеж по ипотеке",
    "defaultValue": "Посчитайте ежемесячный платеж по ипотеке",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.label.17",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Стоимость жилья",
    "defaultValue": "Стоимость жилья",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.label.18",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Подобрать ипотеку",
    "defaultValue": "Подобрать ипотеку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.19",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "от",
    "defaultValue": "от",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.20",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "₽ / месяц",
    "defaultValue": "₽ / месяц",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.21",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "* Точную стоимость сообщит менеджер",
    "defaultValue": "* Точную стоимость сообщит менеджер",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.22",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Фото",
    "defaultValue": "Фото",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.23",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Помогли одобрить ипотеку клиенту, которому банки отказывали 2 года",
    "defaultValue": "Помогли одобрить ипотеку клиенту, которому банки отказывали 2 года",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.24",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Анна, старший специалист по недвижимости",
    "defaultValue": "Анна, старший специалист по недвижимости",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.25",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Объекты с ценой ниже рынка — до 30%",
    "defaultValue": "Объекты с ценой ниже рынка — до 30%",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.26",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Бывают разные ситуации — кто‑то переезжает, кому‑то срочно нужны деньги.",
    "defaultValue": "Бывают разные ситуации — кто‑то переезжает, кому‑то срочно нужны деньги.",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "buy-mortgage.text.27",
    "page": "Покупка",
    "block": "buy-mortgage",
    "label": "Поэтому у нас появляются варианты объектов по сниженной цене.",
    "defaultValue": "Поэтому у нас появляются варианты объектов по сниженной цене.",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-closed-base.text.1",
    "page": "Покупка",
    "block": "buy-closed-base",
    "label": "эксклюзивных объектов",
    "defaultValue": "эксклюзивных объектов",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-closed-base.text.2",
    "page": "Покупка",
    "block": "buy-closed-base",
    "label": "за сентябрь в закрытой базе",
    "defaultValue": "за сентябрь в закрытой базе",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-closed-base.text.3",
    "page": "Покупка",
    "block": "buy-closed-base",
    "label": "Каждый проверили",
    "defaultValue": "Каждый проверили",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-closed-base.text.4",
    "page": "Покупка",
    "block": "buy-closed-base",
    "label": "по 52 параметрам,",
    "defaultValue": "по 52 параметрам,",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-closed-base.text.5",
    "page": "Покупка",
    "block": "buy-closed-base",
    "label": "Закрытая база",
    "defaultValue": "Закрытая база",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-closed-base.text.6",
    "page": "Покупка",
    "block": "buy-closed-base",
    "label": "Сейчас работаем",
    "defaultValue": "Сейчас работаем",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-closed-base.text.7",
    "page": "Покупка",
    "block": "buy-closed-base",
    "label": "Загрузить еще 800+",
    "defaultValue": "Загрузить еще 800+",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-new-build.text.1",
    "page": "Покупка",
    "block": "buy-new-build",
    "label": "Бесплатно подберем и поможем с покупкой новостройки",
    "defaultValue": "Бесплатно подберем и поможем с покупкой новостройки",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-new-build.text.2",
    "page": "Покупка",
    "block": "buy-new-build",
    "label": "А также поможем доработать заявку на ипотеку и подадим ее в банк, чтобы повысить шанс од",
    "defaultValue": "А также поможем доработать заявку на ипотеку и подадим ее в банк, чтобы повысить шанс одобрения. Комиссию агентства за вас оплатит застройщик",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "buy-new-build.label.3",
    "page": "Покупка",
    "block": "buy-new-build",
    "label": "Хочу купить новостройку",
    "defaultValue": "Хочу купить новостройку",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "buy-new-build.text.4",
    "page": "Покупка",
    "block": "buy-new-build",
    "label": "Комиссия —",
    "defaultValue": "Комиссия —",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.others.8",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "До 6‑24 месяцев. Много времени уходит на просмотр неактуальных объявлений",
    "defaultValue": "До 6‑24 месяцев. Много времени уходит на просмотр неактуальных объявлений",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "realtor-comparison.ours.9",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Подбираем варианты в среднем за 5 дней из закрытой базы, где 800+ эксклюзивных объектов",
    "defaultValue": "Подбираем варианты в среднем за 5 дней из закрытой базы, где 800+ эксклюзивных объектов",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "realtor-comparison.label.10",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Проверка объекта",
    "defaultValue": "Проверка объекта",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.others.11",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Риск купить проблемный объект, который заберут после покупки или придется судиться годам",
    "defaultValue": "Риск купить проблемный объект, который заберут после покупки или придется судиться годами",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "realtor-comparison.ours.12",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Проверим объект по 52 параметрам: аресты, долги, обременения, прописанные жильцы и т. д.",
    "defaultValue": "Проверим объект по 52 параметрам: аресты, долги, обременения, прописанные жильцы и т. д.",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "realtor-comparison.label.13",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Проверка собственника",
    "defaultValue": "Проверка собственника",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.others.14",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Риск, что продавец, его родные и государство отсудят объект после покупки",
    "defaultValue": "Риск, что продавец, его родные и государство отсудят объект после покупки",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "realtor-comparison.ours.15",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Проверяем собственника на банкротство, судебные ограничения и другие юридические риски",
    "defaultValue": "Проверяем собственника на банкротство, судебные ограничения и другие юридические риски",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "realtor-comparison.others.16",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Продавец может изменить условия перед сделкой, а ошибки в договоре — оставят вас без защ",
    "defaultValue": "Продавец может изменить условия перед сделкой, а ошибки в договоре — оставят вас без защиты",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "realtor-comparison.others.17",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Риск переплатить или долго искать объект из‑за нереалистичных ожиданий",
    "defaultValue": "Риск переплатить или долго искать объект из‑за нереалистичных ожиданий",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.ours.18",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Помогаем купить объект без переплаты или до 30% ниже рыночной цены",
    "defaultValue": "Помогаем купить объект без переплаты или до 30% ниже рыночной цены",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.label.19",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Координация и переговоры",
    "defaultValue": "Координация и переговоры",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.others.20",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Согласовывать звонки и показы придется самому. Из‑за задержек можно упустить подходящий ",
    "defaultValue": "Согласовывать звонки и показы придется самому. Из‑за задержек можно упустить подходящий объект",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "realtor-comparison.ours.21",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Представляем ваши интересы на переговорах, координируем всех участников и планируем пока",
    "defaultValue": "Представляем ваши интересы на переговорах, координируем всех участников и планируем показы под ваш график",
    "maxLength": 600,
    "multiline": true
  },
  {
    "id": "realtor-comparison.label.22",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Оформление ипотеки",
    "defaultValue": "Оформление ипотеки",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "realtor-comparison.others.23",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Риск отказа или одобрения на невыгодных условиях с переплатой миллионов рублей",
    "defaultValue": "Риск отказа или одобрения на невыгодных условиях с переплатой миллионов рублей",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "realtor-comparison.ours.24",
    "page": "Общие блоки",
    "block": "realtor-comparison",
    "label": "Подбираем банки с выгодными условиями и подаем заявку. Вероятность одобрения ∼91%",
    "defaultValue": "Подбираем банки с выгодными условиями и подаем заявку. Вероятность одобрения ∼91%",
    "maxLength": 600,
    "multiline": false
  },
  {
    "id": "sell.answers.title",
    "defaultValue": "Вам не придется отвечать покупателям по 100 раз на одни и те же вопросы",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Заголовок",
    "maxLength": 200,
    "multiline": false
  },
  {
    "id": "sell.answers.description",
    "defaultValue": "Заранее соберем всю техническую и бытовую информацию о вашем объекте и сами ответим на вопросы покупателей на показах",
    "page": "Продажа",
    "block": "sell-answers",
    "label": "Описание",
    "maxLength": 2000,
    "multiline": true
  },
{
  "id": "deal-insurance.name",
  "page": "Общие блоки",
  "block": "deal-insurance",
  "label": "Имя специалиста",
  "defaultValue": "Елена",
  "maxLength": 200,
  "multiline": false
},
  // Имена и должности сотрудников: привязка задается явно в PersonLabel/StaffCard,
  // поэтому повторяющиеся должности не конфликтуют с другими текстами.
  ...Object.entries(people).flatMap(([id, person]) => [
    {
      "id": `person.${id}.name`,
      "page": "Общие блоки",
      "block": "people",
      "label": `${person.name} — имя`,
      "defaultValue": person.name,
      "maxLength": 200,
      "multiline": false
    },
    {
      "id": `person.${id}.role`,
      "page": "Общие блоки",
      "block": "people",
      "label": `${person.name} — должность`,
      "defaultValue": person.role,
      "maxLength": 200,
      "multiline": false
    },
  ])
];
const defaults = new Map(siteTexts.map(item => [item.id, item.defaultValue]));
export function siteText(id) { if (!defaults.has(id)) throw new Error('Unknown site text: '+id); return defaults.get(id); }
