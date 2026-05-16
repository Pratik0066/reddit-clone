import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 1. Verify the user is logged in
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Grab the post ID and the vote type ("UP" or "DOWN") from the frontend
    const body = await req.json();
    const { postId, voteType } = body;

    if (!postId || !voteType) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // 3. Check if this user has already voted on this specific post
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (existingVote) {
      // Scenario A: They clicked the EXACT SAME vote button again (Toggle OFF)
      if (existingVote.type === voteType) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        return NextResponse.json({ message: "Vote removed" });
      }

      // Scenario B: They clicked the OPPOSITE vote button (Switch vote)
      const updatedVote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type: voteType },
      });
      return NextResponse.json(updatedVote);
    }

    // Scenario C: They have never voted on this post before (Create new)
    const newVote = await prisma.vote.create({
      data: {
        type: voteType,
        userId: userId,
        postId: postId,
      },
    });

    return NextResponse.json(newVote);

  } catch (error) {
    console.error("VOTE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}