'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { transferBetweenAccounts } from '@/actions/accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft } from 'lucide-react';

export function TransferDialog({ accounts }: { accounts: any[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (fromAccountId === toAccountId) {
      setError('Cannot transfer to the same account');
      return;
    }

    startTransition(async () => {
      try {
        await transferBetweenAccounts(fromAccountId, toAccountId, Number(amount), description);
        toast.success('Transfer successful');
        setOpen(false);
        router.refresh();
        setFromAccountId('');
        setToAccountId('');
        setAmount('');
        setDescription('');
      } catch (err) {
        toast.error('Transfer failed');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-destructive font-medium">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="fromAccountId">From Account</Label>
            <Select value={fromAccountId} onValueChange={setFromAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name} (₹{acc.currentBalance ?? acc.balance ?? 0})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toAccountId">To Account</Label>
            <Select value={toAccountId} onValueChange={setToAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" min="1" required placeholder="e.g. 5000" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Monthly Savings" />
          </div>
          
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Transferring...' : 'Transfer Money'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
