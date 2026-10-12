# Библиотека интерфейса

## Сборка страниц

Оборачивать страницу в `SiteLayout`, использовать `SiteHeader`, `SiteFooter` и компоненты из `src/components`. Глобальные стили загружаются в layout; `ui-kit.css` подключается только в демонстрационной странице. Все найденные повторяющиеся семейства перечислены на `/ui-kit/#registry` и в `src/data/component-registry.ts`. Общие секции внутренних страниц, офисная консультация, карта и шаги сделки также показаны в библиотеке; уникальные секции конкретных страниц в реестр общих компонентов не входят.

## Токены

`src/styles/tokens.css`: семантические цвета, шрифты, размеры текста, интерлиньяж, вес, шкала отступов, контейнер, сетка, радиусы, контрольные размеры, тени, фокус, время перехода и текстуры. Общие значения используются через CSS variables. Локальные значения геометрии портретов, вырезок и SVG сохраняются в компонентных стилях. Пороги медиазапросов остаются литералами: CSS custom properties нельзя использовать в условиях медиазапроса. Исторические правила UI kit используют 1200/800/540 px; новые правила адаптива страниц — max-width: 1199px/767px (при необходимости 539px). Полный адаптив сайта ещё не завершён; состояние — в README.md и PROJECT_MEMORY.md.

Настроены локальные Forma Regular/Medium/Bold, Calibri Regular/Bold, Denistina и Inter Tight. Размеры изображений и компонентов взяты из сохранённых контекстов Figma. Рваные края кнопок и бумаги воспроизведены CSS; точное пиксельное совпадение их контура не заявляется. Мобильные компоновки, состояния hover/focus/disabled и интерактивность добавлены в коде.

## Данные

