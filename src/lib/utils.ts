import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function getMonthName(month: number): string {
  return new Intl.DateTimeFormat("en", { month: "long" }).format(
    new Date(2024, month - 1)
  );
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    INCOME: "Income",
    EXPENSE: "Expense",
    EMI: "EMI Payment",
    LOAN_RECEIVED: "Loan Received",
    LOAN_PAYMENT: "Loan Payment",
    LENT: "Money Lent",
    LENT_RETURN: "Lent Return",
    BORROWED: "Money Borrowed",
    BORROWED_RETURN: "Borrowed Return",
    FAMILY: "Family Expense",
    FRIEND: "Friend Expense",
    TRANSFER: "Transfer",
    SAVING: "Savings",
    INVESTMENT: "Investment",
    OTHER: "Other",
  };
  return labels[type] || type;
}

export function getTransactionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    INCOME: "text-emerald-500",
    EXPENSE: "text-red-500",
    EMI: "text-orange-500",
    LOAN_RECEIVED: "text-blue-500",
    LOAN_PAYMENT: "text-amber-500",
    LENT: "text-purple-500",
    LENT_RETURN: "text-emerald-400",
    BORROWED: "text-rose-500",
    BORROWED_RETURN: "text-teal-500",
    FAMILY: "text-pink-500",
    FRIEND: "text-indigo-500",
    TRANSFER: "text-cyan-500",
    SAVING: "text-green-500",
    INVESTMENT: "text-violet-500",
    OTHER: "text-gray-500",
  };
  return colors[type] || "text-gray-500";
}

export function isIncome(type: string): boolean {
  return ["INCOME", "LENT_RETURN", "BORROWED", "LOAN_RECEIVED"].includes(type);
}

export function isExpense(type: string): boolean {
  return [
    "EXPENSE",
    "EMI",
    "LOAN_PAYMENT",
    "LENT",
    "BORROWED_RETURN",
    "FAMILY",
    "FRIEND",
  ].includes(type);
}
