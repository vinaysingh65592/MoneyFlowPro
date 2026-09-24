'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function ExpenseReport({ transactions }: { transactions: any[] }) {
  const expenseTransactions = useMemo(() => 
    transactions.filter(t => t.type === 'EXPENSE'),
  [transactions])

  const totalExpense = useMemo(() => 
    expenseTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0),
  [expenseTransactions])

  const expenseByCategory = useMemo(() => {
    const grouped = expenseTransactions.reduce((acc, curr) => {
      const cat = curr.category?.name || 'Other'
      acc[cat] = (acc[cat] || 0) + Number(curr.amount)
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => (b.value as number) - (a.value as number))
  }, [expenseTransactions])

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#6366f1', '#d946ef']

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          
          <div className="mt-8 space-y-4">
            <h4 className="font-semibold text-sm">Top Categories</h4>
            {expenseByCategory.slice(0, 5).map((item, i) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-medium">{formatCurrency(Number(item.value))}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseByCategory.slice(0, 8)}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => `₹${val}`} />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
              <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
