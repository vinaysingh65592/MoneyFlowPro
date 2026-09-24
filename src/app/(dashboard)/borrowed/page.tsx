import { getTransactions } from "@/actions/transactions";
import { getAllSettlements } from "@/actions/people";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function BorrowedPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const status = searchParams.status;
  
  const settlements = await getAllSettlements();
  const { transactions } = await getTransactions({ type: 'BORROWED', limit: 100 });
  
  const totalBorrowed = settlements.reduce((acc, s) => acc + s.totalBorrowed, 0);
  const totalRepaid = settlements.reduce((acc, s) => acc + s.totalBorrowedReturned, 0);
  const totalOutstanding = settlements.reduce((acc, s) => acc + s.pendingBorrowed, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Money Borrowed</h1>
          <p className="text-muted-foreground">Track money you have borrowed from others.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{formatCurrency(totalBorrowed)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{formatCurrency(totalRepaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Borrowed Transactions</h2>
        {transactions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">No borrowed money transactions yet.</p>
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
                <div className="text-right font-medium text-rose-500">
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
