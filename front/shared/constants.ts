import { IconKey } from "./types";

const menuItems: { name: string; link: string; icon: IconKey }[] = [
    { name: "Overview", link: "/", icon: "statistics" },
    { name: "Create", link: "/create", icon: "create" },
    { name: "Companies", link: "/companies", icon: "company" },
    { name: "Funds", link: "/funds", icon: "funds" },
    { name: "Dao", link: "/dao", icon: "dao" },
    { name: "Staking", link: "/staking", icon: "staking" },
    { name: "Account", link: "/profile", icon: "account" },
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