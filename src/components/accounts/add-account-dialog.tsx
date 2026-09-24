'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createAccount } from '@/actions/accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState<'CASH'|'BANK'|'UPI'|'WALLET'|'CREDIT_CARD'|'SAVINGS_ACCOUNT'|'OTHER'>('BANK');
  const [openingBalance, setOpeningBalance] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createAccount({
          name,
          type,
          openingBalance: Number(openingBalance),
          color,
          isDefault: false
        });
        toast.success('Account added successfully');
        setOpen(false);
        router.refresh();
        setName('');
        setType('BANK');
        setOpeningBalance('');
        setColor('#3b82f6');
      } catch (error) {
        toast.error('Failed to add account');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. HDFC Checking" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(val: any) => setType(val)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK">Bank Account</SelectItem>
                <SelectItem value="WALLET">Wallet</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="SAVINGS_ACCOUNT">Savings Account</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingBalance">Opening Balance (₹)</Label>
            <Input id="openingBalance" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} type="number" step="0.01" required placeholder="e.g. 50000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Theme Color</Label>
            <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} type="color" className="h-10 p-1" />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Account'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
