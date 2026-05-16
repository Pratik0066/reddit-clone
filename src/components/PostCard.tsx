"use client"; // This tells Next.js this file needs React interactivity!

import { Post, User, Community, Vote } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";

interface PostCardProps {
  post: Post & { 
    author: User;
    community?: Community; 
    votes: Vote[]; // <-- Tell TypeScript to expect an array of votes
  };
  currentUserId: string | null; // <-- Accept the Clerk user ID
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  // 1. Calculate the starting total score (Upvotes minus Downvotes)
  const initialVoteCount = post.votes.reduce((total, vote) => {
    if (vote.type === "UP") return total + 1;
    if (vote.type === "DOWN") return total - 1;
    return total;
  }, 0);

  // 2. Check if the logged-in user has already voted on this post
  const initialUserVote = post.votes.find((vote) => vote.userId === currentUserId)?.type || null;

  // 3. Set our starting state to the true database values instead of 0
  const [voteCount, setVoteCount] = useState(initialVoteCount); 
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(initialUserVote as "UP" | "DOWN" | null);

  const handleVote = async (type: "UP" | "DOWN") => {
    // 1. Calculate the new visual state instantly
    if (userVote === type) {
      // Clicking the same button removes the vote
      setVoteCount((prev) => (type === "UP" ? prev - 1 : prev + 1));
      setUserVote(null);
    } else {
      // Switching votes or casting a brand new vote
      if (userVote === "UP" && type === "DOWN") setVoteCount((prev) => prev - 2);
      else if (userVote === "DOWN" && type === "UP") setVoteCount((prev) => prev + 2);
      else setVoteCount((prev) => (type === "UP" ? prev + 1 : prev - 1));

      setUserVote(type);
    }

    // 2. Send the request to our backend API to save it permanently
    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          voteType: type,
        }),
      });
    } catch (error) {
      console.error("Failed to vote:", error);
      // If it fails, you would ideally revert the visual state here
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition hover:border-gray-300">
      {/* Post Metadata (Community, Author & Date) */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        {post.community && (
          <>
            <span className="font-bold text-gray-900 hover:underline cursor-pointer">
              r/{post.community.name}
            </span>
            <span>•</span>
          </>
        )}
        <span className="font-medium text-gray-700 hover:underline cursor-pointer">
          u/{post.author.username}
        </span>
        <span>•</span>
        <span>
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Post Title */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2 wrap-break-word">
        {post.title}
      </h2>

      {/* Post Content */}
      {post.content && (
        <p className="text-gray-700 text-sm whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Interactive Voting Bar */}
      <div className="flex items-center gap-4 mt-4 text-xs font-bold text-gray-500">
        <div className="flex items-center bg-gray-100 rounded-full border border-gray-200">
          {/* Upvote Button */}
          <button 
            onClick={() => handleVote("UP")}
            className={`p-1.5 px-2 rounded-l-full hover:bg-gray-200 transition ${userVote === "UP" ? "text-orange-500" : ""}`}
          >
            ⬆
          </button>
          
          {/* Total Score */}
          <span className={`px-2 ${userVote === "UP" ? "text-orange-500" : userVote === "DOWN" ? "text-blue-500" : "text-gray-700"}`}>
            {voteCount}
          </span>
          
          {/* Downvote Button */}
          <button 
            onClick={() => handleVote("DOWN")}
            className={`p-1.5 px-2 rounded-r-full hover:bg-gray-200 transition ${userVote === "DOWN" ? "text-blue-500" : ""}`}
          >
            ⬇
          </button>
        </div>

        {/* Comments Button (Static for now) */}
       {/* Real Comments Link */}
        <Link 
          href={`/r/${post.community?.slug}/post/${post.id}`}
          className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1.5 px-3 rounded-full border border-transparent transition"
        >
          <span>💬 Comments</span>
        </Link>
      </div>
    </div>
  );
}