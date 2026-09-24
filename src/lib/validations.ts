import { z } from "zod";

// ─── Transaction Schemas ────────────────────────────────────
export const transactionSchema = z.object({
  type: z.enum([
    "INCOME", "EXPENSE", "EMI", "LOAN_RECEIVED", "LOAN_PAYMENT",
    "LENT", "LENT_RETURN", "BORROWED", "BORROWED_RETURN",
    "FAMILY", "FRIEND", "TRANSFER", "SAVING", "INVESTMENT", "OTHER",
  ]),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  notes: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  personId: z.string().optional(),
  loanId: z.string().optional(),
  goalId: z.string().optional(),
  paymentMethod: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  attachmentUrl: z.string().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// ─── Account Schemas ────────────────────────────────────────
export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["CASH", "BANK", "UPI", "WALLET", "CREDIT_CARD", "SAVINGS_ACCOUNT", "OTHER"]),
  openingBalance: z.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AccountInput = z.infer<typeof accountSchema>;

// ─── Person Schemas ─────────────────────────────────────────
export const personSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  relationship: z.enum([
    "FATHER", "MOTHER", "BROTHER", "SISTER", "SPOUSE",
    "CHILD", "FRIEND", "COLLEAGUE", "RELATIVE", "OTHER",
  ]).optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type PersonInput = z.infer<typeof personSchema>;

// ─── Loan Schemas ───────────────────────────────────────────
export const loanSchema = z.object({
  name: z.string().min(1, "Loan name is required"),
  type: z.enum(["PERSONAL", "BANK", "VEHICLE", "EDUCATION", "HOME", "OTHER"]),
  lender: z.string().optional(),
  personId: z.string().optional(),
  principal: z.number().positive("Principal must be positive"),
  interestRate: z.number().min(0).default(0),
  startDate: z.string().or(z.date()),
  tenure: z.number().positive().optional(),
  emiAmount: z.number().positive().optional(),
  dueDate: z.number().min(1).max(31).optional(),
  notes: z.string().optional(),
});

export type LoanInput = z.infer<typeof loanSchema>;

// ─── Budget Schemas ─────────────────────────────────────────
export const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

// ─── Goal Schemas ───────────────────────────────────────────
export const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.number().positive("Target amount must be positive"),
  targetDate: z.string().or(z.date()).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;

// ─── Auth Schemas ───────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Settlement Schema ──────────────────────────────────────
export const settlementSchema = z.object({
  personId: z.string().min(1, "Person is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().or(z.date()),
  notes: z.string().optional(),
});

export type SettlementInput = z.infer<typeof settlementSchema>;

// ─── Recurring Transaction Schema ───────────────────────────
export const recurringTransactionSchema = z.object({
  type: z.enum([
    "INCOME", "EXPENSE", "EMI", "LOAN_RECEIVED", "LOAN_PAYMENT",
    "LENT", "LENT_RETURN", "BORROWED", "BORROWED_RETURN",
    "FAMILY", "FRIEND", "TRANSFER", "SAVING", "INVESTMENT", "OTHER",
  ]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]),
  interval: z.number().min(1).default(1),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
});

export type RecurringTransactionInput = z.infer<typeof recurringTransactionSchema>;
