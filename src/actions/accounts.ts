"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-utils";
import { accountSchema, type AccountInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  const user = await getRequiredUser();
  return prisma.financialAccount.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function createAccount(data: AccountInput) {
  const user = await getRequiredUser();
  const validated = accountSchema.parse(data);

  const account = await prisma.financialAccount.create({
    data: {
      ...validated,
      currentBalance: validated.openingBalance,
      userId: user.id,
    },
  });

  revalidatePath("/accounts");
  return account;
}

export async function updateAccount(id: string, data: AccountInput) {
  const user = await getRequiredUser();
  const validated = accountSchema.parse(data);

  const account = await prisma.financialAccount.update({
    where: { id, userId: user.id },
    data: validated,
  });

  revalidatePath("/accounts");
  return account;
}

export async function deleteAccount(id: string) {
  const user = await getRequiredUser();

  await prisma.financialAccount.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/accounts");
}

export async function transferBetweenAccounts(
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  description?: string
) {
  const user = await getRequiredUser();

  if (amount <= 0) throw new Error("Amount must be positive");
  if (fromAccountId === toAccountId) throw new Error("Cannot transfer to the same account");

  // Verify both accounts belong to user
  const [from, to] = await Promise.all([
    prisma.financialAccount.findUnique({
      where: { id: fromAccountId, userId: user.id },
    }),
    prisma.financialAccount.findUnique({
      where: { id: toAccountId, userId: user.id },
    }),
  ]);

  if (!from || !to) throw new Error("Account not found");

  // Create transfer transaction and update balances
  await prisma.$transaction([
    prisma.financialAccount.update({
      where: { id: fromAccountId },
      data: { currentBalance: { decrement: amount } },
    }),
    prisma.financialAccount.update({
      where: { id: toAccountId },
      data: { currentBalance: { increment: amount } },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "TRANSFER",
        amount,
        date: new Date(),
        description: description || `Transfer from ${from.name} to ${to.name}`,
        accountId: fromAccountId,
      },
    }),
  ]);

  revalidatePath("/accounts");
  revalidatePath("/");
}
