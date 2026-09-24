"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteTransaction } from "@/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddTransactionDialog } from "./add-transaction-dialog";
import {
  formatCurrency,
  formatDate,
  getTransactionTypeLabel,
  getTransactionTypeColor,
  isIncome,
} from "@/lib/utils";
import {
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description?: string | null;
  notes?: string | null;
  category?: { id: string; name: string; color?: string | null } | null;
  account?: { id: string; name: string; type: string } | null;
  person?: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

export function TransactionList({
  transactions,
  categories,
  accounts,
  currentPage,
  totalPages,
  currentType,
  currentSearch,
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currentPage: number;
  totalPages: number;
  currentType?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState(currentSearch || "");
  const [typeFilter, setTypeFilter] = useState(currentType || "ALL");

  useEffect(() => {
    if (searchParamsHook.get("action") === "new" || searchParamsHook.get("new") === "true") {
      setShowAddDialog(true);
    }
  }, [searchParamsHook]);

  function handleFilter(type?: string, searchTerm?: string) {
    const params = new URLSearchParams();
    if (type && type !== "ALL") params.set("type", type);
    if (searchTerm) params.set("search", searchTerm);
    router.push(`/transactions?${params.toString()}`);
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set("page", String(page));
    router.push(`/transactions?${params.toString()}`);
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      startTransition(async () => {
        await deleteTransaction(deleteId);
        toast.success("Transaction deleted");
        setDeleteId(null);
        router.refresh();
      });
    } catch {
      toast.error("Failed to delete transaction");
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFilter(typeFilter, search);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value);
            handleFilter(value, search);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="LENT">Lent</SelectItem>
            <SelectItem value="BORROWED">Borrowed</SelectItem>
            <SelectItem value="EMI">EMI</SelectItem>
            <SelectItem value="TRANSFER">Transfer</SelectItem>
            <SelectItem value="FAMILY">Family</SelectItem>
            <SelectItem value="FRIEND">Friend</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No transactions found.</p>
          <p className="text-muted-foreground text-sm mt-1">
            Start tracking your finances by adding your first transaction.
          </p>
          <Button onClick={() => setShowAddDialog(true)} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isIncome(t.type)
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {isIncome(t.type) ? (
                  <ArrowDownLeft className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {t.description || getTransactionTypeLabel(t.type)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-xs ${getTransactionTypeColor(t.type)}`}>
                    {getTransactionTypeLabel(t.type)}
                  </Badge>
                  {t.category && (
                    <span className="text-xs text-muted-foreground">
                      {t.category.name}
                    </span>
                  )}
                  {t.person && (
                    <span className="text-xs text-muted-foreground">
                      · {t.person.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-semibold ${
                    isIncome(t.type) ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {isIncome(t.type) ? "+" : "-"}{formatCurrency(t.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(t.date)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setDeleteId(t.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        defaultType={searchParamsHook.get("type") || undefined}
      />
    </div>
  );
}
