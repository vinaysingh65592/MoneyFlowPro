import { getAccounts } from '@/actions/accounts';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddAccountDialog } from '@/components/accounts/add-account-dialog';
import { TransferDialog } from '@/components/accounts/transfer-dialog';
import { Wallet, Building, CreditCard } from 'lucide-react';

export default async function AccountsPage() {
  const accounts = await getAccounts();
  
  const totalBalance = accounts.reduce((acc: number, account: any) => acc + (account.currentBalance ?? account.balance ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your bank accounts and wallets.</p>
        </div>
        <div className="flex gap-2">
          <TransferDialog accounts={accounts} />
          <AddAccountDialog />
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-sm font-medium text-muted-foreground mb-2">Total Net Worth</div>
          <div className="text-4xl font-bold">{formatCurrency(totalBalance)}</div>
        </CardContent>
      </Card>

      {accounts.length === 0 ? (
        <Card className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No accounts found</h3>
            <p className="text-muted-foreground mb-4">Add an account to start tracking your money.</p>
            <AddAccountDialog />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account: any) => (
            <Card key={account.id} className="overflow-hidden relative" style={{ borderLeftColor: account.color, borderLeftWidth: '4px' }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-md">
                      {account.type === 'BANK' ? <Building className="h-4 w-4" /> : 
                       account.type === 'CREDIT_CARD' ? <CreditCard className="h-4 w-4" /> : 
                       <Wallet className="h-4 w-4" />}
                    </div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </div>
                  <Badge variant="outline">{account.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground">Current Balance</div>
                  <div className="text-3xl font-bold mt-1">{formatCurrency(account.currentBalance ?? account.balance ?? 0)}</div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Opening Balance: {formatCurrency(account.openingBalance)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
