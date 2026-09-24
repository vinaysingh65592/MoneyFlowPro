'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'

export function CashflowReport({ transactions }: { transactions: any[] }) {
  const cashflowData = useMemo(() => {
    // Group by month
    const grouped = transactions.reduce((acc, curr) => {
      const date = new Date(curr.date)
      const monthYear = format(date, 'MMM yyyy')
      
      if (!acc[monthYear]) {
        acc[monthYear] = { name: monthYear, income: 0, expense: 0, sort: date.getTime() }
      }
      
      if (curr.type === 'INCOME') {
        acc[monthYear].income += Number(curr.amount)
      } else if (curr.type === 'EXPENSE') {
        acc[monthYear].expense += Number(curr.amount)
      }
      
      return acc
    }, {} as Record<string, { name: string, income: number, expense: number, sort: number }>)

    type GroupedItem = { name: string; income: number; expense: number; sort: number };
    return (Object.values(grouped) as GroupedItem[])
      .sort((a, b) => a.sort - b.sort)
      .map((item) => ({
        name: item.name,
        income: item.income,
        expense: item.expense,
        savings: item.income - item.expense,
      }))
  }, [transactions])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashflowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => `₹${val}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
              <Legend />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-md">Month</th>
                  <th className="px-4 py-3">Income</th>
                  <th className="px-4 py-3">Expenses</th>
                  <th className="px-4 py-3 rounded-tr-md">Net Savings</th>
                </tr>
              </thead>
              <tbody>
                {cashflowData.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-emerald-600">{formatCurrency(row.income)}</td>
                    <td className="px-4 py-3 text-red-600">{formatCurrency(row.expense)}</td>
                    <td className={`px-4 py-3 font-bold ${row.savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(row.savings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
