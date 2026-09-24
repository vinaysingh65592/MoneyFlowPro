import { getPerson, getPersonSettlement } from "@/actions/people";
import { getAccounts } from "@/actions/accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SettleUpDialog } from "@/components/people/settle-up-dialog";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PersonDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const person = await getPerson(params.id);
  
  if (!person) {
    notFound();
  }

  const settlement = await getPersonSettlement(person.id);
  const accounts = await getAccounts();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">{person.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{person.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {person.relationship && <Badge>{person.relationship}</Badge>}
              {person.phone && <span className="text-sm text-muted-foreground">{person.phone}</span>}
              {person.email && <span className="text-sm text-muted-foreground">{person.email}</span>}
            </div>
          </div>
        </div>
        <SettleUpDialog 
          personId={person.id} 
          netSettlement={settlement.netSettlement} 
          accounts={accounts.map(a => ({ id: a.id, name: a.name }))} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Money you lent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{formatCurrency(settlement.totalLent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Money returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(settlement.totalLentReturned)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Money you borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{formatCurrency(settlement.totalBorrowed)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Money you returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-500">{formatCurrency(settlement.totalBorrowedReturned)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Net Settlement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <span className="text-3xl font-bold">
              {settlement.netSettlement > 0 ? (
                <span className="text-emerald-500">{formatCurrency(settlement.netSettlement)} (Receivable)</span>
              ) : settlement.netSettlement < 0 ? (
                <span className="text-rose-500">{formatCurrency(Math.abs(settlement.netSettlement))} (Payable)</span>
              ) : (
                <span className="text-muted-foreground">Settled up</span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Transaction History</h2>
        {person.transactions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">No transactions with this person yet.</p>
          </Card>
        ) : (
          <div className="border rounded-md">
            <div className="grid grid-cols-4 p-4 font-medium border-b bg-muted/50">
              <div>Date</div>
              <div>Description</div>
              <div>Type</div>
              <div className="text-right">Amount</div>
            </div>
            {person.transactions.map((tx: any) => (
              <div key={tx.id} className="grid grid-cols-4 p-4 border-b last:border-0 items-center">
                <div className="text-sm">{formatDate(tx.date)}</div>
                <div className="text-sm">{tx.description || tx.category?.name || "No description"}</div>
                <div>
                  <Badge variant="outline">{tx.type}</Badge>
                </div>
                <div className="text-right font-medium">
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
