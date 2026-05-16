import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 1. Check if the user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse the request body (like req.body in Express)
    const body = await req.json();
    const { name } = body;

    if (!name || name.length < 3) {
      return new NextResponse("Community name must be at least 3 characters", { status: 400 });
    }

    // 3. Create a URL-friendly slug (e.g., "NextJS Devs" -> "nextjs-devs")
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // 4. Check if a community with this name already exists
    const existingCommunity = await prisma.community.findUnique({
      where: { name },
    });

    if (existingCommunity) {
      return new NextResponse("Community already exists", { status: 409 });
    }

    // 5. Save to Supabase using Prisma
    const community = await prisma.community.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json(community);
  } catch (error) {
    console.error("COMMUNITY_POST_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}