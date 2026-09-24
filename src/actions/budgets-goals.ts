"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-utils";
import { budgetSchema, goalSchema, type BudgetInput, type GoalInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ─── Budget Actions ─────────────────────────────────────────

export async function getBudgets(month?: number, year?: number) {
  const user = await getRequiredUser();
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();

  return prisma.budget.findMany({
    where: { userId: user.id, month: m, year: y },
    orderBy: { name: "asc" },
  });
}

export async function createBudget(data: BudgetInput) {
  const user = await getRequiredUser();
  const validated = budgetSchema.parse(data);

  // Calculate current spending for this category/month
  const startOfMonth = new Date(validated.year, validated.month - 1, 1);
  const endOfMonth = new Date(validated.year, validated.month, 0, 23, 59, 59);

  const spending = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      type: { in: ["EXPENSE", "FAMILY", "FRIEND"] },
      date: { gte: startOfMonth, lte: endOfMonth },
      category: { name: validated.category },
    },
    _sum: { amount: true },
  });

  const budget = await prisma.budget.create({
    data: {
      ...validated,
      spent: spending._sum.amount || 0,
      userId: user.id,
    },
  });

  revalidatePath("/budgets");
  return budget;
}

export async function updateBudget(id: string, data: BudgetInput) {
  const user = await getRequiredUser();
  const validated = budgetSchema.parse(data);

  const budget = await prisma.budget.update({
    where: { id, userId: user.id },
    data: validated,
  });

  revalidatePath("/budgets");
  return budget;
}

export async function deleteBudget(id: string) {
  const user = await getRequiredUser();

  await prisma.budget.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/budgets");
}

// ─── Goal Actions ───────────────────────────────────────────

export async function getGoals() {
  const user = await getRequiredUser();
  return prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createGoal(data: GoalInput) {
  const user = await getRequiredUser();
  const validated = goalSchema.parse(data);

  const goal = await prisma.goal.create({
    data: {
      ...validated,
      targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
      userId: user.id,
    },
  });

  revalidatePath("/goals");
  return goal;
}

export async function updateGoal(id: string, data: GoalInput) {
  const user = await getRequiredUser();
  const validated = goalSchema.parse(data);

  const goal = await prisma.goal.update({
    where: { id, userId: user.id },
    data: {
      ...validated,
      targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
    },
  });

  revalidatePath("/goals");
  return goal;
}

export async function deleteGoal(id: string) {
  const user = await getRequiredUser();

  await prisma.goal.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/goals");
}

export async function addToGoal(goalId: string, amount: number, accountId?: string) {
  const user = await getRequiredUser();

  if (amount <= 0) throw new Error("Amount must be positive");

  await prisma.goal.update({
    where: { id: goalId, userId: user.id },
    data: { savedAmount: { increment: amount } },
  });

  // Create savings transaction
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "SAVING",
      amount,
      date: new Date(),
      goalId,
      accountId,
      description: "Savings contribution",
    },
  });

  // Update account balance
  if (accountId) {
    await prisma.financialAccount.update({
      where: { id: accountId, userId: user.id },
      data: { currentBalance: { decrement: amount } },
    });
  }

  // Check if goal completed
  const goal = await prisma.goal.findUnique({
    where: { id: goalId, userId: user.id },
  });

  if (goal && goal.savedAmount >= goal.targetAmount) {
    await prisma.goal.update({
      where: { id: goalId },
      data: { status: "COMPLETED" },
    });
  }

  revalidatePath("/goals");
  revalidatePath("/");
}
