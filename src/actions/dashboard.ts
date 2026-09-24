"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-utils";

export async function getDashboardData() {
  const user = await getRequiredUser();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get all transactions for this month
  const monthTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  // Calculate totals
  let monthIncome = 0;
  let monthExpense = 0;

  for (const t of monthTransactions) {
    if (["INCOME", "LENT_RETURN", "LOAN_RECEIVED"].includes(t.type)) {
      monthIncome += t.amount;
    }
    if (["EXPENSE", "EMI", "LOAN_PAYMENT", "LENT", "BORROWED_RETURN", "FAMILY", "FRIEND"].includes(t.type)) {
      monthExpense += t.amount;
    }
  }

  // Total balance across all accounts
  const accounts = await prisma.financialAccount.findMany({
    where: { userId: user.id, isActive: true },
  });
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  // Money lent (pending)
  const lentTransactions = await prisma.transaction.findMany({
    where: { userId: user.id, type: "LENT" },
  });
  const lentReturns = await prisma.transaction.findMany({
    where: { userId: user.id, type: "LENT_RETURN" },
  });
  const totalLent = lentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalLentReturned = lentReturns.reduce((sum, t) => sum + t.amount, 0);
  const moneyToReceive = totalLent - totalLentReturned;

  // Money borrowed (pending)
  const borrowedTransactions = await prisma.transaction.findMany({
    where: { userId: user.id, type: "BORROWED" },
  });
  const borrowedReturns = await prisma.transaction.findMany({
    where: { userId: user.id, type: "BORROWED_RETURN" },
  });
  const totalBorrowed = borrowedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalBorrowedReturned = borrowedReturns.reduce((sum, t) => sum + t.amount, 0);
  const moneyToPay = totalBorrowed - totalBorrowedReturned;

  // Upcoming EMI
  const upcomingEMI = await prisma.eMI.findMany({
    where: {
      userId: user.id,
      status: { in: ["UPCOMING", "DUE_SOON"] },
      dueDate: { gte: now, lte: endOfMonth },
    },
    include: { loan: true },
  });
  const upcomingEMITotal = upcomingEMI.reduce((sum, e) => sum + e.amount, 0);

  // Loan outstanding
  const activeLoans = await prisma.loan.findMany({
    where: { userId: user.id, status: "ACTIVE" },
  });
  const loanOutstanding = activeLoans.reduce((sum, l) => sum + l.remainingAmount, 0);

  // Recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true, person: true, account: true },
    orderBy: { date: "desc" },
    take: 10,
  });

  // Spending by category this month
  const expenseTransactions = monthTransactions.filter((t) =>
    ["EXPENSE", "FAMILY", "FRIEND"].includes(t.type)
  );

  const categoryIds = [...new Set(expenseTransactions.map((t) => t.categoryId).filter(Boolean))];
  const categories = categoryIds.length > 0 ? await prisma.category.findMany({
    where: { id: { in: categoryIds as string[] } },
  }) : [];

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const spendingByCategory: Record<string, number> = {};

  for (const t of expenseTransactions) {
    const catName = t.categoryId ? categoryMap.get(t.categoryId) || "Other" : "Other";
    spendingByCategory[catName] = (spendingByCategory[catName] || 0) + t.amount;
  }

  // Cash flow last 6 months
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const sixMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: sixMonthsAgo },
    },
  });

  const cashFlowData: Array<{
    month: string;
    income: number;
    expense: number;
    savings: number;
  }> = [];

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const monthName = monthStart.toLocaleString("en", { month: "short" });

    let income = 0;
    let expense = 0;

    for (const t of sixMonthTransactions) {
      if (t.date >= monthStart && t.date <= monthEnd) {
        if (["INCOME", "LENT_RETURN", "LOAN_RECEIVED"].includes(t.type)) {
          income += t.amount;
        }
        if (["EXPENSE", "EMI", "LOAN_PAYMENT", "LENT", "BORROWED_RETURN", "FAMILY", "FRIEND"].includes(t.type)) {
          expense += t.amount;
        }
      }
    }

    cashFlowData.push({
      month: monthName,
      income,
      expense,
      savings: income - expense,
    });
  }

  // Budget status
  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  // Goals
  const goals = await prisma.goal.findMany({
    where: { userId: user.id, status: "IN_PROGRESS" },
    take: 5,
  });

  return {
    totalBalance,
    monthIncome,
    monthExpense,
    availableBalance: totalBalance,
    moneyToReceive: Math.max(0, moneyToReceive),
    moneyToPay: Math.max(0, moneyToPay),
    upcomingEMITotal,
    loanOutstanding,
    recentTransactions: JSON.parse(JSON.stringify(recentTransactions)),
    spendingByCategory,
    cashFlowData,
    budgets: JSON.parse(JSON.stringify(budgets)),
    goals: JSON.parse(JSON.stringify(goals)),
    upcomingEMI: JSON.parse(JSON.stringify(upcomingEMI)),
    accounts: JSON.parse(JSON.stringify(accounts)),
  };
}

export async function getFinancialHealth() {
  const user = await getRequiredUser();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const monthTransactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  let income = 0;
  let expense = 0;
  let emiTotal = 0;

  for (const t of monthTransactions) {
    if (["INCOME"].includes(t.type)) income += t.amount;
    if (["EXPENSE", "FAMILY", "FRIEND"].includes(t.type)) expense += t.amount;
    if (t.type === "EMI") emiTotal += t.amount;
  }

  const savingsRate = income > 0 ? ((income - expense - emiTotal) / income) * 100 : 0;
  const expenseToIncomeRatio = income > 0 ? (expense / income) * 100 : 0;
  const emiBurden = income > 0 ? (emiTotal / income) * 100 : 0;
  const monthlyCashFlow = income - expense - emiTotal;

  // Get outstanding debt
  const activeLoans = await prisma.loan.findMany({
    where: { userId: user.id, status: "ACTIVE" },
  });
  const outstandingDebt = activeLoans.reduce((sum, l) => sum + l.remainingAmount, 0);

  // Receivables and payables
  const lentPending = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "LENT" },
    _sum: { amount: true },
  });
  const lentReturned = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "LENT_RETURN" },
    _sum: { amount: true },
  });
  const receivables = (lentPending._sum.amount || 0) - (lentReturned._sum.amount || 0);

  const borrowedPending = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "BORROWED" },
    _sum: { amount: true },
  });
  const borrowedReturned = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "BORROWED_RETURN" },
    _sum: { amount: true },
  });
  const payables = (borrowedPending._sum.amount || 0) - (borrowedReturned._sum.amount || 0);

  return {
    savingsRate: Math.round(savingsRate * 10) / 10,
    expenseToIncomeRatio: Math.round(expenseToIncomeRatio * 10) / 10,
    emiBurden: Math.round(emiBurden * 10) / 10,
    monthlyCashFlow,
    outstandingDebt,
    receivables: Math.max(0, receivables),
    payables: Math.max(0, payables),
    monthlyIncome: income,
    monthlyExpense: expense,
    monthlyEMI: emiTotal,
  };
}
