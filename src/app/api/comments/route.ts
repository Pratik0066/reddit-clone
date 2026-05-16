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

    // 2. Parse the incoming data from the comment form
    const body = await req.json();
    const { text, postId } = body;

    // 3. Basic validation
    if (!text || text.trim().length === 0) {
      return new NextResponse("Comment text is required", { status: 400 });
    }

    if (!postId) {
      return new NextResponse("Post ID is required", { status: 400 });
    }

    // 4. Save the comment to the Supabase database
    const comment = await prisma.comment.create({
      data: {
        content: text, // <-- This tells Prisma to save 'text' into the 'content' column
        postId,
        authorId: userId, 
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("COMMENT_CREATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}