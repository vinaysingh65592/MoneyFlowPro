import { getEMIs } from '@/actions/loans';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PayEmiDialog } from '@/components/emi/pay-emi-dialog';

export default async function EmiPage() {
  const emis = await getEMIs();
  
  const upcoming = emis.filter((e: any) => e.status === 'UPCOMING');
  const overdue = emis.filter((e: any) => e.status === 'OVERDUE');
  const paid = emis.filter((e: any) => e.status === 'PAID');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">EMI Center</h1>
        <p className="text-muted-foreground">Track and pay your EMIs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's EMI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {emis.filter((e: any) => new Date(e.dueDate).toDateString() === new Date().toDateString() && e.status !== 'PAID').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdue.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paid.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <EmiList emis={emis} />
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          <EmiList emis={upcoming} />
        </TabsContent>
        <TabsContent value="overdue" className="space-y-4">
          <EmiList emis={overdue} />
        </TabsContent>
        <TabsContent value="paid" className="space-y-4">
          <EmiList emis={paid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmiList({ emis }: { emis: any[] }) {
  if (emis.length === 0) {
    return (
      <Card className="flex h-[200px] items-center justify-center">
        <p className="text-muted-foreground">No EMIs found in this category.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {emis.map((emi) => (
        <Card key={emi.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{emi.loanName}</CardTitle>
                <CardDescription>EMI #{emi.emiNumber}</CardDescription>
              </div>
              <Badge 
                variant={emi.status === 'OVERDUE' ? 'destructive' : 'outline'}
                className={
                  emi.status === 'PAID' ? 'border-emerald-500 text-emerald-500' : 
                  emi.status === 'DUE_SOON' ? 'border-amber-500 text-amber-500' : ''
                }
              >
                {emi.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{formatCurrency(emi.amount)}</span>
              <div className="text-right text-sm">
                <div className="text-muted-foreground">Due Date</div>
                <div className="font-medium">{formatDate(emi.dueDate)}</div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Principal: {formatCurrency(emi.principalComponent)}</span>
              <span>Interest: {formatCurrency(emi.interestComponent)}</span>
            </div>

            {emi.status !== 'PAID' && (
              <PayEmiDialog emi={emi} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
