# План прораба — вёрстка трёх страниц

Обновлено 7 октября 2026. Работу ведут параллельные агенты, прораб координирует. Перед началом каждый агент читает agent.md, PROJECT_MEMORY.md, UI_KIT.md и этот файл.

## Страницы и узлы Figma (файл aM7nwXmxjBBW0YcfWe310k)

Главная 1380:4912 (route `/`, src/pages/index.astro) — готово всё до HomeRecruiting включительно. Осталось: FAQ 1380:5736, форма 1380:5753, footer 1380:5754.

Продажа 1380:5755 (route `/sell/`, src/pages/sell.astro), сверху вниз:
- 1380:5758 — первый экран (instance, тот же мастер, что 1380:6363 на «Покупке»)
- 1380:5759 — большой блок 1440×2030 под первым экраном
- 1380:5852 — 1380:5853 (instance, тот же, что 1380:6562 на «Покупке») + 1380:5884
- 1380:5914 — блок «23», 937×454
- 1380:5932 — блок с картой «Dinosaurs_of_Russia» и длинным продолжением (5933, 6182, 6296)
- 1380:6325 — полоса 1160×197
- 1380:6326 — instance 1440×800 (тот же, что 1380:6560 на «Покупке»)
- 1380:6327 — FAQ (аналог главной)
- 1380:6342 — форма (instance, как на главной)
- 1380:6343 — блок «16» с карточками и кнопкой
- 1380:6356 — footer (instance, как на главной)

Покупка 1380:6357 (route `/buy/`, src/pages/buy.astro), сверху вниз:
- 1380:6363 — первый экран (общий мастер с 1380:5758)
- 1380:6364 — блоки «02» 1380:6370 и «03» 1380:6444
- 1380:6462 — текст + окно Safari
- 1380:6553 + 1380:6554 — разделитель-маска и блок «05»
- 1380:6560 — instance 1440×800 (общий с 1380:6326)
- 1380:6561 — 1380:6562 (общий с 1380:5853) + 1380:6563
- 1380:6589 — блок с картой «Dinosaurs_of_Russia» и продолжением (6590, 6839, 6977)
- 1380:7007 — FAQ, 1380:7022 — форма, 1380:7023 — footer

## Волны

Волна 1 (параллельно):
- A — FAQ главной 1380:5736, общий переиспользуемый компонент секции FAQ.
- B — форма 1380:5753 и footer 1380:5754 на главной; footer — общий SiteFooter для всех страниц.
- C — страница «Продажа»: создать маршрут, общий первый экран внутренних страниц (по 1380:5758, с параметрами для «Покупки»), блок 1380:5759.
- D — страница «Покупка»: создать маршрут (место первого экрана оставить комментарием для C/волны 2), блоки 1380:6364, 1380:6462, 1380:6553 + 1380:6554.

Волна 2 (после отчётов волны 1):
- E — первый экран на «Покупке» (общий компонент от C), общий блок 5853/6562 + 5884/6563 на обеих страницах, блок 5914 «Продажи».
- F — блок 1380:5932 «Продажи».
- G — блок 1380:6589 «Покупки».
- H — 6325, общий 6326/6560, 6343; подключение FAQ/формы/footer на обеих внутренних страницах.

Волна 3 — финальная сверка всех трёх страниц с Figma и исправление расхождений.

## Правила параллельной работы

- Свои файлы: новый компонент секции в src/components и свой CSS в src/styles. Общие файлы (global.css, tokens.css, общие компоненты, index.astro, PROJECT_MEMORY.md) менять минимально: сначала перечитать, потом точечная правка. Старые вызовы общих компонентов не ломать.
- Чужие блоки и страницы не трогать. Нашли проблему чужого блока — описать в отчёте.
- Dev-сервер уже работает на http://127.0.0.1:4321/ — второй не запускать. В браузере открыть свою вкладку (tabs_create) и передавать её tabId во все вызовы; viewport менять только у своей вкладки и сбросить после проверки.
- Сборку проверять в отдельный каталог: `npx astro build --outDir <scratchpad>/dist`, чтобы не мешать другим. `npm run check` можно.
- Не пушить, не публиковать, реальные отправки и внешние ссылки не подключать. Если ссылки/файла нет — честная заглушка.
- Только desktop 1440.
- По завершении: дописать свой раздел в PROJECT_MEMORY.md и вернуть прорабу короткий отчёт: что сделано, файлы, проверки, скриншоты, ограничения и проблемы.

## Статус (обновляет прораб)

- Главная — ГОТОВА полностью (A: FaqSection, B: LeadSection + общий SiteFooter).
- Общие блоки для внутренних страниц:
  - FAQ: `<FaqSection id="sell-faq" items={sellFaq} />` — данные в src/data/faq.ts (тип вопроса и `homeFaq`); у вопроса `question`, `answer` (строка или массив абзацев/`{ list: [...] }`), опционально `cta`, `column` (1|2), `tilt`, `node`.
  - Форма: `<LeadSection id="sell-question" node="1380:6342" subject="Вопрос со страницы «Продажа»" />` — ставить сразу после FaqSection; props `id` (уникальный), `title` (перенос `\n`), `subject`, `buttonLabel`, `node`, `anchor`, `endpoint`.
  - Footer выводится автоматически через SiteLayout при `header` — НЕ добавлять SiteFooter вручную.
