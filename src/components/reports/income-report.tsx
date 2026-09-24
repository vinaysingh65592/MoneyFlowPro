'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function IncomeReport({ transactions }: { transactions: any[] }) {
  const incomeTransactions = useMemo(() => 
    transactions.filter(t => t.type === 'INCOME'),
  [transactions])

  const totalIncome = useMemo(() => 
    incomeTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0),
  [incomeTransactions])

  const incomeBySource = useMemo(() => {
    const grouped = incomeTransactions.reduce((acc, curr) => {
      const cat = curr.category?.name || 'Other'
      acc[cat] = (acc[cat] || 0) + Number(curr.amount)
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [incomeTransactions])

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899']

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">
            {formatCurrency(totalIncome)}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Income by Source</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeBySource}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {incomeBySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
