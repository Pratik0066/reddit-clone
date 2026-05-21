"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CommentFormProps {
  postId: string
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useUser()

  if (!user) {
    return (
      <div className="bg-[#1a282d]/50 border border-[#223237] rounded-lg p-4 text-center mb-4">
        <p className="text-sm text-[#82959b] mb-2">
          Log in or sign up to leave a comment
        </p>
        <SignInButton mode="modal">
          <Button size="sm" className="cursor-pointer">
            Log In
          </Button>
        </SignInButton>
      </div>
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, postId }),
      })

      if (!response.ok) throw new Error("Failed to post comment.")

      setText("")
      toast.success("Comment posted!")
      router.refresh()
    } catch (error) {
      toast.error("Failed to post comment")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-4">
      <div className="flex items-start gap-3">
        <div className="size-8 rounded-full bg-[#ff4500] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
          {user.firstName?.[0] || user.username?.[0] || "U"}
        </div>
        <div className="flex-1 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What are your thoughts?"
            rows={4}
            className="w-full p-3 bg-[#1a282d] border border-[#223237] rounded-lg text-sm outline-none focus:border-[#ff4500]/50 transition-colors text-[#d7dadc] placeholder:text-[#82959b] resize-y"
            disabled={loading}
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || text.trim().length === 0}
              size="sm"
            >
              {loading ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
