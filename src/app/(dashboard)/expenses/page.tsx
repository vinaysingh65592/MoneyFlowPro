import { getTransactions } from "@/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingDown, ArrowUpRight } from "lucide-react";

export default async function ExpensesPage() {
  const { transactions } = await getTransactions({
    type: "EXPENSE",
    limit: 50,
  });

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const byCategory: Record<string, number> = {};
  for (const t of transactions) {
    const cat = t.category?.name || "Other";
    byCategory[cat] = (byCategory[cat] || 0) + t.amount;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">Track and manage your spending</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(byCategory).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cat}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(amount)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No expenses recorded yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start tracking your expenses to understand your spending habits.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10">
                    <ArrowUpRight className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.description || "Expense"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.category && (
                        <Badge variant="outline" className="text-xs">{t.category.name}</Badge>
                      )}
                      {t.person && (
                        <span className="text-xs text-muted-foreground">· {t.person.name}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-red-500">-{formatCurrency(t.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
