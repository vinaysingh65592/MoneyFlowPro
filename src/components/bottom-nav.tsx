"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ArrowLeftRight, Plus, Users, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useState, useEffect } from "react";
import { AddTransactionDialog } from "./transactions/add-transaction-dialog";

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Home", href: "/", icon: LayoutDashboard },
    { name: "Transact", href: "/transactions", icon: ArrowLeftRight },
  ];
  
  const navItemsRight = [
    { name: "People", href: "/people", icon: Users },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-16 items-center justify-around px-2 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-16 gap-1 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Center Add Button */}
          <div className="relative -top-5">
            <button
              type="button"
              onClick={() => setShowAddDialog(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              aria-label="Add Transaction"
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>

        {navItemsRight.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center w-16 gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="h-5 w-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-72">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
    </div>
    <AddTransactionDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
  </>
  );
}
