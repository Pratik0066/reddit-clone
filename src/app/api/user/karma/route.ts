import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ postKarma: 0, commentKarma: 0 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { postKarma: true, commentKarma: true },
  })

  return NextResponse.json(user ?? { postKarma: 0, commentKarma: 0 })
}
