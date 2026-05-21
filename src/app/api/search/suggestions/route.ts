import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ communities: [], posts: [] })
  }

  const [communities, posts] = await Promise.all([
    prisma.community.findMany({
      where: {
        name: { contains: q.trim(), mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { members: true } },
      },
      take: 5,
    }),
    prisma.post.findMany({
      where: {
        title: { contains: q.trim(), mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        community: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return NextResponse.json({ communities, posts })
}
