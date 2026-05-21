import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { userId } = await auth()

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      _count: { select: { posts: true, members: true } },
      members: userId ? { where: { userId }, take: 1 } : false,
    },
  })

  if (!community) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({
    ...community,
    isJoined: community.members ? community.members.length > 0 : false,
  })
}
