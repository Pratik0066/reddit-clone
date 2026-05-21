"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import PostCard from "./PostCard"
import { fetchNextPosts } from "@/actions/post.action"
import { Loader2 } from "lucide-react"
import type { ExtendedPost } from "@/lib/types"

interface InfiniteFeedProps {
  initialPosts: ExtendedPost[]
  currentUserId: string | null
  sort?: string
}

export default function InfiniteScrollFeed({
  initialPosts,
  currentUserId,
  sort = "hot",
}: InfiniteFeedProps) {
  const [posts, setPosts] = useState<ExtendedPost[]>(initialPosts)
  const [cursor, setCursor] = useState<string | null>(
    initialPosts.length > 0 ? initialPosts[initialPosts.length - 1].id : null
  )
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const hasMoreRef = useRef(hasMore)
  const cursorRef = useRef(cursor)
  const loadingRef = useRef(loading)
  useEffect(() => { hasMoreRef.current = hasMore }, [hasMore])
  useEffect(() => { cursorRef.current = cursor }, [cursor])
  useEffect(() => { loadingRef.current = loading }, [loading])

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasMoreRef.current && !loadingRef.current && cursorRef.current) {
        setLoading(true)
        fetchNextPosts(cursorRef.current, sort).then((nextBatch) => {
          if (nextBatch.length > 0) {
            setPosts((prev) => [...prev, ...(nextBatch as ExtendedPost[])])
            setCursor(nextBatch[nextBatch.length - 1].id)
          }
          if (nextBatch.length < 5) setHasMore(false)
        }).catch(() => {
          console.error("Failed to load more")
        }).finally(() => {
          setLoading(false)
        })
      }
    },
  })

  if (posts.length === 0) {
    return (
      <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-10 text-center text-[#82959b] text-sm">
        <p className="font-medium">No posts yet</p>
        <p className="text-xs mt-1">Be the first to create one!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}

      {hasMore && (
        <div ref={ref} className="py-6 flex justify-center">
          {loading ? (
            <div className="flex items-center gap-2 text-[#82959b]">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Loading more posts...</span>
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="py-8 text-center text-[#82959b]">
          <p className="text-sm font-medium">
            You&apos;ve caught up! No more posts to show.
          </p>
        </div>
      )}
    </div>
  )
}
