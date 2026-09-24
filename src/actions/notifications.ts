'use server'
import { prisma } from '@/lib/prisma'
import { getRequiredUser } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
  const user = await getRequiredUser()
  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

export async function markNotificationRead(id: string) {
  const user = await getRequiredUser()
  await prisma.notification.update({
    where: { id, userId: user.id },
    data: { isRead: true },
  })
  revalidatePath('/')
}

export async function markAllNotificationsRead() {
  const user = await getRequiredUser()
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })
  revalidatePath('/')
}
