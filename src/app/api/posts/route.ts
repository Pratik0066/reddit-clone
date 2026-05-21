import prisma from "@/lib/prisma"
import { ensureUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const user = await ensureUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, content, communityId, imageUrl } = body

    const safeCommunityId = communityId === "" ? undefined : communityId

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        communityId: safeCommunityId,
        authorId: user.id,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("POST_CREATION_ERROR", error)
    return new NextResponse("Bad Request", { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await ensureUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { postId } = body

    if (!postId) {
      return new NextResponse("Missing postId", { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    if (post.authorId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await prisma.post.delete({ where: { id: postId } })

    return NextResponse.json({ message: "Post deleted" })
  } catch (error) {
    console.error("POST_DELETE_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