- Известно: dev-сервер мог падать; если 4321 не отвечает — один раз `npm run dev` в фоне, затем продолжать. Сдвиг вертикали +120 px на главной от HomeTeam — исправлено (волна 3, design-reference/qa-home.md).
- D ГОТОВО: /buy/ — BuyMortgage (6364), BuyClosedBase (6462), BuyNewBuild (6553+6554). На месте первого экрана — распорка `.buy-hero-placeholder` (стили в src/styles/buy-page.css, 650+80 px) и комментарий; при подключении InnerHero распорку удалить. У BuyMortgage z-index:1 — рваный верх перекрывает низ первого экрана.
- В работе: C (/sell/ + InnerHero + 5759), G (/buy/ 6589).
- Задача F (блок 1380:5932 «Продажи») отдана Codex: автозапуск 7 октября в 18:22 МСК (после сброса его лимита), задание design-reference/codex-task-F.md, лог /private/tmp/claude-501/codex/F.log, отчёт /private/tmp/claude-501/codex/F-report.md. Агентам Claude блок 5932 не брать.
- Задача H отдана Codex (gpt-6.1-sol, medium), запуск сразу после F: общий блок 6560/6326 на обеих страницах, общий 6562+6563 / 5853+5884 на обеих, 6325 и 6343 «Продажи», FAQ (6327/7007) и форма (6342/7022) на обеих. Задание design-reference/codex-task-H.md, лог /private/tmp/claude-501/codex/H.log. Агентам Claude эти блоки не брать.
- Для агентов Claude в волне 2 остаётся: E' — InnerHero на «Покупке» (убрать распорку) + блок 5914 «Продажи»; затем волна 3 (финальная сверка).
- C ГОТОВО: /sell/ — InnerHero (1380:5758), SellGossip (5760), SellValuation (5771) + SellWeekCase (5814). Вызов InnerHero для «Покупки» (ресурсы уже в public/assets):
  `<InnerHero node="1380:6363" title={["800+ проверенных объектов", "недвижимости, которых нет"]} markets description="За 5 дней поможем без рисков купить объект по цене ниже рынка и получить одобрение по ипотеке" formText="Ответьте на 5 вопросов и получите подборку объектов, готовых к продаже, под ваши требования" image={{ src: "/assets/5ab39.webp", ratio: "1081 / 812", width: 1081, height: 250.368 }} shadow={{ src: "cfc23.svg", left: 20.5, top: 29.5, width: 303, height: 185, bleed: "-36.52% -15.61% -36.28% -31.99%" }} buttonLabel="Смотреть подборку" subject="Подборка объектов" />`
  Фон и команда первого экрана выходят ниже 650 px — следующей секции нужны position: relative и z-index: 1 (у BuyMortgage уже z-index: 1).
