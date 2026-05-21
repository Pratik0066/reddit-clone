import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("Unauthorized", { status: 401 })

  const { postId } = await req.json()
  if (!postId) return new NextResponse("Missing postId", { status: 400 })

  const existing = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } })
    return NextResponse.json({ saved: false })
  }

  await prisma.savedPost.create({
    data: { userId, postId },
  })

  return NextResponse.json({ saved: true })
}
