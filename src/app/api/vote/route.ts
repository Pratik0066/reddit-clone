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
    const { postId, voteType } = body

    if (!postId || !voteType) {
      return new NextResponse("Invalid request data", { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    })

    if (existingVote) {
      if (existingVote.type === voteType) {
        await prisma.vote.delete({ where: { id: existingVote.id } })
        const karmaDelta = existingVote.type === "UP" ? -1 : 1
        await prisma.user.update({
          where: { id: post.authorId },
          data: { postKarma: { increment: karmaDelta } },
        })
        return NextResponse.json({ message: "Vote removed" })
      }

      const updatedVote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type: voteType },
      })
      const karmaDelta = voteType === "UP" ? 2 : -2
      await prisma.user.update({
        where: { id: post.authorId },
        data: { postKarma: { increment: karmaDelta } },
      })
      return NextResponse.json(updatedVote)
    }

    const newVote = await prisma.vote.create({
      data: {
        type: voteType,
        userId: user.id,
        postId: postId,
      },
    })

    const karmaDelta = voteType === "UP" ? 1 : -1
    await prisma.user.update({
      where: { id: post.authorId },
      data: { postKarma: { increment: karmaDelta } },
    })

    return NextResponse.json(newVote)
  } catch (error) {
    console.error("VOTE_ERROR", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
