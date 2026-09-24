import { getLoans } from '@/actions/loans';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AddLoanDialog } from '@/components/loans/add-loan-dialog';
import { Building, Calendar, Percent } from 'lucide-react';

export default async function LoansPage() {
  const loans = await getLoans();
  
  const totalLoans = loans.length;
  const activeLoans = loans.filter((l: any) => l.status === 'ACTIVE').length;
  const completedLoans = loans.filter((l: any) => l.status === 'COMPLETED').length;
  
  const totalOutstanding = loans.reduce((acc: number, loan: any) => {
    return acc + (loan.remainingAmount ?? Math.max(0, (loan.totalPayable || loan.principal || 0) - (loan.totalPaid || 0)));
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground">Manage your loans and track EMIs.</p>
        </div>
        <AddLoanDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
      </div>

      {loans.length === 0 ? (
        <Card className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No loans found</h3>
            <p className="text-muted-foreground mb-4">Add a loan to start tracking.</p>
            <AddLoanDialog />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan: any) => {
            const payable = loan.totalPayable || loan.principal || 1;
            const progress = Math.min(100, Math.max(0, ((loan.totalPaid || 0) / payable) * 100));
            return (
              <Card key={loan.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{loan.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building className="h-3 w-3" /> {loan.lender}
                      </CardDescription>
                    </div>
                    <Badge variant={loan.status === 'ACTIVE' ? 'default' : loan.status === 'COMPLETED' ? 'secondary' : 'destructive'}>
                      {loan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Principal:</span>
                    <span className="font-medium">{formatCurrency(loan.principal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Percent className="h-3 w-3"/> Rate:</span>
                    <span className="font-medium">{loan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3"/> Tenure:</span>
                    <span className="font-medium">{loan.tenureMonths} months</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Paid: {formatCurrency(loan.totalPaid)}</span>
                      <span>Left: {formatCurrency(loan.totalPayable - loan.totalPaid)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
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
