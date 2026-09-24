'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecentTransactions({ transactions }: { transactions: any[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No transactions yet. Start tracking your finances!
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, idx) => (
              <div key={tx.id || idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'INCOME' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {tx.type === 'INCOME' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.description}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{tx.category?.name || 'Uncategorized'}</span>
                      <span>•</span>
                      <span>{tx.date ? format(new Date(tx.date), 'MMM d, yyyy') : 'Unknown Date'}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-semibold text-sm ${tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
