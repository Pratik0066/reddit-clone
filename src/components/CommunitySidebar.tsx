"use client"

import Link from "next/link"
import { CalendarDays, MessageSquare, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

interface CommunitySidebarProps {
  name: string
  slug: string
  description: string
  createdAt: Date
  postCount: number
  memberCount?: number
  icon?: string | null
  banner?: string | null
}

export default function CommunitySidebar({
  name,
  slug,
  description,
  createdAt,
  postCount,
  memberCount,
  icon,
}: CommunitySidebarProps) {
  const { user } = useUser()
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/api/community/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setJoined(data.isJoined)
        }
      } catch {}
    }
    if (user) check()
  }, [user, slug])

  const handleJoin = async () => {
    if (!user) {
      toast.error("Sign in to join communities")
      return
    }
    setLoading(true)
    const prev = joined
    setJoined(!joined)
    try {
      const res = await fetch("/api/community/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: slug }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setJoined(prev)
      toast.error("Failed to join community")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1a282d] border border-[#223237] rounded-2xl overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-[#ff4500]/80 to-[#ff4500]/40" />
      <div className="px-3 pb-3">
        <div className="-mt-10 mb-2 flex items-end gap-2">
          {icon ? (
            <img
              src={icon}
              alt=""
              className="size-16 rounded-full border-4 border-[#030303] bg-[#030303]"
            />
          ) : (
            <div className="size-16 rounded-full border-4 border-[#030303] bg-[#ff4500] flex items-center justify-center text-white text-xl font-bold shrink-0">
              {name[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <Link
          href={`/r/${slug}`}
          className="text-base font-bold text-[#d7dadc] hover:text-[#ff4500] no-underline"
        >
          r/{name}
        </Link>

        <div className="mt-2 space-y-2">
          {description && (
            <p className="text-xs text-[#82959b] leading-relaxed">{description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-[#82959b]">
            <div className="flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              <span className="font-semibold text-[#d7dadc]">{postCount}</span>
              <span>posts</span>
            </div>
            {memberCount !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="size-3.5" />
                <span className="font-semibold text-[#d7dadc]">{memberCount}</span>
                <span>members</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-[#82959b]">
            <CalendarDays className="size-3.5" />
            <span>
              Created{" "}
              {new Date(createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleJoin}
              variant={joined ? "outline" : "default"}
              size="sm"
              className={joined ? "gap-1.5" : "gap-1.5 flex-1"}
              disabled={loading}
            >
              {joined ? (
                <><Check className="size-3.5" /> Joined</>
              ) : (
                "Join"
              )}
            </Button>
            <Link
              href={`/r/${slug}/submit`}
              className="block no-underline hover:no-underline flex-1"
            >
              <Button className="w-full" size="sm">Create Post</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
