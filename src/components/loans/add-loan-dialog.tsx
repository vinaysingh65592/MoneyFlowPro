'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createLoan } from '@/actions/loans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function AddLoanDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState<'PERSONAL'|'BANK'|'VEHICLE'|'EDUCATION'|'HOME'|'OTHER'>('HOME');
  const [lender, setLender] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [startDate, setStartDate] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createLoan({
          name,
          type,
          principal: Number(principal),
          interestRate: Number(interestRate),
          startDate: new Date(startDate),
          lender,
          tenure: tenure ? Number(tenure) : undefined,
          emiAmount: emiAmount ? Number(emiAmount) : undefined
        });
        toast.success('Loan added successfully');
        setOpen(false);
        router.refresh();
        setName('');
        setType('HOME');
        setLender('');
        setPrincipal('');
        setInterestRate('');
        setTenure('');
        setEmiAmount('');
        setStartDate('');
      } catch (err) {
        toast.error('Failed to add loan');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Loan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Loan Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Home Loan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(val: any) => setType(val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOME">Home Loan</SelectItem>
                  <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                  <SelectItem value="VEHICLE">Vehicle Loan</SelectItem>
                  <SelectItem value="EDUCATION">Education Loan</SelectItem>
                  <SelectItem value="BANK">Bank Loan</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lender">Lender</Label>
              <Input id="lender" value={lender} onChange={(e) => setLender(e.target.value)} required placeholder="e.g. SBI" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principal">Principal Amount</Label>
              <Input id="principal" value={principal} onChange={(e) => setPrincipal(e.target.value)} type="number" required placeholder="e.g. 5000000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input id="interestRate" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} type="number" step="0.01" required placeholder="e.g. 8.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenure">Tenure (Months)</Label>
              <Input id="tenure" value={tenure} onChange={(e) => setTenure(e.target.value)} type="number" required placeholder="e.g. 240" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emiAmount">EMI Amount</Label>
              <Input id="emiAmount" value={emiAmount} onChange={(e) => setEmiAmount(e.target.value)} type="number" required placeholder="e.g. 43391" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Loan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
