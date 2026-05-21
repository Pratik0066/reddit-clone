import { auth, currentUser } from "@clerk/nextjs/server"
import prisma from "./prisma"

export async function getAuthUser() {
  const { userId } = await auth()
  return userId
}

export async function ensureUser() {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      username: clerkUser.username || clerkUser.firstName || `user_${userId.slice(0, 6)}`,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      id: userId,
      username: clerkUser.username || clerkUser.firstName || `user_${userId.slice(0, 6)}`,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      imageUrl: clerkUser.imageUrl,
    },
  })

  return user
}
