'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Activity } from 'lucide-react';

export default function FinancialHealth({ health }: { health: any }) {
  if (!health) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Financial Health
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex items-center justify-center h-32">
          Health data unavailable
        </CardContent>
      </Card>
    );
  }

  const getIndicatorColor = (value: number, type: 'savings' | 'expense' | 'emi') => {
    if (type === 'savings') {
      if (value >= 20) return 'text-green-500';
      if (value >= 10) return 'text-yellow-500';
      return 'text-red-500';
    } else { // expense or emi
      if (value <= 30) return 'text-green-500';
      if (value <= 50) return 'text-yellow-500';
      return 'text-red-500';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Financial Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">Savings Rate</span>
            <span className={`font-bold ${getIndicatorColor(health.savingsRate || 0, 'savings')}`}>
              {(health.savingsRate || 0).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Percentage of income saved after expenses</p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">Expense-to-Income</span>
            <span className={`font-bold ${getIndicatorColor(health.expenseToIncomeRatio || 0, 'expense')}`}>
              {(health.expenseToIncomeRatio || 0).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Percentage of income spent on expenses</p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">EMI Burden</span>
            <span className={`font-bold ${getIndicatorColor(health.emiBurden || 0, 'emi')}`}>
              {(health.emiBurden || 0).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Percentage of income spent on EMIs</p>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span>Monthly Cash Flow</span>
            <span className={health.monthlyCashFlow >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
              {formatCurrency(health.monthlyCashFlow || 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Outstanding Debt</span>
            <span className="font-medium">{formatCurrency(health.outstandingDebt || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Receivables</span>
            <span className="font-medium">{formatCurrency(health.receivables || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Payables</span>
            <span className="font-medium">{formatCurrency(health.payables || 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
