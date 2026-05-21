"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Reply, ChevronDown, ChevronRight, ArrowBigUp, ArrowBigDown } from "lucide-react"
import { timeAgo, formatCount } from "@/lib/utils"
import type { CommentWithAuthor } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ThreadedCommentProps {
  comment: CommentWithAuthor
  postId: string
  depth?: number
  currentUserId?: string | null
}

export default function ThreadedComment({
  comment,
  postId,
  depth = 0,
  currentUserId,
}: ThreadedCommentProps) {
  const { user } = useUser()
  const router = useRouter()
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const initialVote = comment.votes?.find(
    (v) => v.userId === currentUserId
  )?.type as "UP" | "DOWN" | null | undefined

  const [voteCount, setVoteCount] = useState(comment.voteCount)
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(
    initialVote ?? null
  )

  const handleVote = async (type: "UP" | "DOWN") => {
    if (!user) {
      toast.error("Sign in to vote")
      return
    }

    const prevVote = userVote
    const prevCount = voteCount

    if (userVote === type) {
      setVoteCount((p) => (type === "UP" ? p - 1 : p + 1))
      setUserVote(null)
    } else {
      if (userVote === "UP" && type === "DOWN") setVoteCount((p) => p - 2)
      else if (userVote === "DOWN" && type === "UP") setVoteCount((p) => p + 2)
      else setVoteCount((p) => (type === "UP" ? p + 1 : p - 1))
      setUserVote(type)
    }

    try {
      const res = await fetch("/api/comment-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id, voteType: type }),
      })
      if (!res.ok) throw new Error("Failed to vote")
      const data = await res.json()
      setVoteCount(data.voteCount)
    } catch {
      setVoteCount(prevCount)
      setUserVote(prevVote)
      toast.error("Failed to vote")
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText, postId, parentId: comment.id }),
      })

      if (res.ok) {
        setReplyText("")
        setShowReply(false)
        toast.success("Reply posted!")
        router.refresh()
      } else {
        toast.error("Failed to reply")
      }
    } catch {
      toast.error("Failed to reply")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={
        depth > 0 ? "ml-6 pl-4 border-l border-[#223237]" : ""
      }
    >
      <div className="py-1.5">
        <div className="flex items-start gap-1">
          <div className="flex flex-col items-center gap-0.5 pt-1 w-6 shrink-0">
            <button
              onClick={() => handleVote("UP")}
              className={cn(
                "p-0.5 rounded transition cursor-pointer",
                userVote === "UP"
                  ? "text-[#ff4500]"
                  : "text-[#82959b] hover:text-[#ff4500]"
              )}
            >
              <ArrowBigUp className="size-4" />
            </button>
            <span
              className={cn(
                "text-[10px] font-bold leading-none",
                userVote === "UP" && "text-[#ff4500]",
                userVote === "DOWN" && "text-blue-500",
                userVote === null && "text-[#82959b]"
              )}
            >
              {formatCount(voteCount)}
            </span>
            <button
              onClick={() => handleVote("DOWN")}
              className={cn(
                "p-0.5 rounded transition cursor-pointer",
                userVote === "DOWN"
                  ? "text-blue-500"
                  : "text-[#82959b] hover:text-blue-500"
              )}
            >
              <ArrowBigDown className="size-4" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs mb-0.5">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-0.5 text-[#82959b] hover:text-[#d7dadc] transition cursor-pointer"
              >
                {collapsed ? (
                  <ChevronRight className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>
              {comment.author.imageUrl ? (
                <img src={comment.author.imageUrl} alt="" className="size-5 rounded-full" />
              ) : (
                <div className="size-5 rounded-full bg-[#ff4500]/10 flex items-center justify-center text-[#ff4500] text-[8px] font-bold shrink-0">
                  {comment.author.username[0]?.toUpperCase()}
                </div>
              )}
              <Link
                href={`/u/${comment.author.username}`}
                className="font-medium text-[#d7dadc] hover:text-[#ff4500] hover:underline no-underline"
              >
                u/{comment.author.username}
              </Link>
              <span className="text-[#82959b]">
                {timeAgo(comment.createdAt)}
              </span>
            </div>

            {!collapsed && (
              <>
                <p className="text-sm text-[#d7dadc] whitespace-pre-wrap mb-1.5 ml-5">
                  {comment.content}
                </p>
                <div className="flex items-center gap-2 text-xs ml-5">
                  {user ? (
                    <button
                      onClick={() => setShowReply(!showReply)}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1a282d] transition cursor-pointer text-[#82959b]"
                    >
                      <Reply className="size-3.5" />
                      Reply
                    </button>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1a282d] transition cursor-pointer text-[#82959b]">
                        <Reply className="size-3.5" />
                        Reply
                      </button>
                    </SignInButton>
                  )}
                </div>

                {showReply && (
                  <form onSubmit={handleReplySubmit} className="mt-2 ml-5 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="What are your thoughts?"
                      rows={3}
                      className="w-full p-2 bg-[#1a282d] border border-[#223237] rounded-lg text-sm outline-none focus:border-[#ff4500]/50 transition-colors text-[#d7dadc] placeholder:text-[#82959b] resize-y"
                      disabled={loading}
                      required
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={loading || !replyText.trim()}
                        size="sm"
                      >
                        {loading ? "Posting..." : "Reply"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowReply(false)
                          setReplyText("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {comment.replies?.map((reply) => (
                  <ThreadedComment
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    depth={depth + 1}
                    currentUserId={currentUserId}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
