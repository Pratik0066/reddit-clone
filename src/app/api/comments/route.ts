import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ensureUser } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const user = await ensureUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { text, postId, parentId } = body

    if (!text || text.trim().length === 0) {
      return new NextResponse("Comment text is required", { status: 400 })
    }

    if (!postId) {
      return new NextResponse("Post ID is required", { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        content: text,
        postId,
        authorId: user.id,
        parentId: parentId || undefined,
      },
    })

    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("COMMENT_CREATION_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
