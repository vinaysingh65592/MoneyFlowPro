import { getGoals } from '@/actions/budgets-goals';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AddGoalDialog } from '@/components/goals/add-goal-dialog';
import { AddToGoalDialog } from '@/components/goals/add-to-goal-dialog';
import { Target } from 'lucide-react';

export default async function GoalsPage() {
  const goals = await getGoals();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">Set and track your savings goals.</p>
        </div>
        <AddGoalDialog />
      </div>

      {goals.length === 0 ? (
        <Card className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No goals found</h3>
            <p className="text-muted-foreground mb-4">Set your financial goals and track your progress!</p>
            <AddGoalDialog />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal: any) => {
            const saved = goal.savedAmount ?? goal.saved ?? 0;
            const target = goal.targetAmount ?? goal.target ?? 1;
            const progress = Math.min(100, Math.max(0, (saved / target) * 100));
            
            return (
              <Card key={goal.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        {goal.targetDate && (
                          <CardDescription>Target: {formatDate(goal.targetDate)}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={goal.status === 'PAUSED' ? 'secondary' : 'outline'}
                      className={goal.status === 'COMPLETED' ? 'border-emerald-500 text-emerald-500' : ''}
                    >
                      {goal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" style={{ ['--progress-background' as any]: goal.color }} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Saved: {formatCurrency(saved)}</span>
                      <span>Target: {formatCurrency(target)}</span>
                    </div>
                  </div>
                  
                  {goal.status === 'IN_PROGRESS' && (
                    <div className="pt-2">
                      <AddToGoalDialog goal={goal} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
