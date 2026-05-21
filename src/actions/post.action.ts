"use server"

import prisma from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

function getOrderBy(sort: string): Prisma.PostOrderByWithRelationInput {
  switch (sort) {
    case "top":
      return { votes: { _count: "desc" } }
    case "hot":
      return { createdAt: "desc" }
    default:
      return { createdAt: "desc" }
  }
}

export async function fetchNextPosts(
  cursor: string | null,
  sort: string = "hot"
) {
  try {
    const orderBy = getOrderBy(sort)

    if (sort === "rising") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const recent = await prisma.post.findMany({
        take: 5,
        skip: cursor ? 1 : 0,
        ...(cursor && { cursor: { id: cursor } }),
        where: { createdAt: { gte: oneHourAgo } },
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          community: true,
          votes: true,
          _count: { select: { comments: true } },
        },
      })
      if (recent.length > 0) return recent
    }

    const posts = await prisma.post.findMany({
      take: 5,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor } }),
      orderBy,
      include: {
        author: true,
        community: true,
        votes: true,
        _count: { select: { comments: true } },
      },
    })

    return posts
  } catch (error) {
    console.error("Error fetching next posts:", error)
    return []
  }
}
