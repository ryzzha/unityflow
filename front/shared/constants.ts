import { IconKey } from "./types";

const menuItems: { name: string; link: string; icon: IconKey }[] = [
    { name: "Funds", link: "/", icon: "funds" },
    { name: "Create", link: "/create", icon: "create" },
    { name: "Dao", link: "/dao", icon: "dao" },
    { name: "Statistics", link: "/statistics", icon: "statistics" },
];

const categories = [
    "All",
    "Startups",
    "Art",
    "Fun",
    "Education",
    "Health",
    "Environment",
    "Social",
    "Animals",
    "Personal",
  ];

export { menuItems, categories };