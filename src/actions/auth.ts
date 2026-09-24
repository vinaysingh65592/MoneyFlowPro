"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-utils";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function register(data: { name: string; email: string; password: string; confirmPassword: string }) {
  const validated = registerSchema.parse(data);

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(validated.password, 12);

  const user = await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
    },
  });

  // Create default categories
  const defaultIncomeCategories = [
    { name: "Salary", icon: "briefcase", color: "#10B981" },
    { name: "Freelancing", icon: "laptop", color: "#3B82F6" },
    { name: "Business", icon: "building", color: "#8B5CF6" },
    { name: "Bonus", icon: "gift", color: "#F59E0B" },
    { name: "Commission", icon: "percent", color: "#EC4899" },
    { name: "Interest", icon: "trending-up", color: "#06B6D4" },
    { name: "Gift", icon: "heart", color: "#EF4444" },
    { name: "Refund", icon: "rotate-ccw", color: "#6B7280" },
    { name: "Other Income", icon: "plus-circle", color: "#14B8A6" },
  ];

  const defaultExpenseCategories = [
    { name: "Food", icon: "utensils", color: "#EF4444" },
    { name: "Grocery", icon: "shopping-cart", color: "#F97316" },
    { name: "Rent", icon: "home", color: "#8B5CF6" },
    { name: "Electricity", icon: "zap", color: "#F59E0B" },
    { name: "Internet", icon: "wifi", color: "#3B82F6" },
    { name: "Mobile", icon: "smartphone", color: "#06B6D4" },
    { name: "Transportation", icon: "car", color: "#10B981" },
    { name: "Fuel", icon: "fuel", color: "#6B7280" },
    { name: "Shopping", icon: "shopping-bag", color: "#EC4899" },
    { name: "Health", icon: "heart-pulse", color: "#EF4444" },
    { name: "Education", icon: "book-open", color: "#3B82F6" },
    { name: "Entertainment", icon: "film", color: "#8B5CF6" },
    { name: "Family", icon: "users", color: "#F59E0B" },
    { name: "Friends", icon: "user-plus", color: "#10B981" },
    { name: "Other", icon: "more-horizontal", color: "#6B7280" },
  ];

  await prisma.category.createMany({
    data: [
      ...defaultIncomeCategories.map((c) => ({
        ...c,
        type: "INCOME" as const,
        userId: user.id,
        isDefault: true,
      })),
      ...defaultExpenseCategories.map((c) => ({
        ...c,
        type: "EXPENSE" as const,
        userId: user.id,
        isDefault: true,
      })),
    ],
  });

  // Create default accounts
  await prisma.financialAccount.createMany({
    data: [
      { name: "Cash", type: "CASH", icon: "banknote", color: "#10B981", isDefault: true, userId: user.id },
      { name: "Bank Account", type: "BANK", icon: "building-2", color: "#3B82F6", userId: user.id },
      { name: "UPI", type: "UPI", icon: "smartphone", color: "#8B5CF6", userId: user.id },
    ],
  });

  return { success: true };
}

export async function login(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    throw new Error("Invalid email or password");
  }
}

