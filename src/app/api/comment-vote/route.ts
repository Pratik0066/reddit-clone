import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("Unauthorized", { status: 401 })

  const { commentId, voteType } = await req.json()
  if (!commentId || !voteType) return new NextResponse("Missing fields", { status: 400 })

  if (voteType !== "UP" && voteType !== "DOWN") {
    return new NextResponse("Invalid vote type", { status: 400 })
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  })
  if (!comment) return new NextResponse("Comment not found", { status: 404 })

  const existingVote = await prisma.commentVote.findUnique({
    where: { userId_commentId: { userId, commentId } },
  })

  let delta = 0

  if (existingVote) {
    if (existingVote.type === voteType) {
      await prisma.commentVote.delete({ where: { id: existingVote.id } })
      delta = voteType === "UP" ? -1 : 1
    } else {
      await prisma.commentVote.update({
        where: { id: existingVote.id },
        data: { type: voteType },
      })
      delta = voteType === "UP" ? 2 : -2
    }
  } else {
    await prisma.commentVote.create({
      data: { userId, commentId, type: voteType },
    })
    delta = voteType === "UP" ? 1 : -1
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { voteCount: { increment: delta } },
  })

  await prisma.user.update({
    where: { id: comment.authorId },
    data: { commentKarma: { increment: delta } },
  })

  const updated = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { voteCount: true },
  })

  return NextResponse.json({ voteCount: updated?.voteCount ?? 0 })
}
