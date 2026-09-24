import { getBudgets } from '@/actions/budgets-goals';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AddBudgetDialog } from '@/components/budgets/add-budget-dialog';

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const currentDate = new Date();
  const month = params.month ? parseInt(params.month) : currentDate.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : currentDate.getFullYear();
  
  const budgets = await getBudgets(month, year);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Track your spending limits by category.</p>
        </div>
        <AddBudgetDialog />
      </div>

      {budgets.length === 0 ? (
        <Card className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No budgets set</h3>
            <p className="text-muted-foreground mb-4">Create a budget to monitor your spending.</p>
            <AddBudgetDialog />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget: any) => {
            const percentUsed = (budget.spent / budget.amount) * 100;
            const isWarning = percentUsed >= 80 && percentUsed < 100;
            const isDanger = percentUsed >= 100;
            
            return (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{budget.category || budget.name}</CardTitle>
                    {isDanger ? (
                      <Badge variant="destructive">Exceeded</Badge>
                    ) : isWarning ? (
                      <Badge variant="outline" className="border-amber-500 text-amber-500">Near Limit</Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500 text-emerald-500">On Track</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-muted-foreground">Spent</span>
                      <span className="font-bold">{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</span>
                    </div>
                    <Progress 
                      value={Math.min(percentUsed, 100)} 
                      className={`h-2 ${isDanger ? 'bg-destructive/20 [&>div]:bg-destructive' : isWarning ? 'bg-yellow-500/20 [&>div]:bg-yellow-500' : ''}`}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Remaining: <span className="font-medium text-foreground">{formatCurrency(Math.max(0, budget.amount - budget.spent))}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
