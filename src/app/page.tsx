import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import FeedSorter from "@/components/FeedSorter"
import InfiniteScrollFeed from "@/components/InfiniteScrollFeed"
import Link from "next/link"
import { Globe, TrendingUp, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ExtendedPost } from "@/lib/types"
import type { Prisma } from "@prisma/client"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Home",
  description: "Your personal Reddit frontpage. Come here to check in with your favorite communities.",
  openGraph: {
    title: "Home — MYReddit",
    description: "Your personal Reddit frontpage.",
  },
})

function getTopCommunities() {
  return prisma.community.findMany({
    orderBy: { posts: { _count: "desc" } },
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { posts: true, members: true } },
    },
  })
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { userId } = await auth()
  const resolvedParams = await searchParams
  const sort = resolvedParams.sort || "hot"

  let orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: "desc" }

  switch (sort) {
    case "top":
      orderBy = { votes: { _count: "desc" } }
      break
    case "hot":
      orderBy = { createdAt: "desc" }
      break
  }

  const [initialPosts, topCommunities] = await Promise.all([
    prisma.post.findMany({
      take: 5,
      orderBy,
      include: {
        author: true,
        community: true,
        votes: true,
        _count: { select: { comments: true } },
      },
    }) as unknown as ExtendedPost[],
    getTopCommunities(),
  ])

  return (
    <div className="flex gap-6 justify-center px-4 py-5 max-w-310 mx-auto min-h-screen bg-[#030303]">
      {/* ── Left/Main content feed ── */}
      <div className="flex-1 max-w-160 space-y-4">
        <FeedSorter />
        <InfiniteScrollFeed
          initialPosts={initialPosts}
          currentUserId={userId}
          sort={sort}
        />
      </div>

      {/* ── Right side sticky companion column ── */}
      <aside className="hidden xl:block w-78 shrink-0">
        <div className="space-y-4 sticky top-18">
          {/* General Platform Home Hub Card */}
          <div className="bg-[#1a282d] border border-[#223237] rounded-2xl overflow-hidden">
            <div className="h-14 bg-linear-to-r from-[#ff4500]/60 to-[#ff5d1a]/20" />
            <div className="p-4">
              <div className="-mt-10 mb-3">
                <div className="size-11 rounded-full border-4 border-[#1a282d] bg-[#ff4500] flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="size-5" />
                </div>
              </div>
              <h2 className="text-[16px] font-semibold text-[#d7dadc] mb-1">Home</h2>
              <p className="text-xs text-[#82959b] leading-relaxed mb-4">
                Your personal Reddit frontpage. Come here to check in with your
                favorite communities.
              </p>
              <div className="space-y-2">
                <Link
                  href="/communities"
                  className="block no-underline hover:no-underline"
                >
                  <Button variant="outline" className="w-full gap-2 bg-transparent text-[#d7dadc] border-[#34464c] hover:bg-[#223237] hover:text-white rounded-full text-xs font-semibold h-8">
                    <Globe className="size-3.5" />
                    All Communities
                  </Button>
                </Link>
                <Link
                  href="/r/create"
                  className="block no-underline hover:no-underline"
                >
                  <Button className="w-full bg-[#ff4500] hover:bg-[#e03d00] text-white rounded-full text-xs font-semibold h-8 transition-colors">
                    Create Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Dynamic Top Communities Panel Box list */}
          {topCommunities.length > 0 && (
            <div className="bg-[#1a282d] border border-[#223237] rounded-2xl overflow-hidden">
              <div className="p-4">
                <h3 className="text-xs font-bold tracking-wider uppercase text-[#82959b] mb-3 flex items-center gap-2">
                  <TrendingUp className="size-3.5 text-[#ff4500]" />
                  Top Communities
                </h3>
                <div className="divide-y divide-[#223237]/50">
                  {topCommunities.map((c, i) => (
                    <Link
                      key={c.id}
                      href={`/r/${c.slug}`}
                      className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 group no-underline hover:no-underline"
                    >
                      <span className="text-xs font-bold text-[#82959b] w-4 text-center tabular-nums">
                        {i + 1}
                      </span>
                      <div className="size-7 rounded-full bg-[#ff4500]/10 flex items-center justify-center text-[#ff4500] text-xs font-bold shrink-0">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#d7dadc] group-hover:text-white truncate transition-colors">
                          r/{c.name}
                        </p>
                        <p className="text-[11px] text-[#82959b] truncate">
                          {c._count.posts} posts &middot; {c._count.members} members
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}