- Замечено C (для финальной сверки): порядок иконок в RatingBadge (в макете внутреннего экрана Яндекс первый).
- Все запуски перенесены пользователем на 21:00 МСК: Codex F→H и новые агенты Claude (E'). Сейчас работает только G.
- InnerHero на «Покупке» ПОДКЛЮЧЁН прорабом (распорки больше нет). Для волны 2 у Claude остаётся только блок 5914 «Продажи», затем волна 3.
- G ГОТОВО: /buy/ блок 6589 — RelocationMap (6590), DealSteps (6839), RealtorComparison (6977) + новые общие TapedNote, AccentStatement, ComparisonTable variant="risk". Для «Продажи» 5932 (Codex F) — ПЕРЕИСПОЛЬЗОВАТЬ: `<RelocationMap id="sell-relocation" title=… annotation=… description=… layers={…} node=… />`, `<DealSteps id="sell-steps" steps={sellDealSteps} node="1380:6182" />` (поле `list` для шагов со списками), `<RealtorComparison id="sell-realtor" rows={…} subject=…><AccentStatement slot="statement">…</AccentStatement></RealtorComparison>`. RelocationMap сам держит верхний отступ 120 px — блоку перед ним (6561) его не дублировать.
- Для финальной сверки: новые компоненты не внесены в src/data/component-registry.ts.
- Сейчас агентов Claude не работает. Следующие запуски — 21:00 МСК.
- 21:00: фоновые скрипты Codex не пережили перезапуск сессии — прораб перезапустил вручную в 21:00: Codex F работает, H стартует после F. Dev-сервер работает. Запущен агент Claude E' на блок 5914 «Продажи». Паузы по лимиту не было (лимит сброшен до 0%).
- E' ГОТОВО: SellAnswers (5914) на /sell/ — сам держит 120 px сверху, снизу без отступа.
- Codex F ГОТОВО (21:13): SellProcess на /sell/ (карта, 11 шагов, сравнение) на общих RelocationMap/DealSteps/RealtorComparison. Отчёт /private/tmp/claude-501/codex/F-report.md.
- Codex H запущен в 21:14.
- Волна 3, часть 1: агент QA сверяет главную (+120 px, отступ кнопок с иконкой 24 px справа). Часть 2 — сверка /sell/ и /buy/ после Codex H.
- Codex H ГОТОВО (отчёт design-reference/H_REPORT.md): TrustAndViewing (5852/6561), OfficeConsultation (6326/6560), SellCommissionNote (6325), ReferralBonus (6343), FAQ и формы на обеих страницах. Все блоки трёх страниц сверстаны.
- Волна 3: главная сверена (design-reference/qa-home.md, +120 px исправлено). Запущены сверки /sell/ и /buy/ (итог в design-reference/qa-sell.md, qa-buy.md).
- Codex: задача I (скорость загрузки, design-reference/codex-task-I.md → perf.md), затем J (актуализация /ui-kit/, реестра и UI_KIT.md, design-reference/codex-task-J.md). Логи /private/tmp/claude-501/codex/I.log, J.log.


## Расписание по окнам лимитов (составлено 7 октября 22:10)
Задания — в design-reference/tasks/ (общие правила _common.md).

Окно 1 — 02:00 (лимиты Claude и Codex сброшены):
- Claude R1 — продолжение адаптива главной (агент остановлен ~22:00 на этапе плана, план design-reference/responsive-home-plan.md).
- Claude R2 — адаптив /sell/ (tasks/claude-R2-sell-responsive.md).
- Codex K — адаптив /buy/ (tasks/codex-K-buy-responsive.md), затем Codex L — SEO/мета (tasks/codex-L-seo.md). Стартуют после завершения текущих Codex I/J.

Окно 2 — 07:05:
- Claude: сначала продолжить агентов окна 1, если остановились по лимиту; затем Q1 — сквозная проверка адаптива (tasks/claude-Q1-responsive-qa.md) и Q2 — доступность (tasks/claude-Q2-a11y.md).
- Codex M — скорость на телефоне и хвосты (tasks/codex-M-mobile-perf.md), затем Codex N — документация и итоговая сборка (tasks/codex-N-docs.md).

## Адаптив: владение компонентами (окно 1)
- Агент адаптива главной (R1): index.astro и все Home*/секции главной, а также ГЛОБАЛЬНЫЕ общие: SiteLayout, SiteHeader, SiteFooter, Button, ArrowButton, Paper, PaperQuote, Badge, Carousel, FaqCard, FaqSection, LeadSection, LeadForm, LeadDialog, ChoiceGroup, PropertyCard, StaffCard, ReviewCard, PlayButton, RatingBadge, PartnerLogos, NumberedBenefit, SpeechBubble, SocialLinks, SectionHeading, ServiceCard, global.css, tokens.css.
- Агент адаптива /sell/ (R2): sell.astro, все Sell*, а также InnerHero, TrustAndViewing, OfficeConsultation (работают и на /buy/).
- Codex K (/buy/): buy.astro, все Buy*, RangeField, а также RelocationMap, DealSteps, RealtorComparison, ComparisonTable, TapedNote, AccentStatement (работают и на /sell/).
- Нужна правка чужого компонента — описать в отчёте, владелец/прораб внесёт.
- 7 окт 22:18: Codex I (скорость) и J (UI kit) ГОТОВЫ — design-reference/perf.md, отчёты /private/tmp/claude-501/codex/I-report.md, J-report.md. Остановленный агент адаптива главной успел добавить в index.astro импорт home-responsive.css без файла — прораб создал пустой src/styles/home-responsive.css (агент R1 заполнит).

## Утро 8 октября (07:25)
- Ночные запуски Claude (02:01, 07:06) НЕ сработали: сессия стояла на паузе из-за лимита. Codex отработал K, L, M, N (отчёты design-reference/K_REPORT.md, L_REPORT.md, M_REPORT.md, N_REPORT.md, передача M_R1_R2_HANDOFF.md).
- 07:25 запущены: R1 (адаптив главной + глобальные компоненты, продолжение) и R2 (адаптив /sell/). После их отчётов: Q1 (сквозная проверка адаптива), Q2 (доступность); Codex — повтор замеров скорости на телефоне и подключение мобильных фото по M_R1_R2_HANDOFF.md, если R1/R2 не сделают.
- Нужно от заказчика: домен (canonical/sitemap).
- 07:3x: пользователь остановил всех. R1 (адаптив главной) остановлен на проверке desktop 1440 против эталона; R2 (адаптив /sell/) — посреди правок CSS InnerHero. Codex не работает. Продолжать только по команде пользователя (SendMessage тем же агентам).
