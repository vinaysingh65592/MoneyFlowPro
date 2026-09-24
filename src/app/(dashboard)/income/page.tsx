import { getTransactions } from "@/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, ArrowDownLeft } from "lucide-react";

export default async function IncomePage() {
  const { transactions } = await getTransactions({ type: "INCOME", limit: 50 });

  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const byCategory: Record<string, number> = {};
  for (const t of transactions) {
    const cat = t.category?.name || "Other";
    byCategory[cat] = (byCategory[cat] || 0) + t.amount;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Income</h1>
        <p className="text-muted-foreground">Track all your income sources</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sources</CardTitle>
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

      {/* Income Source Breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat}</span>
                    <span className="text-sm text-emerald-500 font-semibold">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No income recorded yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first income to start tracking your earnings.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10">
                    <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t.description || "Income"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.category && (
                        <Badge variant="outline" className="text-xs">{t.category.name}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-emerald-500">+{formatCurrency(t.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
