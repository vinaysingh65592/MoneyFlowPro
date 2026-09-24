"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTransaction } from "@/actions/transactions";
import { getAccounts } from "@/actions/accounts";
import { getPeople } from "@/actions/people";
import { getCategories } from "@/actions/auth";
import { toast } from "sonner";

const TRANSACTION_TYPES = [
  { value: "INCOME", label: "Income", group: "Basic" },
  { value: "EXPENSE", label: "Expense", group: "Basic" },
  { value: "LENT", label: "Money Lent", group: "People" },
  { value: "LENT_RETURN", label: "Lent Return", group: "People" },
  { value: "BORROWED", label: "Borrowed", group: "People" },
  { value: "BORROWED_RETURN", label: "Borrowed Return", group: "People" },
  { value: "FAMILY", label: "Family Expense", group: "People" },
  { value: "FRIEND", label: "Friend Expense", group: "People" },
  { value: "EMI", label: "EMI Payment", group: "Loans" },
  { value: "LOAN_RECEIVED", label: "Loan Received", group: "Loans" },
  { value: "LOAN_PAYMENT", label: "Loan Payment", group: "Loans" },
  { value: "TRANSFER", label: "Transfer", group: "Other" },
  { value: "SAVING", label: "Savings", group: "Other" },
  { value: "INVESTMENT", label: "Investment", group: "Other" },
  { value: "OTHER", label: "Other", group: "Other" },
] as const;

const PERSON_TYPES = ["LENT", "LENT_RETURN", "BORROWED", "BORROWED_RETURN", "FAMILY", "FRIEND"];

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: string;
}

export function AddTransactionDialog({ open, onOpenChange, defaultType }: AddTransactionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState(defaultType || "EXPENSE");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [personId, setPersonId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [people, setPeople] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; type: string }>>([]);

  useEffect(() => {
    if (open) {
      if (defaultType) {
        setType(defaultType);
      }
      getAccounts().then((res) => setAccounts(res || []));
      getPeople().then((res) => setPeople(res || []));
      getCategories().then((res) => setCategories(res || []));
    }
  }, [open, defaultType]);

  const filteredCategories = categories.filter((c) => {
    if (["INCOME", "LENT_RETURN", "BORROWED", "LOAN_RECEIVED"].includes(type)) {
      return c.type === "INCOME";
    }
    return c.type === "EXPENSE";
  });

  const showPerson = PERSON_TYPES.includes(type);

  function resetForm() {
    setType(defaultType || "EXPENSE");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setNotes("");
    setAccountId("");
    setCategoryId("");
    setPersonId("");
    setPaymentMethod("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    startTransition(async () => {
      try {
        await createTransaction({
          type: type as any,
          amount: amountNum,
          date,
          description: description || undefined,
          notes: notes || undefined,
          accountId: accountId || undefined,
          categoryId: categoryId || undefined,
          personId: personId || undefined,
          paymentMethod: paymentMethod || undefined,
        });
        toast.success("Transaction added successfully!");
        resetForm();
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add transaction");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Money Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-bold h-14"
              placeholder="0"
            />
          </div>

          {/* Date and Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Person (conditional) */}
          {showPerson && (
            <div className="space-y-2">
              <Label>Person</Label>
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
