// Исходные размеры экспортов: только серверная сборка, без клиентского JS.
const dimensions: Record<string, { width: number; height: number }> = {
  "/assets/staff-aleksandra-barkovskaya.webp": { width: 1280, height: 1280 },
  "/assets/staff-ekaterina-mikhaylenko.webp": { width: 1000, height: 1000 },
  "/assets/staff-dana-gurova.webp": { width: 1000, height: 1000 },
  "/assets/client-review-natalya-cover.webp": { width: 793, height: 1000 },
  "/assets/client-review-darya-cover.webp": { width: 831, height: 1049 },
  "/assets/client-review-olga-cover.webp": { width: 834, height: 1049 },
  "/assets/client-review-sergey-cover.webp": { width: 834, height: 1054 },
  "/assets/icon-play.svg": { width: 51, height: 51 },
  "/assets/catalog-browser-window-lights.svg": { width: 31, height: 13 },
  "/assets/catalog-browser-navigation.svg": { width: 54, height: 15 },
  "/assets/catalog-browser-reload.svg": { width: 5, height: 6 },
  "/assets/catalog-browser-page-options.svg": { width: 7, height: 7 },
  "/assets/catalog-browser-toolbar-actions.svg": { width: 55, height: 15 },
  "/assets/property-selection-catalog.webp": {
    width: 856,
    height: 500,
  },
  "/assets/rating-star.svg": {
    width: 12,
    height: 12,
  },
  "/assets/icon-speech-bubble-white.svg": {
    width: 18,
    height: 13.649,
  },
  "/assets/logo-yandex-maps-full-export.svg": {
    width: 91.221,
    height: 24,
  },
  "/assets/blockbuster-case-background.webp": {
    width: 4096,
    height: 2196,
  },
  "/assets/logo-monopoly-wordmark-header.svg": {
    width: 131,
    height: 13,
  },
  "/assets/staff-elena-gorbaneva-consultation.webp": {
    width: 1280,
    height: 1600,
  },
  "/assets/trust-team-shadow-right.svg": {
    width: 372.636,
    height: 447.175,
  },
  "/assets/inner-hero-team-shadow-left.svg": {
    width: 419.01,
    height: 598.479,
  },
  "/assets/sell-steps-object-details-connector.svg": {
    width: 2,
    height: 219.538,
  },
  "/assets/decor-yellow-price-tag.svg": {
    width: 18,
    height: 5.906,
  },
  "/assets/social-max-color.svg": {
    width: 33.6881,
    height: 34.766,
  },
  "/assets/icon-yandex-map-pin.svg": {
    width: 10.08,
    height: 12.6,
  },
  "/assets/office-consultation-background.webp": {
    width: 2880,
    height: 1598,
  },
  "/assets/texture-paper-beige-export.webp": {
    width: 1024,
    height: 683,
  },
  "/assets/buyer-director-shadow.svg": {
    width: 282.415,
    height: 384.063,
  },
  "/assets/decor-light-panel.svg": {
    width: 32,
    height: 32,
  },
  "/assets/home-hero-team/04-left-front.webp": { width: 958, height: 1496 },
  "/assets/home-hero-team/04-left-front-shadow.svg": { width: 394, height: 579 },
  "/assets/home-hero-team/06-right-inner.webp": { width: 771, height: 1345 },
  "/assets/home-hero-team/06-right-inner-shadow.svg": { width: 354, height: 566 },
  "/assets/hero-team-center-portrait.webp": {
    width: 549,
    height: 1600,
  },
  "/assets/partner-ingosstrakh-home.svg": {
    width: 257.612,
    height: 82.3724,
  },
  "/assets/icon-transaction-note.svg": {
    width: 32,
    height: 32,
  },
  "/assets/review-client-woman-gray.webp": {
    width: 1856,
    height: 2304,
  },
  "/assets/hero-team-right-inner-portrait.webp": {
    width: 969,
    height: 1600,
  },
  "/assets/sell-steps-plan-connector.svg": {
    width: 2,
    height: 603.805,
  },
  "/assets/trust-team-left-center-portrait.webp": {
    width: 2336,
    height: 3504,
  },
  "/assets/logo-monopoly-wordmark-footer.svg": {
    width: 201,
    height: 20,
  },
  "/assets/recruiting-note-icon.svg": {
    width: 36,
    height: 36,
  },
  "/assets/hero-team-right-inner-shadow.svg": {
    width: 351.909,
    height: 526.222,
  },
  "/assets/sell-realtor-comparison-background.webp": {
    width: 2880,
    height: 2524,
  },
  "/assets/partner-glorax.svg": {
    width: 147.629,
    height: 73.4912,
  },
  "/assets/buy-mortgage-background.webp": {
    width: 2880,
    height: 3823,
  },
  "/assets/trust-rating-star.svg": {
    width: 13.1982,
    height: 12.7189,
  },
  "/assets/review-svetlana-thumbnail.webp": {
    width: 893,
    height: 1600,
  },
  "/assets/logo-monopoly-wordmark-browser.svg": {
    width: 58.1002,
    height: 5.75175,
  },
  "/assets/decor-transparent-export.svg": {
    width: 32,
    height: 32,
  },
  "/assets/icon-house-arrow-white.svg": {
    width: 12.0132,
    height: 12.9375,
  },
  "/assets/icon-external-link.svg": {
    width: 18.3777,
    height: 18.4458,
  },
  "/assets/partner-domclick-green-export.svg": {
    width: 110.249,
    height: 23.8154,
  },
  "/assets/sell-week-story-quote.svg": {
    width: 26.0607,
    height: 20.4199,
  },
  "/assets/sell-gossip-neighbors-and-team.webp": {
    width: 2160,
    height: 1056,
  },
  "/assets/partner-setlgroup-home.svg": {
    width: 179.025,
    height: 82.3724,
  },
  "/assets/icon-city-location-pin.svg": {
    width: 10.08,
    height: 12.6,
  },
  "/assets/relocation-airplane-photo.webp": {
    width: 134,
    height: 56,
  },
  "/assets/relocation-plane-arrow.svg": {
    width: 32.6049,
    height: 26.2172,
  },
  "/assets/prepared-viewing-decor.svg": {
    width: 36,
    height: 36,
  },
  "/assets/partner-dom-rf-home.svg": {
    width: 102.206,
    height: 82.3724,
  },
  "/assets/icon-quiz-cursor.svg": {
    width: 20.3387,
    height: 20.643,
  },
  "/assets/prepared-viewing-arrows.svg": {
    width: 279.577,
    height: 32.8059,
  },
  "/assets/social-whatsapp-color.svg": {
    width: 33.6881,
    height: 34.766,
  },
  "/assets/sell-quiz-booklet-shadow.svg": {
    width: 444.728,
    height: 326.185,
  },
  "/assets/icon-button-access.svg": {
    width: 16,
    height: 16,
  },
  "/assets/office-future-photo-placeholder.webp": {
    width: 256,
    height: 256,
  },
  "/assets/deal-mission-quote.svg": {
    width: 42.6102,
    height: 33.2195,
  },
  "/assets/sell-week-video-thumbnail.webp": {
    width: 960,
    height: 640,
  },
  "/assets/company-recommendations-icon.svg": {
    width: 36,
    height: 36,
  },
  "/assets/office-belogorsk-interior.webp": {
    width: 500,
    height: 375,
  },
  "/assets/staff-darya-shport.webp": {
    width: 2050,
    height: 2088,
  },
  "/assets/logo-realtors-guild.svg": {
    width: 399.44,
    height: 352.154,
  },
  "/assets/icon-comparison-cross-sell.svg": {
    width: 20,
    height: 20,
  },
  "/assets/decor-transparent-export-alternate.svg": {
    width: 32,
    height: 32,
  },
  "/assets/partner-lsr.svg": {
    width: 125.607,
    height: 73.4912,
  },
  "/assets/background-paper-tall-white.webp": {
    width: 1600,
    height: 2359,
  },
  "/assets/office-speech-tail.svg": {
    width: 42.1834,
    height: 24.8581,
  },
  "/assets/relocation-map-sell.svg": {
    width: 5386.13,
    height: 3035.38,
  },
  "/assets/icon-property-location-pin.svg": {
    width: 10,
    height: 14,
  },
  "/assets/director-coffee-note-icon.svg": {
    width: 36,
    height: 36,
  },
  "/assets/social-telegram-color.svg": {
    width: 35.99,
    height: 35.4799,
  },
  "/assets/prepared-viewing-apartment-before.webp": {
    width: 2880,
    height: 1514,
  },
  "/assets/property-viewing-route-map.webp": {
    width: 856,
    height: 515,
  },
  "/assets/texture-paper-warm-export.webp": {
    width: 1024,
    height: 683,
  },
  "/assets/fast-sale-note-icon.svg": {
    width: 36,
    height: 36,
  },
  "/assets/sell-valuation-background.webp": {
    width: 2160,
    height: 2073,
  },
  "/assets/company-avito-icon.svg": {
    width: 13.3333,
    height: 28,
  },
  "/assets/staff-elena-murashkina.webp": {
    width: 2048,
    height: 2048,
  },
  "/assets/prepared-viewing-rating-after.svg": {
    width: 121.686,
    height: 35.9662,
  },
  "/assets/partner-domclick-green-alternate.svg": {
    width: 111.104,
    height: 24,
  },
  "/assets/mortgage-documents-stack.webp": {
    width: 856,
    height: 819,
  },
  "/assets/deal-mission-specialist.webp": {
    width: 770,
    height: 820,
  },
  "/assets/buy-catalog-booklet-shadow.svg": {
    width: 735.144,
    height: 600.437,
  },
  "/assets/inner-hero-team-shadow-center.svg": {
    width: 409.648,
    height: 655.402,
  },
  "/assets/trust-team-left-portrait.webp": {
    width: 1376,
    height: 2064,
  },
  "/assets/icon-contact-max.svg": {
    width: 18.3777,
    height: 18.4458,
  },
  "/assets/speech-tail-white-left.svg": {
    width: 42.1834,
    height: 24.8581,
  },
  "/assets/icon-bank-tbank-notification-mask.svg": {
    width: 40,
    height: 40,
  },
  "/assets/partner-sodruzhestvo.svg": {
    width: 182.536,
    height: 73.4912,
  },
  "/assets/sell-valuation-booklet-shadow.svg": {
    width: 642.729,
    height: 498.849,
  },
  "/assets/property-sale-plan.webp": {
    width: 856,
    height: 605,
  },
  "/assets/decor-saint-george-ribbon.webp": {
    width: 1024,
    height: 550,
  },
  "/assets/transaction-preliminary-contract.webp": {
    width: 856,
    height: 701,
  },
  "/assets/icon-choice-check.svg": {
    width: 14,
    height: 14,
  },
  "/assets/partner-dom-rf.svg": {
    width: 87.8154,
    height: 73.4912,
  },
  "/assets/honest-reviews-person-shadow.svg": {
    width: 36,
    height: 36,
  },
  "/assets/buyer-catalog-booklet.webp": {
    width: 1024,
    height: 763,
  },
  "/assets/home-hero-background.svg": {
    width: 306.567,
    height: 151.698,
  },
  "/assets/review-client-woman-table.webp": {
    width: 1536,
    height: 2752,
  },
  "/assets/transaction-registration-documents.webp": {
    width: 569,
    height: 740,
  },
  "/assets/blockbuster-case-person-shadow.webp": {
    width: 4096,
    height: 2196,
  },
  "/assets/company-about-decor.svg": {
    width: 12,
    height: 28,
  },
  "/assets/insurance-bottom-paper-edge.svg": {
    width: 1440,
    height: 51.5,
  },
  "/assets/catalog-building-photo.webp": {
    width: 845,
    height: 14,
  },
  "/assets/icon-contact-telegram.svg": {
    width: 18.3777,
    height: 18.4458,
  },
  "/assets/icon-yandex-map-dot.svg": {
    width: 3.5379,
    height: 3.5379,
  },
  "/assets/speech-tail-blue-left.svg": {
    width: 42.1834,
    height: 24.8581,
  },
  "/assets/transaction-documents-icon.svg": {
    width: 2,
    height: 138,
  },
  "/assets/icon-comparison-cross.svg": {
    width: 20,
    height: 20,
  },
  "/assets/consultation-person-shadow.svg": {
    width: 498.909,
    height: 656.2,
  },
  "/assets/bank-ozon-logo.svg": {
    width: 40,
    height: 40,
  },
  "/assets/company-office-interior.webp": {
    width: 2880,
    height: 2880,
  },
  "/assets/tape-beige-export.webp": {
    width: 861,
    height: 260,
  },
  "/assets/texture-paper-crumpled.webp": {
    width: 740,
    height: 569,
  },
  "/assets/staff-elena-sidelina-at-desk.webp": {
    width: 1024,
    height: 768,
  },
  "/assets/transaction-step-note-icon.svg": {
    width: 2,
    height: 114,
  },
  "/assets/buy-quiz-booklet-shadow.webp": {
    width: 1081,
    height: 812,
  },
  "/assets/office-building-photo.svg": {
    width: 5386.13,
    height: 3035.38,
  },
  "/assets/funnel-selection-icon.webp": {
    width: 172,
    height: 69,
  },
  "/assets/trust-team-shadow-left.svg": {
    width: 387.153,
    height: 471.92,
  },
  "/assets/social-max-dark.svg": {
    width: 42.1101,
    height: 43.4575,
  },
  "/assets/building-apartment-tower.webp": {
    width: 1280,
    height: 720,
  },
  "/assets/transaction-step-connector.svg": {
    width: 2,
    height: 528.318,
  },
  "/assets/icon-menu-burger.svg": {
    width: 35.3762,
    height: 37.532,
  },
  "/assets/transaction-step-final-connector.svg": {
    width: 2,
    height: 204,
  },
  "/assets/office-photo-decor.svg": {
    width: 29,
    height: 40,
  },
  "/assets/honest-reviews-fake-review-card.webp": {
    width: 987,
    height: 916,
  },
  "/assets/director-quote-mark.svg": {
    width: 40.6347,
    height: 31.2264,
  },
  "/assets/company-about-note-icon.svg": {
    width: 18.6667,
    height: 18.6667,
  },
  "/assets/decor-green-panel.svg": {
    width: 18,
    height: 18,
  },
  "/assets/property-advertising-channels.webp": {
    width: 856,
    height: 547,
  },
  "/assets/icon-comparison-check-sell.svg": {
    width: 20,
    height: 20,
  },
  "/assets/tape-white-export.webp": {
    width: 861,
    height: 260,
  },
  "/assets/trust-team-right-center-portrait.webp": {
    width: 1376,
    height: 2064,
  },
  "/assets/blockbuster-warning-icon.svg": {
    width: 42.1834,
    height: 24.8581,
  },
  "/assets/prepared-viewing-note-icon.svg": {
    width: 36,
    height: 36,
  },
  "/assets/deal-mission-emoji.webp": {
    width: 160,
    height: 160,
  },
  "/assets/risk-meter-inactive.svg": {
    width: 92,
    height: 8,
  },
  "/assets/cases-quote-mark.svg": {
    width: 26.0607,
    height: 20.4199,
  },
  "/assets/sell-steps-document-check-connector.svg": {
    width: 2,
    height: 643.347,
  },
  "/assets/equal-interests-team-background.webp": {
    width: 1920,
    height: 1253,
  },
  "/assets/relocation-route-central-sell.svg": {
    width: 686,
    height: 184.074,
  },
  "/assets/office-history-arrow.svg": {
    width: 27.7755,
    height: 23.3,
  },
  "/assets/honest-reviews-background.svg": {
    width: 20,
    height: 20,
  },
  "/assets/telegram-person-shadow.svg": {
    width: 514.447,
    height: 665.128,
  },
  "/assets/relocation-plane-arrow-alternate.svg": {
    width: 32.6049,
    height: 26.2172,
  },
  "/assets/relocation-route-east.svg": {
    width: 401,
    height: 192.321,
  },
  "/assets/marketplace-wildberries-logo.svg": {
    width: 40,
    height: 40,
  },
  "/assets/gossip-paper-edge.svg": {
    width: 1440,
    height: 51.5,
  },
  "/assets/honest-reviews-boxing-specialist.webp": {
    width: 3128,
    height: 2012,
  },
  "/assets/background-paper-edge-white.svg": {
    width: 1440,
    height: 80,
  },
  "/assets/property-viewing-house.webp": {
    width: 856,
    height: 534,
  },
  "/assets/recruiting-speech-tail.svg": {
    width: 1480,
    height: 288,
  },
  "/assets/staff-pavel-barkovsky-fast-sale.webp": {
    width: 1024,
    height: 683,
  },
  "/assets/background-paper-edge-light.webp": {
    width: 1169,
    height: 28,
  },
  "/assets/blockbuster-decoration.webp": {
    width: 1024,
    height: 683,
  },
  "/assets/service-card-notch.svg": {
    width: 10,
    height: 5,
  },
  "/assets/catalog-browser-decor.svg": {
    width: 14.1924,
    height: 14.1924,
  },
  "/assets/property-selection-funnel.webp": {
    width: 596,
    height: 891,
  },
  "/assets/partner-rosgosstrakh-home.svg": {
    width: 247.615,
    height: 82.3724,
  },
  "/assets/recruiting-paper-edge.svg": {
    width: 1480,
    height: 288,
  },
  "/assets/staff-evgeniya-matukhnova-shadow.svg": {
    width: 380.796,
    height: 409.934,
  },
  "/assets/deal-steps-paper-edge.svg": {
    width: 1447,
    height: 95.713,
  },
  "/assets/social-telegram-dark.svg": {
    width: 44.9875,
    height: 44.3498,
  },
  "/assets/bank-sovcombank-logo.svg": {
    width: 40,
    height: 40,
  },
  "/assets/partner-brusnika.svg": {
    width: 189.33,
    height: 73.4912,
  },
  "/assets/buyer-quote-mark.svg": {
    width: 42.6102,
    height: 33.2195,
  },
  "/assets/fast-sale-person-shadow.svg": {
    width: 447.463,
    height: 580.875,
  },
  "/assets/bank-tbank-logo.svg": {
    width: 40,
    height: 40,
  },
  "/assets/risk-meter-one.svg": {
    width: 66,
    height: 10,
  },
  "/assets/trust-team-paper-edge.webp": {
    width: 3014,
    height: 468,
  },
  "/assets/mortgage-document-photo.webp": {
    width: 1024,
    height: 967,
  },
  "/assets/faq-toggle-background.svg": {
    width: 38.5917,
    height: 37.8297,
  },
  "/assets/risk-meter-four.svg": {
    width: 66,
    height: 10,
  },
  "/assets/footer-background.svg": {
    width: 1440,
    height: 99.2076,
  },
  "/assets/staff-ekaterina-korneeva-telegram.webp": {
    width: 1630,
    height: 3490,
  },
  "/assets/sell-steps-viewing-connector.svg": {
    width: 2,
    height: 335,
  },
  "/assets/decor-cross-mark.svg": {
    width: 26.0607,
    height: 20.4199,
  },
  "/assets/prepared-viewing-apartment-after.webp": {
    width: 2880,
    height: 1310,
  },
  "/assets/sell-steps-advertising-connector.svg": {
    width: 2,
    height: 614.53,
  },
  "/assets/sell-week-play-arrow.svg": {
    width: 65.6246,
    height: 23.5714,
  },
  "/assets/background-brick-wall.webp": {
    width: 1600,
    height: 1600,
  },
  "/assets/certificates-background.webp": {
    width: 2880,
    height: 1241,
  },
  "/assets/decor-red-dot.svg": {
    width: 16,
    height: 16,
  },
  "/assets/relocation-route-central.svg": {
    width: 686,
    height: 186.419,
  },
  "/assets/icon-chevron-down.svg": {
    width: 6,
    height: 3.5,
  },
  "/assets/decor-lime-price-tag.svg": {
    width: 18,
    height: 4.782,
  },
  "/assets/relocation-route-west-sell.svg": {
    width: 374.464,
    height: 353.86,
  },
  "/assets/icon-contact-phone.svg": {
    width: 18.3777,
    height: 18.4458,
  },
  "/assets/catalog-browser-max-icon.svg": {
    width: 14.9411,
    height: 15.4192,
  },
  "/assets/trust-team-shadow-left-center.svg": {
    width: 372.558,
    height: 535.36,
  },
  "/assets/relocation-plane-arrow-small.svg": {
    width: 32.6049,
    height: 26.2172,
  },
  "/assets/partner-lsr-home.svg": {
    width: 154.533,
    height: 82.3724,
  },
  "/assets/logo-monopoly-mark-header.svg": {
    width: 32,
    height: 32,
  },
  "/assets/partner-brusnika-home.svg": {
    width: 242.765,
    height: 82.3724,
  },
  "/assets/relocation-route-east-sell.svg": {
    width: 401.938,
    height: 191.843,
  },
  "/assets/trust-team-shadow-director.svg": {
    width: 352.682,
    height: 574.035,
  },
  "/assets/bank-alfa-logo.svg": {
    width: 40,
    height: 40,
  },
  "/assets/catalog-browser-ui-icon.webp": {
    width: 400,
    height: 277,
  },
  "/assets/decor-green-panel-alternate.svg": {
    width: 18,
    height: 18,
  },
  "/assets/hero-team-right-shadow.svg": {
    width: 334.354,
    height: 492.006,
  },
  "/assets/buy-realtor-comparison-background.webp": {
    width: 2880,
    height: 3474,
  },
  "/assets/blockbuster-paper-edge.svg": {
    width: 1493.19,
    height: 129.56,
  },
  "/assets/logo-2gis-full-export.svg": {
    width: 84.9558,
    height: 24,
  },
  "/assets/building-apartment-complex.webp": {
    width: 1280,
    height: 720,
  },
  "/assets/transaction-key-handover.webp": {
    width: 856,
    height: 546,
  },
  "/assets/marketplace-domclick-icon.svg": {
    width: 36.7731,
    height: 36.3498,
  },
  "/assets/catalog-browser-telegram-icon.svg": {
    width: 15.962,
    height: 15.7358,
  },
  "/assets/relocation-map-buy.svg": {
    width: 5386.13,
    height: 3035.38,
  },
  "/assets/staff-card-default-shadow.svg": {
    width: 961.183,
    height: 1102.93,
  },
  "/assets/trust-team-right-portrait.webp": {
    width: 1376,
    height: 2064,
  },
  "/assets/relocation-landscape.webp": {
    width: 1024,
    height: 591,
  },
  "/assets/icon-button-sell.svg": {
    width: 16,
    height: 16,
  },
  "/assets/relocation-plane-arrow-west.svg": {
    width: 32.6049,
    height: 26.2172,
  },
  "/assets/trust-team-shadow-right-center.svg": {
    width: 324.57,
    height: 528.202,
  },
  "/assets/hero-team-right-center-shadow.svg": {
    width: 360.524,
    height: 560.882,
  },
  "/assets/sell-steps-house-viewing-connector.svg": {
    width: 2,
    height: 397.069,
  },
  "/assets/logo-monopoly-mark-footer.svg": {
    width: 44,
    height: 44,
  },
  "/assets/icon-play-triangle-white.svg": {
    width: 13.5201,
    height: 11.9038,
  },
  "/assets/partner-glorax-home.svg": {
    width: 185.025,
    height: 82.3724,
  },
  "/assets/buy-steps-checks-connector.svg": {
    width: 2,
    height: 326.224,
  },
  "/assets/hero-team-right-center-portrait.webp": {
    width: 873,
    height: 1600,
  },
  "/assets/partner-pik-home.svg": {
    width: 137.623,
    height: 82.3724,
  },
  "/assets/hero-team-left-inner-portrait.webp": {
    width: 1051,
    height: 1600,
  },
  "/assets/transaction-buyer-documents.webp": {
    width: 856,
    height: 825,
  },
  "/assets/insurance-elena-and-client.webp": {
    width: 1008,
    height: 672,
  },
  "/assets/team-heading-underline.svg": {
    width: 656.663,
    height: 16.6859,
  },
  "/assets/partner-ingosstrakh.svg": {
    width: 200.053,
    height: 73.4912,
  },
  "/assets/partner-etalon.svg": {
    width: 110.043,
    height: 18.8212,
  },
  "/assets/staff-darya-shport-shadow.svg": {
    width: 369.514,
    height: 410.947,
  },
  "/assets/marketplace-avito-icon.svg": {
    width: 36.7731,
    height: 36.3498,
  },
  "/assets/social-instagram-dark.svg": {
    width: 42.1101,
    height: 43.4575,
  },
  "/assets/relocation-plane-arrow-east.svg": {
    width: 32.6049,
    height: 26.2172,
  },
  "/assets/speech-tail-blue-right.svg": {
    width: 42.1834,
    height: 24.8581,
  },
  "/assets/catalog-assurance-icon.svg": {
    width: 36,
    height: 36,
  },
  "/assets/relocation-birds.webp": {
    width: 229,
    height: 110,
  },
  "/assets/partner-sodruzhestvo-home.svg": {
    width: 289.429,
    height: 82.3724,
  },
  "/assets/prepared-viewing-rating-before.svg": {
    width: 123.739,
    height: 35.7208,
  },
  "/assets/partner-etalon-home.svg": {
    width: 152.367,
    height: 26.0603,
  },
  "/assets/buy-catalog-quiz-shadow.svg": {
    width: 447.229,
    height: 319.687,
  },
  "/assets/hero-team-left-portrait.webp": {
    width: 1089,
    height: 1600,
  },
  "/assets/hero-team-left-inner-shadow.svg": {
    width: 386.229,
    height: 541.326,
  },
  "/assets/relocation-route-west.svg": {
    width: 558.85,
    height: 159.319,
  },
  "/assets/icon-check-green-square.svg": {
    width: 14,
    height: 14,
  },
  "/assets/rating-five-stars.svg": {
    width: 101.647,
    height: 15.2536,
  },
  "/assets/recruiting-background.webp": {
    width: 2880,
    height: 1486,
  },
  "/assets/catalog-browser-search-icon.svg": {
    width: 4.78649,
    height: 4.53716,
  },
  "/assets/icon-comparison-check.svg": {
    width: 20,
    height: 20,
  },
  "/assets/buy-steps-selection-connector.svg": {
    width: 2,
    height: 876.43,
  },
  "/assets/hero-team-left-center-portrait.webp": {
    width: 996,
    height: 1600,
  },
  "/assets/office-future-arrow.svg": {
    width: 27.7755,
    height: 23.3,
  },
  "/assets/icon-back-to-top.svg": {
    width: 46.1101,
    height: 47.4575,
  },
  "/assets/property-card-default-photo.webp": {
    width: 740,
    height: 569,
  },
  "/assets/social-whatsapp-dark.svg": {
    width: 42.1101,
    height: 43.4575,
  },
  "/assets/marketplace-avito-badge.svg": {
    width: 36.7731,
    height: 36.3498,
  },
  "/assets/catalog-browser-nav-dot.svg": {
    width: 2.21756,
    height: 2.21756,
  },
  "/assets/icon-copy-email.svg": {
    width: 20,
    height: 20,
  },
  "/assets/staff-evgeniya-matukhnova.webp": {
    width: 2048,
    height: 2048,
  },
  "/assets/deal-steps-vertical-dash.svg": {
    width: 2,
    height: 26,
  },
  "/assets/bank-sber-logo.svg": {
    width: 40,
    height: 40,
  },
  "/assets/background-paper-buyer-section.webp": {
    width: 1600,
    height: 1472,
  },
  "/assets/partner-pik.svg": {
    width: 113.394,
    height: 73.4912,
  },
  "/assets/catalog-old-price-strikethrough.svg": {
    width: 69.6587,
    height: 42.9098,
  },
  "/assets/telegram-news-person.webp": {
    width: 1024,
    height: 682,
  },
  "/assets/risk-meter-five.svg": {
    width: 66,
    height: 10,
  },
  "/assets/staff-elena-sidelina-shadow.svg": {
    width: 615.109,
    height: 675.277,
  },
  "/assets/hero-team-left-center-shadow.svg": {
    width: 373.038,
    height: 504.376,
  },
  "/assets/hero-team-center-shadow.svg": {
    width: 375.997,
    height: 592.688,
  },
  "/assets/staff-elena-murashkina-shadow.svg": {
    width: 368.417,
    height: 410.992,
  },
  "/assets/relocation-route-west-sell-alternate.svg": {
    width: 556,
    height: 160.994,
  },
  "/assets/speech-tail-white-right.svg": {
    width: 42.1834,
    height: 24.8581,
  },
  "/assets/partner-rosgosstrakh.svg": {
    width: 192.833,
    height: 73.4912,
  },
  "/assets/recruiting-specialist-at-atm.webp": {
    width: 1024,
    height: 602,
  },
  "/assets/deal-mission-person-shadow.svg": {
    width: 137.143,
    height: 143.333,
  },
  "/assets/sell-valuation-note-icon.svg": {
    width: 36,
    height: 36,
  },
  "/assets/icon-button-buy.svg": {
    width: 16,
    height: 16,
  },
  "/assets/hero-team-left-shadow.svg": {
    width: 377.473,
    height: 483.149,
  },
  "/assets/marketplace-domclick-badge.svg": {
    width: 36.7731,
    height: 36.3498,
  },
  "/assets/background-paper-team-section.webp": {
    width: 2880,
    height: 4375,
  },
  "/assets/relocation-route-north.svg": {
    width: 376.629,
    height: 352.273,
  },
  "/assets/transaction-money-and-keys.webp": {
    width: 856,
    height: 724,
  },
  "/assets/inner-hero-team-shadow-right.svg": {
    width: 391.196,
    height: 616.992,
  },
  "/assets/icon-play-button.svg": {
    width: 46.9002,
    height: 47.09,
  },
  "/assets/icon-clock-dark.svg": {
    width: 12,
    height: 12,
  },
  "/assets/icon-cases-cursor.svg": {
    width: 17.6346,
    height: 19.3498,
  },
  "/assets/hero-team-right-portrait.webp": {
    width: 1067,
    height: 1600,
  },
  "/assets/buy-steps-route-connector.svg": {
    width: 2,
    height: 387.395,
  },
  "/assets/relocation-belogorsk-pin.svg": {
    width: 29,
    height: 40,
  },
  "/assets/insurance-people-shadow.svg": {
    width: 867.935,
    height: 726.779,
  },
  "/assets/buy-steps-mortgage-connector.svg": {
    width: 2,
    height: 563.381,
  },
  "/assets/speech-bubble-blue.svg": {
    width: 8.437,
    height: 10.665,
  },
  "/assets/catalog-browser-menu-icon.svg": {
    width: 15.6898,
    height: 16.6459,
  },
  "/assets/staff-elena-sidelina.webp": {
    width: 2336,
    height: 3504,
  },
  "/assets/partner-setlgroup.svg": {
    width: 143.296,
    height: 73.4912,
  },
  "/assets/icon-contact-whatsapp.svg": {
    width: 18.3777,
    height: 18.4458,
  },
  "/assets/risk-meter-three.svg": {
    width: 66,
    height: 10,
  },
  "/assets/icon-nav-red-dot.svg": {
    width: 5,
    height: 5,
  },
  "/assets/buy-steps-budget-connector.svg": {
    width: 2,
    height: 546.879,
  },
  "/assets/home-background.webp": {
    width: 1440,
    height: 840,
  },
  "/assets/inner-hero-background.webp": {
    width: 1440,
    height: 840,
  },
  "/assets/relocation-plane-arrow-sell.svg": {
    width: 32.6049,
    height: 26.2172,
  },
  "/assets/staff-elena-sidelina-mobile.webp": { width: 1450, height: 2175 },
};

export function imageSize(src: string, width?: number) {
  const size = dimensions[src];
  if (!size) throw new Error(`Неизвестные размеры изображения: ${src}`);
  return width === undefined
    ? size
    : { width, height: (width * size.height) / size.width };
}
