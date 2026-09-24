'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function BudgetStatus({ budgets }: { budgets: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Status</CardTitle>
        <CardDescription>Your current month budgets</CardDescription>
      </CardHeader>
      <CardContent>
        {!budgets || budgets.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No active budgets. Set one up to control spending!
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.map((budget, idx) => {
              const spent = budget.spent || 0;
              const limit = budget.amount || 1; // prevent divide by zero
              const percentage = Math.min(100, Math.max(0, (spent / limit) * 100));
              
              let colorClass = 'bg-green-500';
              if (percentage >= 100) colorClass = 'bg-red-500';
              else if (percentage >= 80) colorClass = 'bg-yellow-500';

              return (
                <div key={budget.id || idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{budget.category || budget.name || 'Category'}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(spent)} / {formatCurrency(limit)}
                    </span>
                  </div>
                  <div className={`[&>div]:${colorClass}`}>
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {limit - spent >= 0 
                      ? `${formatCurrency(limit - spent)} remaining` 
                      : `${formatCurrency(spent - limit)} over limit`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
