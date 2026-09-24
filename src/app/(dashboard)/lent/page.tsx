import { getTransactions } from "@/actions/transactions";
import { getAllSettlements } from "@/actions/people";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function LentPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const status = searchParams.status;
  
  const settlements = await getAllSettlements();
  const { transactions } = await getTransactions({ type: 'LENT', limit: 100 }); 
  
  const totalLent = settlements.reduce((acc, s) => acc + s.totalLent, 0);
  const totalReturned = settlements.reduce((acc, s) => acc + s.totalLentReturned, 0);
  const totalPending = settlements.reduce((acc, s) => acc + s.pendingLent, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Money Lent</h1>
          <p className="text-muted-foreground">Track money you have lent to others.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Lent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{formatCurrency(totalLent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{formatCurrency(totalReturned)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Lent Transactions</h2>
        {transactions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">No lent money transactions yet.</p>
          </Card>
        ) : (
          <div className="border rounded-md">
            <div className="grid grid-cols-4 p-4 font-medium border-b bg-muted/50">
              <div>Date</div>
              <div>Person</div>
              <div>Description</div>
              <div className="text-right">Amount</div>
            </div>
            {transactions.map((tx: any) => (
              <div key={tx.id} className="grid grid-cols-4 p-4 border-b last:border-0 items-center">
                <div className="text-sm">{formatDate(tx.date)}</div>
                <div className="font-medium">
                  {tx.person ? (
                    <Link href={`/people/${tx.person.id}`} className="hover:underline text-primary">
                      {tx.person.name}
                    </Link>
                  ) : "Unknown"}
                </div>
                <div className="text-sm text-muted-foreground">{tx.description || "-"}</div>
                <div className="text-right font-medium text-purple-500">
                  {formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
