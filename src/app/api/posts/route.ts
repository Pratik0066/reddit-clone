import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 1. Check if the user is logged in
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse the incoming form data
    const body = await req.json();
    const { title, content, communityId } = body;

    // 3. Basic validation
    if (!title || title.trim().length === 0) {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (!communityId) {
      return new NextResponse("Community ID is required", { status: 400 });
    }

    // 4. Save the post to the Supabase database
    const post = await prisma.post.create({
      data: {
        title,
        content,
        communityId,
        authorId: userId, // This links the post to the logged-in Clerk user!
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST_CREATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}