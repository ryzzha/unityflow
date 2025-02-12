import { IconKey, TCompanyCategory, TFundraisingCategory } from "./types";

const menuItems: { name: string; link: string; icon: IconKey }[] = [
    { name: "Overview", link: "/", icon: "statistics" },
    { name: "Create", link: "/create", icon: "create" },
    { name: "Companies", link: "/companies", icon: "company" },
    { name: "Funds", link: "/funds", icon: "funds" },
    { name: "Dao", link: "/dao", icon: "dao" },
    { name: "Staking", link: "/staking", icon: "staking" },
    { name: "Account", link: "/profile", icon: "account" },
];

 const COMPANY_CATEGORIES: TCompanyCategory[] = [
  "Tech",
  "Web3",
  "FinTech",
  "Security",
  "Marketing",
  "Gaming",
  "SaaS",
  "E-commerce",
];

 const FUNDRAISING_CATEGORIES: TFundraisingCategory[] = [
  "Product",
  "R&D",
  "Marketing",
  "Partnerships",
  "Hiring",
  "Infrastructure",
  "Expansion",
  "Community",
];


export { menuItems, COMPANY_CATEGORIES, FUNDRAISING_CATEGORIES };