"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth-utils";
import { personSchema, type PersonInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getPeople() {
  const user = await getRequiredUser();
  return prisma.person.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
}

export async function getPerson(id: string) {
  const user = await getRequiredUser();
  return prisma.person.findUnique({
    where: { id, userId: user.id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        take: 50,
        include: { category: true },
      },
    },
  });
}

export async function createPerson(data: PersonInput) {
  const user = await getRequiredUser();
  const validated = personSchema.parse(data);

  const person = await prisma.person.create({
    data: {
      ...validated,
      email: validated.email || null,
      userId: user.id,
    },
  });

  revalidatePath("/people");
  return person;
}

export async function updatePerson(id: string, data: PersonInput) {
  const user = await getRequiredUser();
  const validated = personSchema.parse(data);

  const person = await prisma.person.update({
    where: { id, userId: user.id },
    data: {
      ...validated,
      email: validated.email || null,
    },
  });

  revalidatePath("/people");
  return person;
}

export async function deletePerson(id: string) {
  const user = await getRequiredUser();

  await prisma.person.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/people");
}

export async function getPersonSettlement(personId: string) {
  const user = await getRequiredUser();

  // Money lent to this person
  const lent = await prisma.transaction.aggregate({
    where: { userId: user.id, personId, type: "LENT" },
    _sum: { amount: true },
  });

  // Money returned by this person
  const lentReturned = await prisma.transaction.aggregate({
    where: { userId: user.id, personId, type: "LENT_RETURN" },
    _sum: { amount: true },
  });

  // Money borrowed from this person
  const borrowed = await prisma.transaction.aggregate({
    where: { userId: user.id, personId, type: "BORROWED" },
    _sum: { amount: true },
  });

  // Money returned to this person
  const borrowedReturned = await prisma.transaction.aggregate({
    where: { userId: user.id, personId, type: "BORROWED_RETURN" },
    _sum: { amount: true },
  });

  // Family/friend spending for this person
  const familySpent = await prisma.transaction.aggregate({
    where: { userId: user.id, personId, type: { in: ["FAMILY", "FRIEND"] } },
    _sum: { amount: true },
  });

  const totalLent = lent._sum.amount || 0;
  const totalLentReturned = lentReturned._sum.amount || 0;
  const totalBorrowed = borrowed._sum.amount || 0;
  const totalBorrowedReturned = borrowedReturned._sum.amount || 0;

  const receivable = totalLent - totalLentReturned;
  const payable = totalBorrowed - totalBorrowedReturned;
  const netSettlement = receivable - payable;

  return {
    totalLent,
    totalLentReturned,
    pendingLent: Math.max(0, receivable),
    totalBorrowed,
    totalBorrowedReturned,
    pendingBorrowed: Math.max(0, payable),
    netSettlement,
    familySpent: familySpent._sum.amount || 0,
  };
}

export async function getAllSettlements() {
  const user = await getRequiredUser();

  const people = await prisma.person.findMany({
    where: { userId: user.id },
  });

  const settlements = await Promise.all(
    people.map(async (person) => {
      const settlement = await getPersonSettlement(person.id);
      return {
        person,
        ...settlement,
      };
    })
  );

  return settlements.filter(
    (s) => s.pendingLent > 0 || s.pendingBorrowed > 0
  );
}

export async function settleUp(personId: string, amount: number, accountId?: string) {
  const user = await getRequiredUser();

  const settlement = await getPersonSettlement(personId);

  if (settlement.netSettlement > 0) {
    // Person owes us - they're returning money
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "LENT_RETURN",
        amount,
        date: new Date(),
        personId,
        accountId,
        description: "Settlement",
      },
    });
  } else {
    // We owe person - we're returning money
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "BORROWED_RETURN",
        amount,
        date: new Date(),
        personId,
        accountId,
        description: "Settlement",
      },
    });
  }

  // Update account balance if specified
  if (accountId) {
    const balanceChange = settlement.netSettlement > 0 ? amount : -amount;
    await prisma.financialAccount.update({
      where: { id: accountId, userId: user.id },
      data: { currentBalance: { increment: balanceChange } },
    });
  }

  // Record settlement
  await prisma.settlement.create({
    data: {
      userId: user.id,
      personId,
      amount,
      date: new Date(),
    },
  });

  revalidatePath("/people");
  revalidatePath("/");
}
