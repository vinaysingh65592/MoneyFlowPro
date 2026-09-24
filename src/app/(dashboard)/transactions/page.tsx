import { getTransactions } from "@/actions/transactions";
import { getCategories } from "@/actions/auth";
import { getAccounts } from "@/actions/accounts";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10);

  const { transactions, total, pages } = await getTransactions({
    type: sp.type,
    search: sp.search,
    page,
    limit: 20,
  });

  const categories = await getCategories();
  const accounts = await getAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            {total} total transactions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={JSON.parse(JSON.stringify(transactions))}
            categories={JSON.parse(JSON.stringify(categories))}
            accounts={JSON.parse(JSON.stringify(accounts))}
            currentPage={page}
            totalPages={pages}
            currentType={sp.type}
            currentSearch={sp.search}
          />
        </CardContent>
      </Card>
    </div>
  );
}
