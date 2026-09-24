"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { settleUp } from "@/actions/people";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function SettleUpDialog({
  personId,
  netSettlement,
  accounts
}: {
  personId: string;
  netSettlement: number;
  accounts: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isReceivable = netSettlement > 0;
  const amountToSettle = Math.abs(netSettlement);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const amount = Number(formData.get("amount"));
      const accountId = formData.get("accountId") as string;
      
      await settleUp(personId, amount, accountId || undefined);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (amountToSettle === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Settle Up</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-md mb-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {isReceivable ? "You are owed" : "You owe"}
            </p>
            <p className={`text-2xl font-bold ${isReceivable ? "text-emerald-500" : "text-rose-500"}`}>
              {formatCurrency(amountToSettle)}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Settle</Label>
            <Input id="amount" name="amount" type="number" step="0.01" max={amountToSettle} defaultValue={amountToSettle} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountId">Account (Optional)</Label>
            <Select name="accountId">
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select an account to automatically update its balance.
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Confirm Settlement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
