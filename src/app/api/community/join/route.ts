import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("Unauthorized", { status: 401 })

  const { communityId } = await req.json()
  if (!communityId) return new NextResponse("Missing communityId", { status: 400 })

  const community = await prisma.community.findFirst({
    where: { OR: [{ id: communityId }, { slug: communityId }] },
    select: { id: true },
  })
  if (!community) return new NextResponse("Community not found", { status: 404 })

  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId, communityId: community.id } },
  })

  if (existing) {
    await prisma.communityMember.delete({ where: { id: existing.id } })
    return NextResponse.json({ joined: false })
  }

  await prisma.communityMember.create({
    data: { userId, communityId: community.id },
  })

  return NextResponse.json({ joined: true })
}
