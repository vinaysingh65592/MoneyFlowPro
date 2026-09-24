"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-utils";
import { transactionSchema, type TransactionInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getTransactions(params?: {
  type?: string;
  categoryId?: string;
  accountId?: string;
  personId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const user = await getRequiredUser();
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId: user.id };

  if (params?.type) where.type = params.type;
  if (params?.categoryId) where.categoryId = params.categoryId;
  if (params?.accountId) where.accountId = params.accountId;
  if (params?.personId) where.personId = params.personId;

  if (params?.startDate || params?.endDate) {
    where.date = {};
    if (params?.startDate) (where.date as Record<string, unknown>).gte = new Date(params.startDate);
    if (params?.endDate) (where.date as Record<string, unknown>).lte = new Date(params.endDate);
  }

  if (params?.search) {
    where.OR = [
      { description: { contains: params.search, mode: "insensitive" } },
      { notes: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        person: true,
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, pages: Math.ceil(total / limit) };
}

export async function createTransaction(data: TransactionInput) {
  const user = await getRequiredUser();
  const validated = transactionSchema.parse(data);

  const transaction = await prisma.transaction.create({
    data: {
      ...validated,
      date: new Date(validated.date),
      userId: user.id,
      tags: validated.tags || [],
    },
  });

  // Update account balance
  if (validated.accountId) {
    const isIncoming = [
      "INCOME", "LENT_RETURN", "BORROWED", "LOAN_RECEIVED",
    ].includes(validated.type);
    const balanceChange = isIncoming ? validated.amount : -validated.amount;

    await prisma.financialAccount.update({
      where: { id: validated.accountId, userId: user.id },
      data: { currentBalance: { increment: balanceChange } },
    });
  }

  // Update budget spent if expense
  if (["EXPENSE", "FAMILY", "FRIEND"].includes(validated.type) && validated.categoryId) {
    const date = new Date(validated.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const category = await prisma.category.findUnique({
      where: { id: validated.categoryId },
    });

    if (category) {
      await prisma.budget.updateMany({
        where: {
          userId: user.id,
          category: category.name,
          month,
          year,
        },
        data: { spent: { increment: validated.amount } },
      });
    }
  }

  // Update goal if saving
  if (validated.type === "SAVING" && validated.goalId) {
    await prisma.goal.update({
      where: { id: validated.goalId, userId: user.id },
      data: { savedAmount: { increment: validated.amount } },
    });
  }

  // Update loan if loan payment
  if (validated.type === "LOAN_PAYMENT" && validated.loanId) {
    await prisma.loan.update({
      where: { id: validated.loanId, userId: user.id },
      data: {
        totalPaid: { increment: validated.amount },
        remainingAmount: { decrement: validated.amount },
      },
    });
  }

  revalidatePath("/");
  return transaction;
}

export async function updateTransaction(id: string, data: TransactionInput) {
  const user = await getRequiredUser();
  const validated = transactionSchema.parse(data);

  // Get old transaction to reverse balance change
  const old = await prisma.transaction.findUnique({
    where: { id, userId: user.id },
  });

  if (!old) throw new Error("Transaction not found");

  // Reverse old balance
  if (old.accountId) {
    const wasIncoming = [
      "INCOME", "LENT_RETURN", "BORROWED", "LOAN_RECEIVED",
    ].includes(old.type);
    const reversal = wasIncoming ? -old.amount : old.amount;

    await prisma.financialAccount.update({
      where: { id: old.accountId, userId: user.id },
      data: { currentBalance: { increment: reversal } },
    });
  }

  const transaction = await prisma.transaction.update({
    where: { id, userId: user.id },
    data: {
      ...validated,
      date: new Date(validated.date),
      tags: validated.tags || [],
    },
  });

  // Apply new balance
  if (validated.accountId) {
    const isIncoming = [
      "INCOME", "LENT_RETURN", "BORROWED", "LOAN_RECEIVED",
    ].includes(validated.type);
    const balanceChange = isIncoming ? validated.amount : -validated.amount;

    await prisma.financialAccount.update({
      where: { id: validated.accountId, userId: user.id },
      data: { currentBalance: { increment: balanceChange } },
    });
  }

  revalidatePath("/");
  return transaction;
}

export async function deleteTransaction(id: string) {
  const user = await getRequiredUser();

  const transaction = await prisma.transaction.findUnique({
    where: { id, userId: user.id },
  });

  if (!transaction) throw new Error("Transaction not found");

  // Reverse balance change
  if (transaction.accountId) {
    const wasIncoming = [
      "INCOME", "LENT_RETURN", "BORROWED", "LOAN_RECEIVED",
    ].includes(transaction.type);
    const reversal = wasIncoming ? -transaction.amount : transaction.amount;

    await prisma.financialAccount.update({
      where: { id: transaction.accountId, userId: user.id },
      data: { currentBalance: { increment: reversal } },
    });
  }

  await prisma.transaction.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/");
}
