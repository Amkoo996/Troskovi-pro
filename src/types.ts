export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

export interface Saving {
  id: number;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface Settings {
  salary: number;
  currency: string;
}

export const CATEGORIES = [
  "Hrana",
  "Transport",
  "Stanarina",
  "Zabava",
  "Zdravlje",
  "Shopping",
  "Ostalo",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CURRENCIES = [
  { code: "EUR", symbol: "€", locale: "hr-HR" },
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "BAM", symbol: "KM", locale: "bs-BA" },
  { code: "RSD", symbol: "din", locale: "sr-RS" },
] as const;
