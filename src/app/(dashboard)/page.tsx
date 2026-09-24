import { getDashboardData, getFinancialHealth } from '@/actions/dashboard';
import { formatCurrency, getGreeting } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet, TrendingUp, TrendingDown, PiggyBank, 
  ArrowDownLeft, ArrowUpRight, Calendar, Landmark 
} from 'lucide-react';
import CashFlowChart from '@/components/dashboard/cash-flow-chart';
import SpendingBreakdown from '@/components/dashboard/spending-breakdown';
import FinancialHealth from '@/components/dashboard/financial-health';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import BudgetStatus from '@/components/dashboard/budget-status';
import GoalsProgress from '@/components/dashboard/goals-progress';

export default async function DashboardPage() {
  const data = await getDashboardData();
  const health = await getFinancialHealth();
  
  // Need to serialize data that might have Date objects for Client Components
  const safeData = JSON.parse(JSON.stringify(data));
  const safeHealth = JSON.parse(JSON.stringify(health));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getGreeting()} 👋</h1>
        <p className="text-muted-foreground">Here is your financial overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.monthIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Spending</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.monthExpense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalBalance)}</div>
          </CardContent>
        </Card>
        
        {/* Additional Stats Row */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money to Receive</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.moneyToReceive || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Money to Pay</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.moneyToPay || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming EMI</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.upcomingEMITotal || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Outstanding</CardTitle>
            <Landmark className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.loanOutstanding || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CashFlowChart data={safeData.cashFlowData} />
        <SpendingBreakdown data={safeData.spendingByCategory} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={safeData.recentTransactions} />
        </div>
        <div>
          <FinancialHealth health={safeHealth} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BudgetStatus budgets={safeData.budgets} />
        <GoalsProgress goals={safeData.goals} />
      </div>
    </div>
  );
}
