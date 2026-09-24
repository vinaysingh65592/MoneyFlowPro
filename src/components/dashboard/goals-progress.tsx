'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

export default function GoalsProgress({ goals }: { goals: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals Progress
        </CardTitle>
        <CardDescription>Your active financial goals</CardDescription>
      </CardHeader>
      <CardContent>
        {!goals || goals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No active goals. Start saving for something!
          </div>
        ) : (
          <div className="space-y-6">
            {goals.map((goal, idx) => {
              const saved = goal.savedAmount ?? goal.currentAmount ?? 0;
              const target = goal.targetAmount || 1;
              const percentage = Math.min(100, Math.max(0, (saved / target) * 100));
              
              return (
                <div key={goal.id || idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className="font-medium">{percentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(saved)} saved</span>
                    <span>Target: {formatCurrency(target)}</span>
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
