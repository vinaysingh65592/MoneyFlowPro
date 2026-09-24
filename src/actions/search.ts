'use server'
import { prisma } from '@/lib/prisma'
import { getRequiredUser } from '@/lib/auth-utils'

export async function globalSearch(query: string) {
  const user = await getRequiredUser()
  if (!query || query.length < 2) return { transactions: [], people: [], loans: [] }
  
  const [transactions, people, loans] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        OR: [
          { description: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true },
    }),
    prisma.person.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    }),
    prisma.loan.findMany({
      where: {
        userId: user.id,
        name: { contains: query, mode: 'insensitive' },
      },
      take: 5,
    }),
  ])
  
  return {
    transactions: JSON.parse(JSON.stringify(transactions)),
    people: JSON.parse(JSON.stringify(people)),
    loans: JSON.parse(JSON.stringify(loans)),
  }
}
