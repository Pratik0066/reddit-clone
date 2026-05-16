import prisma from "@/lib/prisma";
import PostCard from "@/components/PostCard";
import CommentForm from "@/components/CommentForm";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{
    slug: string;
    postId: string;
  }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = await params;
  const { userId } = await auth();

  // 1. Fetch the exact post clicked by the user
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      community: true,
      votes: true, 
      comments: {
        include: { author: true }, // We need the author so we can show their username
        orderBy: { createdAt: "desc" }, // Show the newest comments at the top
      },
    },
  });

  // If someone types a random post ID in the URL, throw a 404
  if (!post) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      {/* 1. Render the main post using your existing component */}
      <PostCard post={post} currentUserId={userId} />

      {/* 2. The Comment Section Container */}
      <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Comments</h3>

        {/* The Interactive Form */}
        <CommentForm postId={post.id} />

        {/* The Comment Feed */}
        <div className="space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-sm text-gray-900">
                    u/{comment.author.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    • {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric"
                      })}
                  </span>
                </div>
                <p className="text-gray-800 text-sm whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}