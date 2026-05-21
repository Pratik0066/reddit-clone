import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { ensureUser } from "@/lib/auth"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const joined = searchParams.get("joined")
  const { userId } = await auth()

  if (joined === "true" && userId) {
    const memberships = await prisma.communityMember.findMany({
      where: { userId },
      include: {
        community: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
      orderBy: { joinedAt: "desc" },
    })
    return NextResponse.json(memberships.map((m) => m.community))
  }

  const communities = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, icon: true, _count: { select: { posts: true } } },
    take: 50,
  })

  return NextResponse.json(communities)
}

export async function POST(req: Request) {
  try {
    const user = await ensureUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description } = body

    if (!name || name.length < 3) {
      return new NextResponse("Community name must be at least 3 characters", {
        status: 400,
      })
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-")

    const existingCommunity = await prisma.community.findUnique({
      where: { name },
    })

    if (existingCommunity) {
      return new NextResponse("Community already exists", { status: 409 })
    }

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description: description || "",
      },
    })

    await prisma.communityMember.create({
      data: { userId: user.id, communityId: community.id },
    })

    return NextResponse.json(community)
  } catch (error) {
    console.error("COMMUNITY_POST_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