export async function getCategories(type?: "INCOME" | "EXPENSE") {
  const user = await getRequiredUser();
  const where: Record<string, unknown> = {
    OR: [{ userId: user.id }, { userId: null, isDefault: true }],
  };
  if (type) where.type = type;

  return prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function seedDemoData() {
  const user = await getRequiredUser();

  // Check if user already has transactions
  const count = await prisma.transaction.count({
    where: { userId: user.id },
  });

  if (count > 0) {
    throw new Error("You already have transactions. Demo data can only be loaded on a fresh account.");
  }

  const now = new Date();
  const accounts = await prisma.financialAccount.findMany({
    where: { userId: user.id },
  });
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  const cashAccount = accounts.find((a) => a.type === "CASH");
  const bankAccount = accounts.find((a) => a.type === "BANK");

  const foodCategory = categories.find((c) => c.name === "Food");
  const salaryCategory = categories.find((c) => c.name === "Salary");
  const rentCategory = categories.find((c) => c.name === "Rent");
  const shoppingCategory = categories.find((c) => c.name === "Shopping");
  const transportCategory = categories.find((c) => c.name === "Transportation");
  const electricityCategory = categories.find((c) => c.name === "Electricity");
  const internetCategory = categories.find((c) => c.name === "Internet");
  const entertainmentCategory = categories.find((c) => c.name === "Entertainment");
  const healthCategory = categories.find((c) => c.name === "Health");
  const groceryCategory = categories.find((c) => c.name === "Grocery");

  // Create demo people
  const [rahul, priya, amit] = await Promise.all([
    prisma.person.create({
      data: { name: "Rahul Sharma", phone: "9876543210", relationship: "FRIEND", userId: user.id },
    }),
    prisma.person.create({
      data: { name: "Priya Patel", phone: "9876543211", relationship: "SISTER", userId: user.id },
    }),
    prisma.person.create({
      data: { name: "Amit Kumar", phone: "9876543212", relationship: "COLLEAGUE", userId: user.id },
    }),
  ]);

  // Create demo transactions for last 3 months
  const demoTransactions = [];
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

    // Salary
    demoTransactions.push({
      userId: user.id,
      type: "INCOME" as const,
      amount: 45000,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
      description: "Monthly Salary",
      categoryId: salaryCategory?.id,
      accountId: bankAccount?.id,
    });

    // Rent
    demoTransactions.push({
      userId: user.id,
      type: "EXPENSE" as const,
      amount: 12000,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5),
      description: "Monthly Rent",
      categoryId: rentCategory?.id,
      accountId: bankAccount?.id,
    });

    // Groceries
    demoTransactions.push({
      userId: user.id,
      type: "EXPENSE" as const,
      amount: 3500,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 8),
      description: "Weekly Groceries",
      categoryId: groceryCategory?.id,
      accountId: cashAccount?.id,
    });

    // Food
    demoTransactions.push({
      userId: user.id,
      type: "EXPENSE" as const,
      amount: 2500,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10),
      description: "Dining Out",
      categoryId: foodCategory?.id,
      accountId: cashAccount?.id,
    });

    // Shopping
    demoTransactions.push({
      userId: user.id,
      type: "EXPENSE" as const,
      amount: 3000,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 12),
      description: "Online Shopping",
      categoryId: shoppingCategory?.id,
      accountId: bankAccount?.id,
    });

    // Transport
    demoTransactions.push({
      userId: user.id,
      type: "EXPENSE" as const,
      amount: 1500,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15),
      description: "Monthly Transport",
      categoryId: transportCategory?.id,
      accountId: cashAccount?.id,
    });

    // Electricity
    demoTransactions.push({
      userId: user.id,
      type: "EXPENSE" as const,
      amount: 1200,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 18),
      description: "Electricity Bill",
      categoryId: electricityCategory?.id,
      accountId: bankAccount?.id,
    });

    // Internet
    demoTransactions.push({
      userId: user.id,
      type: "EXPENSE" as const,
      amount: 800,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 20),
      description: "Internet Bill",
      categoryId: internetCategory?.id,
      accountId: bankAccount?.id,
    });

    // Entertainment
    demoTransactions.push({
      userId: user.id,
      type: "EXPENSE" as const,
      amount: 1000,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 22),
      description: "Movie & Entertainment",
      categoryId: entertainmentCategory?.id,
      accountId: cashAccount?.id,
    });

    // Health
    demoTransactions.push({
      userId: user.id,
      type: "EXPENSE" as const,
      amount: 500,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 25),
      description: "Gym Membership",
      categoryId: healthCategory?.id,
      accountId: bankAccount?.id,
    });
  }

  // Lent money
  demoTransactions.push({
    userId: user.id,
    type: "LENT" as const,
    amount: 5000,
    date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
    description: "Lent to Rahul",
    personId: rahul.id,
    accountId: cashAccount?.id,
  });

  // Borrowed money
  demoTransactions.push({
    userId: user.id,
    type: "BORROWED" as const,
    amount: 3000,
    date: new Date(now.getFullYear(), now.getMonth() - 1, 20),
    description: "Borrowed from Priya",
    personId: priya.id,
    accountId: cashAccount?.id,
  });

  // Family expense
  demoTransactions.push({
    userId: user.id,
    type: "FAMILY" as const,
    amount: 3000,
    date: new Date(now.getFullYear(), now.getMonth(), 10),
    description: "Family dinner",
    personId: priya.id,
    accountId: cashAccount?.id,
  });

  // Friend expense
  demoTransactions.push({
    userId: user.id,
    type: "FRIEND" as const,
    amount: 2000,
    date: new Date(now.getFullYear(), now.getMonth(), 15),
    description: "Dinner with friends",
    personId: amit.id,
    accountId: cashAccount?.id,
  });

  await prisma.transaction.createMany({ data: demoTransactions });

  // Update account balances
  let bankBalance = 0;
  let cashBalance = 0;

  for (const t of demoTransactions) {
    const isIncoming = ["INCOME", "LENT_RETURN", "BORROWED", "LOAN_RECEIVED"].includes(t.type);
    const change = isIncoming ? t.amount : -t.amount;

    if (t.accountId === bankAccount?.id) bankBalance += change;
    if (t.accountId === cashAccount?.id) cashBalance += change;
  }

  if (bankAccount) {
    await prisma.financialAccount.update({
      where: { id: bankAccount.id },
      data: { currentBalance: bankBalance },
    });
  }
  if (cashAccount) {
    await prisma.financialAccount.update({
      where: { id: cashAccount.id },
      data: { currentBalance: cashBalance },
    });
  }

  // Create demo loan
  const loan = await prisma.loan.create({
    data: {
      userId: user.id,
      name: "Personal Loan",
      type: "PERSONAL",
      lender: "HDFC Bank",
      principal: 200000,
      interestRate: 12,
      startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1),
      tenure: 24,
      emiAmount: 9414,
      dueDate: 5,
      totalPayable: 226000,
      totalPaid: 56484,
      remainingAmount: 169516,
      status: "ACTIVE",
    },
  });

  // Create some EMIs
  for (let i = 1; i <= 24; i++) {
    const dueDate = new Date(now.getFullYear(), now.getMonth() - 6 + i, 5);
    await prisma.eMI.create({
      data: {
        userId: user.id,
        loanId: loan.id,
        emiNumber: i,
        amount: 9414,
        principalComponent: 7747,
        interestComponent: 1667,
        dueDate,
        status: i <= 6 ? "PAID" : i <= 7 ? "DUE_SOON" : "UPCOMING",
        paidDate: i <= 6 ? dueDate : null,
      },
    });
  }

  // Create demo budgets
  await prisma.budget.createMany({
    data: [
      { userId: user.id, name: "Food Budget", category: "Food", amount: 5000, spent: 2500, month: now.getMonth() + 1, year: now.getFullYear() },
      { userId: user.id, name: "Shopping Budget", category: "Shopping", amount: 4000, spent: 3000, month: now.getMonth() + 1, year: now.getFullYear() },
      { userId: user.id, name: "Transport Budget", category: "Transportation", amount: 2000, spent: 1500, month: now.getMonth() + 1, year: now.getFullYear() },
      { userId: user.id, name: "Entertainment", category: "Entertainment", amount: 2000, spent: 1000, month: now.getMonth() + 1, year: now.getFullYear() },
    ],
  });

  // Create demo goals
  await prisma.goal.createMany({
    data: [
      { userId: user.id, name: "New Laptop", targetAmount: 70000, savedAmount: 35000, icon: "laptop", color: "#3B82F6" },
      { userId: user.id, name: "Emergency Fund", targetAmount: 200000, savedAmount: 80000, icon: "shield", color: "#10B981" },
      { userId: user.id, name: "Vacation", targetAmount: 50000, savedAmount: 15000, icon: "plane", color: "#F59E0B", targetDate: new Date(now.getFullYear() + 1, 3, 1) },
    ],
  });

  revalidatePath("/");
}
