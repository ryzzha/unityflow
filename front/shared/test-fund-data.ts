import { IFundraisingCampaign } from "@/entities/campaign";


export const testCampaigns: IFundraisingCampaign[] = [
  {
    campaignId: 1001,
    organizer: "Благодійний фонд «Надія»",
    title: "Допомога дитячому будинку",
    description: "Збираємо кошти на ремонт приміщення, придбання меблів та одягу.",
    goalAmount: 100000,
    collected: 25000,
    donators: [
      { address: "0xAa11111111111111111111111111111111111111", donatedAmount: 2000 },
      { address: "0xBb22222222222222222222222222222222222222", donatedAmount: 500 },
      { address: "0xCc33333333333333333333333333333333333333", donatedAmount: 1000 },
    ],
    deadline: new Date("2025-05-01"),
    image: "https://loremflickr.com/400/250?random=1",
    category: "Fun",
    claimed: false
  },
  {
    campaignId: 1002,
    organizer: "Громадська організація «Волонтери України»",
    title: "Підтримка військових госпіталів",
    description: "Кошти потрібні на закупівлю медикаментів та обладнання.",
    goalAmount: 300000,
    collected: 120000,
    donators: [
      { address: "0xDd44444444444444444444444444444444444444", donatedAmount: 5000 },
      { address: "0xEe55555555555555555555555555555555555555", donatedAmount: 2500 },
      { address: "0xFf66666666666666666666666666666666666666", donatedAmount: 10000 },
    ],
    deadline: new Date("2025-04-15"),
    image: "https://loremflickr.com/400/250?random=2",
    category: "Fun",
    claimed: false
  },
  {
    campaignId: 1003,
    organizer: "Фонд «Щасливе дитинство»",
    title: "Збір на операцію для дитини",
    description:
      "Потрібна термінова операція та реабілітація для 5-річного хлопчика зі складним діагнозом.",
    goalAmount: 50000,
    collected: 32000,
    donators: [
      { address: "0xAa77777777777777777777777777777777777777", donatedAmount: 200 },
      { address: "0xBb88888888888888888888888888888888888888", donatedAmount: 1000 },
      { address: "0xCc99999999999999999999999999999999999999", donatedAmount: 300 },
    ],
    deadline: new Date("2025-02-28"),
    image: "https://loremflickr.com/400/250?random=3",
    category: "Fun",
    claimed: false
  },
  {
    campaignId: 1004,
    organizer: "ГО «Захист тварин»",
    title: "Будівництво притулку для тварин",
    description:
      "Допоможіть зібрати кошти на будівництво теплого приміщення для тварин, що постраждали від стихій.",
    goalAmount: 200000,
    collected: 50000,
    donators: [
      { address: "0xDdAAAAAAAABBBBBBBBCCCCCCCCDDDDDDDDEEEEEE", donatedAmount: 1500 },
      { address: "0xFF11111111111111111111111111111111111111", donatedAmount: 3000 },
      { address: "0xAa22222222222222222222222222222222222222", donatedAmount: 500 },
    ],
    deadline: new Date("2025-06-10"),
    image: "https://loremflickr.com/400/250?random=4",
    category: "Environment",
    claimed: false
  },
  {
    campaignId: 1005,
    organizer: "Ініціативна група «SaveTheEarth»",
    title: "Посадка дерев у міському парку",
    description:
      "Збір на саджанці та добрива для озеленення центрального парку міста.",
    goalAmount: 40000,
    collected: 25000,
    donators: [
      { address: "0xBb33333333333333333333333333333333333333", donatedAmount: 800 },
      { address: "0xCc44444444444444444444444444444444444444", donatedAmount: 500 },
      { address: "0xDd55555555555555555555555555555555555555", donatedAmount: 1200 },
    ],
    deadline: new Date("2025-07-20"),
    image: "https://loremflickr.com/400/250?random=5",
    category: "Fun",
    claimed: false
  },
  {
    campaignId: 1006,
    organizer: "Фонд «Освіта для майбутнього»",
    title: "Стипендіальна програма для студентів",
    description:
      "Підтримка талановитих студентів з малозабезпечених сімей, які навчаються на педагогічних спеціальностях.",
    goalAmount: 150000,
    collected: 80000,
    donators: [
      { address: "0xEe66666666666666666666666666666666666666", donatedAmount: 3000 },
      { address: "0xFf77777777777777777777777777777777777777", donatedAmount: 1500 },
      { address: "0xAa88888888888888888888888888888888888888", donatedAmount: 500 },
    ],
    deadline: new Date("2025-09-01"),
    image: "https://loremflickr.com/400/250?random=6",
    category: "Education",
    claimed: false
  },
  {
    campaignId: 1007,
    organizer: "Соціальний проєкт «Доступне мистецтво»",
    title: "Обладнання для міського театру",
    description:
      "Збір коштів на сучасну звукову та світлову апаратуру, щоб зробити вистави якіснішими.",
    goalAmount: 250000,
    collected: 45000,
    donators: [
      { address: "0xBb99999999999999999999999999999999999999", donatedAmount: 4000 },
      { address: "0xCcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", donatedAmount: 2000 },
      { address: "0xDdBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", donatedAmount: 1000 },
    ],
    deadline: new Date("2025-11-30"),
    image: "https://loremflickr.com/400/250?random=7",
    category: "Social",
    claimed: false
  },
  {
    campaignId: 1008,
    organizer: "Волонтерська ініціатива «Тепло вдома»",
    title: "Ремонт житла для малозабезпечених родин",
    description:
      "Збирання коштів на будівельні матеріали та роботу майстрів для відновлення старих квартир.",
    goalAmount: 500000,
    collected: 150000,
    donators: [
      { address: "0xEeBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", donatedAmount: 2500 },
      { address: "0xFfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", donatedAmount: 2000 },
      { address: "0xAaCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", donatedAmount: 1000 },
    ],
    deadline: new Date("2026-01-15"),
    image: "https://loremflickr.com/400/250?random=8",
    category: "Social",
    claimed: false
  },
  {
    campaignId: 1009,
    organizer: "«Творча сила»",
    title: "Музичні інструменти для сільської школи",
    description:
      "У невеличкому селі немає можливості придбати нові інструменти для гуртка. Потрібна ваша допомога!",
    goalAmount: 60000,
    collected: 13000,
    donators: [
      { address: "0xBbDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", donatedAmount: 1000 },
      { address: "0xCcEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE", donatedAmount: 700 },
      { address: "0xDdFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", donatedAmount: 300 },
    ],
    deadline: new Date("2025-03-10"),
    image: "https://loremflickr.com/400/250?random=9",
    category: "Social",
    claimed: false
  },
  {
    campaignId: 1010,
    organizer: "Рух «Здорова нація»",
    title: "Облаштування спортивного майданчика",
    description:
      "Плануємо встановити сучасне спортивне обладнання у дворах багатоквартирних будинків.",
    goalAmount: 180000,
    collected: 50000,
    donators: [
      { address: "0xEe11111111111111111111111111111111111111", donatedAmount: 2000 },
      { address: "0xFf22222222222222222222222222222222222222", donatedAmount: 500 },
      { address: "0xAa33333333333333333333333333333333333333", donatedAmount: 1000 },
    ],
    deadline: new Date("2025-12-01"),
    image: "https://loremflickr.com/400/250?random=10",
    category: "Health",
    claimed: false
  },
  {
    campaignId: 1011,
    organizer: "Фонд «Майбутнє в руках молоді»",
    title: "Курси програмування для підлітків",
    description:
      "Безкоштовні курси для дітей з малозабезпечених родин, щоб вони могли оволодіти сучасними технологіями.",
    goalAmount: 120000,
    collected: 90000,
    donators: [
      { address: "0xBb44444444444444444444444444444444444444", donatedAmount: 4000 },
      { address: "0xCc55555555555555555555555555555555555555", donatedAmount: 1500 },
      { address: "0xDd66666666666666666666666666666666666666", donatedAmount: 2000 },
    ],
    deadline: new Date("2025-08-15"),
    image: "https://loremflickr.com/400/250?random=11",
    category: "Education",
    claimed: false
  },
];
