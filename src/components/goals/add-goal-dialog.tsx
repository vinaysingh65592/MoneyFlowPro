'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createGoal } from '@/actions/budgets-goals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('target');
  const [color, setColor] = useState('#10b981');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createGoal({
          name,
          targetAmount: Number(targetAmount),
          targetDate: targetDate ? new Date(targetDate) : undefined,
          icon,
          color
        });
        toast.success('Goal created successfully');
        setOpen(false);
        router.refresh();
        setName('');
        setTargetAmount('');
        setTargetDate('');
        setIcon('target');
        setColor('#10b981');
      } catch (err) {
        toast.error('Failed to create goal');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Goal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Financial Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. New Car, Vacation" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount (₹)</Label>
            <Input id="targetAmount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} type="number" step="0.01" min="1" required placeholder="e.g. 500000" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date (Optional)</Label>
            <Input id="targetDate" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} type="date" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon Identifier</Label>
              <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. car, plane, home" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Theme Color</Label>
              <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} type="color" className="h-10 p-1" />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
