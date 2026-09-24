import { getTransactions } from '@/actions/transactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IncomeReport } from '@/components/reports/income-report'
import { ExpenseReport } from '@/components/reports/expense-report'
import { CashflowReport } from '@/components/reports/cashflow-report'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function ReportsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const { transactions } = await getTransactions({ limit: 1000 })
  
  // Basic serialization
  const serializedTransactions = JSON.parse(JSON.stringify(transactions || []))

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Analyze your finances with detailed charts and breakdowns.
        </p>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>
        <TabsContent value="income" className="mt-6">
          <IncomeReport transactions={serializedTransactions} />
        </TabsContent>
        <TabsContent value="expenses" className="mt-6">
          <ExpenseReport transactions={serializedTransactions} />
        </TabsContent>
        <TabsContent value="cashflow" className="mt-6">
          <CashflowReport transactions={serializedTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
