import prisma from "@/lib/prisma";
import PostCard from "@/components/PostCard";
import FeedSorter from "@/components/FeedSorter"; // <-- 1. Import the new Sorter
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

// 2. Tell Next.js to expect search parameters in the URL
interface PageProps {
  searchParams: Promise<{
    sort?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { sort } = await searchParams;
  const { userId } = await auth();

  // 3. Fetch all posts with their votes
  let posts = await prisma.post.findMany({
    include: {
      author: true,
      community: true,
      votes: true,
    },
    // We default to sorting by newest at the database level
    orderBy: {
      createdAt: "desc",
    },
  });

  // 4. The Sorting Engine
  if (sort === "top") {
    posts = posts.sort((a, b) => {
      // Calculate total score for Post A
      const scoreA = a.votes.reduce((total, vote) => {
        if (vote.type === "UP") return total + 1;
        if (vote.type === "DOWN") return total - 1;
        return total;
      }, 0);

      // Calculate total score for Post B
      const scoreB = b.votes.reduce((total, vote) => {
        if (vote.type === "UP") return total + 1;
        if (vote.type === "DOWN") return total - 1;
        return total;
      }, 0);

      // Sort highest score to the top
      return scoreB - scoreA;
    });
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 flex flex-col md:flex-row gap-6">
      
      {/* Main Feed Column */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        
        {/* Inject the Interactive UI Sorter here! */}
        <FeedSorter />
        
        {posts.length === 0 ? (
          <div className="bg-white p-10 rounded-lg border border-gray-200 text-center text-gray-500">
            No posts yet. Go create a community and start the conversation!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={userId} />
          ))
        )}
      </div>

      {/* Sidebar Column (Notice the sticky positioning for responsive desktop polish!) */}
      <div className="hidden md:block w-1/3">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm sticky top-24">
          <h2 className="font-bold text-gray-900 mb-2 border-b pb-2">Home</h2>
          <p className="text-sm text-gray-600 mb-4 mt-2">
            Your personal RedditClone frontpage. Come here to check in with your favorite communities and see what&apos;s trending.
          </p>
          <Link 
            href="/r/create"
            className="block w-full text-center bg-orange-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-orange-600 transition mb-2"
          >
            Create Community
          </Link>
        </div>
      </div>

    </div>
  );
}