- `PropertyCard`: title, image, address, price, oldPrice, pricePerMeter, mortgage, discount. Название передаётся в тему заявки.
- `StaffCard`: name, role, image, badge, facts, shadow, variant, certificate. shadow — отдельная SVG-тень, certificate — изображение сертификата.
- `ServiceCard`: title, description, cta, variant="kit"|"coupon", node. Купон показан с теми же текстами, что на главной; данные по умолчанию соответствуют первой услуге.
- `ReviewCard`: name, image, duration, video. Без video показывается явный статус демонстрации.
- `FaqCard`: question, answer, cta; variant="accordion" (id, open, node) для секции FAQ.
- `FaqSection`: items (FaqItem[] из src/data/faq.ts), title, id, node, class. id — уникальный префикс заголовка и всех вопросов; в библиотеке показаны homeFaq, buyFaq и sellFaq. По решению пользователя (TASK-017) на всех ширинах, включая `/ui-kit/`, изначально открыт только первый ответ (SSR); остальные закрыты и имеют `inert`. Ручное переключение сохраняется. Отдельный `FaqCard` сохраняет `open=true` по умолчанию.
- `ComparisonTable`: rows с label, ours, others (boolean или текст), variant="default"|"risk", columns, icons, caption. Для risk строки содержат risk (1–5) и node; данные покупки и продажи импортируются из src/data/*realtor-comparison.ts.
- `ChoiceGroup`: name, options (массив строк), selected (индекс; −1 — нет выбора), channels, icons (имена файлов), loading; событие choice-change.
- `SocialLinks`: dark, size (32|40), loading, links ({ label, icon, href? }[]); реальные ссылки передаются через links. Без links — демонстрационные иконки.
- `LeadForm`: уникальный id, variant question/contact, compact, title, buttonLabel, subject, endpoint, node. Без endpoint форма ничего не отправляет. При подключённом endpoint POST JSON; успех показывается только после успешного ответа.
- `Carousel`: label, class; содержимое через slot; прокрутка, стрелки и пагинация управляют реальными карточками.

- `LeadSection`: id, title (перенос через `\n`), subject, buttonLabel, node, anchor, endpoint. id задаёт уникальный префикс полей, anchor — id секции; без endpoint реальной отправки нет.
- `InnerHero`: title (массив строк), accent, accentLine, markets, description, formText, image, shadow, buttonLabel, buttonIcon, subject, options, node. image задаёт путь и геометрию буклета, shadow — путь и координаты SVG-тени; компонент содержит фиксированный id заголовка, поэтому на одной странице показывается один экземпляр.
- `HeroTeam`: без props; исходная композиция портретов и SVG-теней команды главной. В UI kit размеры контейнера заданы только демонстрационным CSS.
- `RatingBadge`: rating (по умолчанию "5.0"), yandexFirst меняет порядок сервисов, loading управляет загрузкой иконок. Оба порядка показаны в библиотеке.
- `TapedNote`: textured, icon ({ src, width, height }), rotate, class, node; содержимое через slot. В библиотеке показана заметка с иконкой из buyDealSteps, текстурная заметка — внутри RealtorComparison.
- `AccentStatement`: node, class, содержимое через slot; strong выделяет тёмную часть фразы. Показан внутри RealtorComparison и SellCommissionNote с текстами страниц.
- `RelocationMap`: id, class, map ({ src, width, height, fade }), title, annotation, description, layers, node. Слои задают исходные ресурсы, размеры, координаты, rotate и flipY; без переопределений выводится карта покупки.
- `DealSteps`: steps (DealStep[]), id, class, missionTitle, missionAccent, missionText, node. Шаги поддерживают изображения, метки, воронку, заметку и список; в UI kit обе полные последовательности из src/data показаны в раскрываемых блоках.
- `RealtorComparison`: rows, id, class, note, title, columns, icons, ctaLabel, subject, node, background, showStatement. slot="statement" заменяет завершающий AccentStatement; по умолчанию используются тексты и оформление покупки.
- `OfficeConsultation`: variant="buy"|"sell", id, node. Вариант выбирает тексты консультации, id — уникальный префикс заголовка.
- `TrustAndViewing`: variant="buy"|"sell"; объединяет DealInsurance и PreparedViewing. Вложенные id формируются из варианта, поэтому каждый вариант демонстрируется один раз.
- `DealInsurance`: id, node, subject; общий блок страховки с CTA. В UI kit представлен внутри TrustAndViewing, отдельно не дублируется.
- `PreparedViewing`: variant="buy"|"sell", id, node; вариант меняет заголовок, иллюстрации и пояснения показа. В UI kit представлен внутри TrustAndViewing.
- `ReferralBonus`: без props; композиция из ReferralNotification и TapedNote с текстами и сроками из макета. Банковские уведомления — иллюстрация, условия акции не подключены.
- `ReferralNotification`: bank, time, icon (имя ресурса без расширения), masked. masked включает исходную маску иконки Т-Банка; компонент показан внутри ReferralBonus.
- `SellCommissionNote`: без props; готовая полоса AccentStatement с условием оплаты комиссии после зачисления денег продавцу.
- `LeadDialog`: без props; один экземпляр подключается SiteLayout и открывается кнопками с data-lead. В библиотеке проверяется через CTA общих секций.

## Остальные общие компоненты и props

Ниже дополнены записи реестра после задачи J. Это параметры существующих исходников, без изменения поведения. Содержимое по умолчанию остаётся из макета.

- `SiteLayout`: title, noindex, header (по умолчанию false), footer (по умолчанию равен header); содержимое через slot. Для трёх публичных маршрутов title/description заданы в layout; переданный title — запасной для остальных маршрутов. Диалог заявки один на документ, footer автоматически выводится при header. UI kit подключает footer вручную.
- `SiteHeader`: nav ({ label, href }[]), home, city, desktop, socialLinks ({ label, icon, href? }[]). Без href соцсеть остаётся заглушкой.
- `SiteFooter`: nav ({ label, href }[]), node; demo объявлен для совместимости с UI kit и не меняет поведение. Юридические документы остаются заглушками.
- `Button`: label, tone="red"|"black", icon (false|true|"buy"|"sell"|"access"), disabled, type="button"|"submit", subject, loading. Обычная кнопка открывает LeadDialog через data-lead, submit работает внутри формы.
- `ArrowButton`: direction="next"|"prev", disabled.
- `PlayButton`: label, video, variant="white"|"red". Без video — сообщение о демонстрации.
- `Paper`: class, tape, node; содержимое через slot. `PaperQuote`: tape (по умолчанию true), цитата через slot.
- `Badge`: text (обязательный), class.
- `SectionHeading`: title, description, annotation, center; title выводится как h2, annotation — рукописная подпись.
- `NumberedBenefit`: number, text; slot заменяет текст и позволяет сохранить переносы.
- `SpeechBubble`: text, side="left"|"right", tail (имя SVG-файла), class, loading.
- `RangeField`: id, label (обязательные), min=1, max=20, step=0.1, value=10.9, unit="млн ₽", class; обновляет output и --range-progress по нативному событию input (события range-change нет).
- `PartnerLogos`: home (полная композиция главной), etalonIndex (позиция логотипа Эталон в стандартном наборе).

`FaqCard` также принимает variant="kit"|"accordion" (kit по умолчанию); answer — строка или массив FaqAnswerBlock (абзацы и `{ list: [...] }`). `FaqItem` в данных секции содержит question, answer, cta?, column? (1|2), tilt?, node?. `DealStep`, включая textParts, изображения, chips, funnel, note, list и line, описан типом в src/data/deal-steps.ts. Геометрия `InnerHero.shadow`: src, left, top, width, height, bleed; `RelocationMap.layers`: src, width, height, left, top, rotate?, class?, flipY?. Для динамического нового ресурса необходимо проверить запись размеров в src/lib/image-size.ts.

## Граница готовности

Библиотека предназначена для сборки трёх продающих страниц. Sanity, серверная обработка и хранение заявок, настоящие видео и адреса соцсетей, юридические страницы и публикация — отдельный этап. Проверка готовности UI kit не подтверждает работу этих сервисов.

FAQ (TASK-017): на всех ширинах изначально раскрыт только первый ответ. Единственный эталон высот и секций на 1440 px — `design-reference/baseline-1440.json`; высоты `/` — 17717 px, `/sell/` — 16058 px, `/buy/` — 16023 px.

Перед сдачей и после больших правок запускай `node scripts/check-baseline.mjs`.
