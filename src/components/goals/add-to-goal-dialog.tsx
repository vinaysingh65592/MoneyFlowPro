'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addToGoal } from '@/actions/budgets-goals';
import { getAccounts } from '@/actions/accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

export function AddToGoalDialog({ goal }: { goal: any }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (open) {
      getAccounts().then((res) => setAccounts(res || []));
    }
  }, [open]);

  const maxAmount = Math.max(1, (goal.targetAmount ?? goal.target ?? 0) - (goal.savedAmount ?? goal.saved ?? 0));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await addToGoal(goal.id, Number(amount), accountId || undefined);
        toast.success('Money added to goal');
        setOpen(false);
        router.refresh();
        setAmount('');
        setAccountId('');
      } catch (err) {
        toast.error('Failed to add money to goal');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Money</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to {goal.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" min="1" max={maxAmount} required placeholder="e.g. 5000" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountId">Source Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Account (Optional)" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add to Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
