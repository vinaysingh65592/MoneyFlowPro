import { getTransactions } from "@/actions/transactions";
import { getPeople } from "@/actions/people";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function FriendsPage() {
  const { transactions } = await getTransactions({ type: 'FRIEND', limit: 100 });
  const allPeople = await getPeople();
  
  const friends = allPeople.filter(p => p.relationship === "FRIEND");
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const thisYearTransactions = transactions.filter(t => {
    return new Date(t.date).getFullYear() === currentYear;
  });
  
  const thisMonthTotal = thisMonthTransactions.reduce((acc, t) => acc + t.amount, 0);
  const thisYearTotal = thisYearTransactions.reduce((acc, t) => acc + t.amount, 0);

  const personBreakdown: Record<string, number> = {};
  transactions.forEach(t => {
    if (t.person) {
      personBreakdown[t.person.name] = (personBreakdown[t.person.name] || 0) + t.amount;
    }
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Friends & Shared Expenses</h1>
          <p className="text-muted-foreground">Track expenses shared with or made for friends.</p>
        </div>
        <Button asChild>
          <Link href="/transactions?action=new&type=FRIEND">
            <Plus className="mr-2 h-4 w-4" /> Add Friend Expense
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-500">{formatCurrency(thisMonthTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-500">{formatCurrency(thisYearTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Per-Friend Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(personBreakdown).length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(personBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, amount]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="font-medium">{name}</span>
                      <span className="font-bold">{formatCurrency(amount)}</span>
                    </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Friends List</CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground">No friends added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {friends.map(friend => (
                  <Link key={friend.id} href={`/people/${friend.id}`}>
                    <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-secondary/80">
                      {friend.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">No friend transactions yet.</p>
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
                <div className="text-right font-medium text-indigo-500">
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
