"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  TrendingDown,
  TrendingUp,
  Users,
  HandCoins,
  PiggyBank,
  Landmark,
  CreditCard,
  Calculator,
  Target,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  Wallet2,
  HeartHandshake,
} from "lucide-react";

const navGroups = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "TRANSACTIONS",
    items: [
      { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
      { name: "Income", href: "/income", icon: TrendingUp },
      { name: "Expenses", href: "/expenses", icon: TrendingDown },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      { name: "People", href: "/people", icon: Users },
      { name: "Lent Money", href: "/lent", icon: HandCoins },
      { name: "Borrowed Money", href: "/borrowed", icon: PiggyBank },
      { name: "Friends", href: "/friends", icon: HeartHandshake },
      { name: "Family", href: "/family", icon: Users },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { name: "Accounts", href: "/accounts", icon: Wallet2 },
      { name: "Loans", href: "/loans", icon: Landmark },
      { name: "EMI", href: "/emi", icon: CreditCard },
    ],
  },
  {
    title: "PLANNING",
    items: [
      { name: "Budgets", href: "/budgets", icon: Calculator },
      { name: "Goals", href: "/goals", icon: Target },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full w-full flex-col border-r bg-background", className)}>
      <div className="flex h-14 lg:h-[60px] items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl tracking-tight">MoneyFlow Pro</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-4 custom-scrollbar">
        <nav className="grid items-start px-4 text-sm font-medium gap-6">
          {navGroups.map((group, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider px-2">
                {group.title}
              </span>
              <div className="grid gap-1">
                {group.items.map((item, j) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={j}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <nav className="grid gap-1">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary text-sm font-medium",
              pathname.startsWith("/settings")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={() => {
              signOut({ callbackUrl: "/login" });
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-destructive hover:bg-destructive/10 text-muted-foreground text-sm font-medium w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </div>
    </div>
  );
}
