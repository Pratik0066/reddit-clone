"use client"

import type { Vote } from "@prisma/client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, BookmarkCheck, Trash2, MoreHorizontal } from "lucide-react"
import type { ExtendedPost } from "@/lib/types"
import { timeAgo, formatCount } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

interface PostCardProps {
  post: ExtendedPost
  currentUserId: string | null
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const { user } = useUser()

  const initialVoteCount = post.votes.reduce((total: number, vote: Vote) => {
    if (vote.type === "UP") return total + 1
    if (vote.type === "DOWN") return total - 1
    return total
  }, 0)

  const initialUserVote = post.votes.find(
    (vote: Vote) => vote.userId === currentUserId
  )?.type as "UP" | "DOWN" | null | undefined

  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(
    initialUserVote ?? null
  )
  const [saved, setSaved] = useState(
    post.savedBy ? post.savedBy.length > 0 : false
  )
  const [deleting, setDeleting] = useState(false)

  const handleVote = async (type: "UP" | "DOWN") => {
    if (!user) {
      toast.error("Sign in to vote")
      return
    }

    const prevVote = userVote
    const prevCount = voteCount

    if (userVote === type) {
      setVoteCount((prev) => (type === "UP" ? prev - 1 : prev + 1))
      setUserVote(null)
    } else {
      if (userVote === "UP" && type === "DOWN")
        setVoteCount((prev) => prev - 2)
      else if (userVote === "DOWN" && type === "UP")
        setVoteCount((prev) => prev + 2)
      else setVoteCount((prev) => (type === "UP" ? prev + 1 : prev - 1))
      setUserVote(type)
    }

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, voteType: type }),
      })
      if (!res.ok) throw new Error("Failed to vote")
    } catch {
      setVoteCount(prevCount)
      setUserVote(prevVote)
      toast.error("Failed to vote")
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error("Sign in to save posts")
      return
    }

    const prev = saved
    setSaved(!saved)

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      })
      if (!res.ok) throw new Error("Failed to save")
    } catch {
      setSaved(prev)
      toast.error("Failed to save post")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return
    setDeleting(true)
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Post deleted")
      window.location.reload()
    } catch {
      toast.error("Failed to delete post")
      setDeleting(false)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ url })
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      toast.success("Link copied!")
    } else {
      const ta = document.createElement("textarea")
      ta.value = url
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      toast.success("Link copied!")
    }
  }

  const commentCount = post._count?.comments ?? post.commentCount ?? 0

  const postUrl = post.community
    ? `/r/${post.community.slug}/post/${post.id}`
    : `/r/all/post/${post.id}`

  return (
    <div className={cn(
      "bg-[#030303] border border-[#223237] hover:border-[#34464c] rounded-2xl overflow-hidden transition-all duration-150",
      deleting && "opacity-50 pointer-events-none"
    )}>
      <div className="p-3 sm:p-4 space-y-2.5">
        
        {/* ── Header Metadata Row ── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#82959b]">
            {post.community && (
              <>
                {/* Simulated Subreddit Icon Avatar */}
                <div className="size-5 rounded-full bg-[#ff4500] flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                  {post.community.name[0]?.toUpperCase()}
                </div>
                <Link href={`/r/${post.community.slug}`} className="no-underline">
                  <span className="font-bold hover:underline text-[12px] text-white">
                    r/{post.community.name}
                  </span>
                </Link>
                <span className="text-[#82959b]/60">&bull;</span>
              </>
            )}
            <span className="text-[#82959b] text-[12px]">
              {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Action Join badge block wrapper */}
          <div className="flex items-center gap-2">
            <button type="button" className="bg-[#0045ac] hover:bg-[#003d96] text-white text-[12px] font-bold px-3 py-1 rounded-full transition-colors">
              Join
            </button>
            <button type="button" className="text-[#82959b] hover:text-white p-1 rounded-full">
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>

        {/* ── Post Content Title Area ── */}
        <Link href={postUrl} className="no-underline block group">
          <h2 className="text-base sm:text-[18px] font-semibold text-[#d7dadc] leading-snug group-hover:text-[#d7dadc]/80 transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* ── Optional Text Post Content Body ── */}
        {post.content && (
          <p className="text-sm text-[#82959b] whitespace-pre-wrap line-clamp-4 leading-relaxed">
            {post.content}
          </p>
        )}

        {/* ── Inline Core Post Image Area ── */}
        {post.imageUrl && (
          <Link href={postUrl} className="no-underline block">
            <div className="relative w-full rounded-xl overflow-hidden bg-[#000000] flex justify-center max-h-128 border border-[#223237]/50">
              <Image
                src={post.imageUrl}
                alt="Post media content"
                width={600}
                height={400}
                className="w-full object-contain max-h-128"
                sizes="(max-width: 768px) 100vw, 640px"
              />
            </div>
          </Link>
        )}

        {/* ── Horizontal Footer Action Controls Bar ── */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          
          {/* Universal Native Reddit Horizontal pill Voting widget */}
          <div className="flex items-center bg-[#223237] hover:bg-[#2d3f46] rounded-full h-8 px-1.5 transition-colors">
            <button
              onClick={() => handleVote("UP")}
              className={cn(
                "p-1 rounded-full transition-colors",
                userVote === "UP" ? "text-[#ff4500]" : "text-[#82959b] hover:text-white"
              )}
            >
              <ArrowBigUp className="size-4.5" />
            </button>
            
            <span className={cn(
              "text-[12px] font-bold px-1 tabular-nums min-w-5 text-center",
              userVote === "UP" && "text-[#ff4500]",
              userVote === "DOWN" && "text-[#4690ff]",
              userVote === null && "text-white"
            )}>
              {formatCount(voteCount)}
            </span>

            <button
              onClick={() => handleVote("DOWN")}
              className={cn(
                "p-1 rounded-full transition-colors",
                userVote === "DOWN" ? "text-[#4690ff]" : "text-[#82959b] hover:text-white"
              )}
            >
              <ArrowBigDown className="size-4.5" />
            </button>
          </div>

          {/* Comment Counters Pill Button */}
          <Link
            href={postUrl}
            className="flex items-center gap-1.5 bg-[#223237] hover:bg-[#2d3f46] h-8 px-3 rounded-full transition no-underline text-white text-[12px] font-medium"
          >
            <MessageSquare className="size-4 text-[#82959b]" />
            <span>{formatCount(commentCount)}</span>
          </Link>

          {/* Share Action Pill Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-[#223237] hover:bg-[#2d3f46] h-8 px-3 rounded-full transition text-white text-[12px] font-medium cursor-pointer"
          >
            <Share2 className="size-4 text-[#82959b]" />
            <span>Share</span>
          </button>

          {/* Save Action Companion Element */}
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 bg-[#223237] hover:bg-[#2d3f46] h-8 px-3 rounded-full transition text-[12px] font-medium cursor-pointer",
              saved ? "text-[#ff4500]" : "text-white"
            )}
          >
            {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4 text-[#82959b]" />}
            <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </button>

          {/* Personal Management Delete Command */}
          {currentUserId === post.authorId && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 bg-[#223237]/40 hover:bg-red-900/20 h-8 px-3 rounded-full transition text-[#82959b] hover:text-red-400 text-[12px] font-medium cursor-pointer"
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

        </div>

      </div>
    </div>
  )
}