"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-utils";
import { loanSchema, type LoanInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getLoans() {
  const user = await getRequiredUser();
  return prisma.loan.findMany({
    where: { userId: user.id },
    include: { person: true, emis: { orderBy: { dueDate: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLoan(data: LoanInput) {
  const user = await getRequiredUser();
  const validated = loanSchema.parse(data);

  // Calculate total payable
  const totalPayable = validated.tenure && validated.emiAmount
    ? validated.emiAmount * validated.tenure
    : validated.principal * (1 + validated.interestRate / 100);

  const loan = await prisma.loan.create({
    data: {
      ...validated,
      startDate: new Date(validated.startDate),
      totalPayable,
      remainingAmount: totalPayable,
      userId: user.id,
    },
  });

  // Generate EMIs if tenure and EMI amount provided
  if (validated.tenure && validated.emiAmount && validated.dueDate) {
    const emis = [];
    const startDate = new Date(validated.startDate);

    for (let i = 1; i <= validated.tenure; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      dueDate.setDate(validated.dueDate);

      // Simple calculation - in real app would use proper amortization
      const interestComponent = (validated.principal * validated.interestRate) / (100 * 12);
      const principalComponent = validated.emiAmount - interestComponent;

      emis.push({
        userId: user.id,
        loanId: loan.id,
        emiNumber: i,
        amount: validated.emiAmount,
        principalComponent: Math.max(0, principalComponent),
        interestComponent: Math.max(0, interestComponent),
        dueDate,
        status: "UPCOMING" as const,
      });
    }

    await prisma.eMI.createMany({ data: emis });
  }

  revalidatePath("/loans");
  revalidatePath("/emi");
  return loan;
}

export async function updateLoan(id: string, data: LoanInput) {
  const user = await getRequiredUser();
  const validated = loanSchema.parse(data);

  const loan = await prisma.loan.update({
    where: { id, userId: user.id },
    data: {
      ...validated,
      startDate: new Date(validated.startDate),
    },
  });

  revalidatePath("/loans");
  return loan;
}

export async function deleteLoan(id: string) {
  const user = await getRequiredUser();

  // Delete associated EMIs first
  await prisma.eMI.deleteMany({
    where: { loanId: id, userId: user.id },
  });

  await prisma.loan.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/loans");
  revalidatePath("/emi");
}

// ─── EMI Actions ────────────────────────────────────────────

export async function getEMIs(filter?: { status?: string }) {
  const user = await getRequiredUser();

  const where: Record<string, unknown> = { userId: user.id };
  if (filter?.status) where.status = filter.status;

  return prisma.eMI.findMany({
    where,
    include: { loan: true },
    orderBy: { dueDate: "asc" },
  });
}

export async function markEMIPaid(emiId: string, accountId?: string) {
  const user = await getRequiredUser();

  const emi = await prisma.eMI.findUnique({
    where: { id: emiId, userId: user.id },
    include: { loan: true },
  });

  if (!emi) throw new Error("EMI not found");

  // Update EMI status
  await prisma.eMI.update({
    where: { id: emiId },
    data: {
      status: "PAID",
      paidDate: new Date(),
    },
  });

  // Update loan
  await prisma.loan.update({
    where: { id: emi.loanId },
    data: {
      totalPaid: { increment: emi.amount },
      remainingAmount: { decrement: emi.amount },
    },
  });

  // Create transaction
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "EMI",
      amount: emi.amount,
      date: new Date(),
      description: `EMI #${emi.emiNumber} - ${emi.loan.name}`,
      loanId: emi.loanId,
      emiId: emi.id,
      accountId,
    },
  });

  // Update account balance
  if (accountId) {
    await prisma.financialAccount.update({
      where: { id: accountId, userId: user.id },
      data: { currentBalance: { decrement: emi.amount } },
    });
  }

  // Check if all EMIs paid
  const remainingEMIs = await prisma.eMI.count({
    where: { loanId: emi.loanId, status: { not: "PAID" } },
  });

  if (remainingEMIs === 0) {
    await prisma.loan.update({
      where: { id: emi.loanId },
      data: { status: "COMPLETED" },
    });
  }

  revalidatePath("/emi");
  revalidatePath("/loans");
  revalidatePath("/");
}
