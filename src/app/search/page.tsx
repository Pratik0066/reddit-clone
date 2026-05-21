import prisma from "@/lib/prisma"
import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import PostCard from "@/components/PostCard"
import Link from "next/link"
import { Search } from "lucide-react"
import type { ExtendedPost } from "@/lib/types"

export const metadata: Metadata = {
  title: "Search",
  description: "Search posts and communities on MYReddit",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { userId } = await auth()
  const { q } = await searchParams

  if (!q || q.trim().length === 0) {
    return (
      <div className="px-4 py-8 max-w-310 mx-auto">
        <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-8 text-center">
          <Search className="size-12 text-[#82959b] mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#d7dadc] mb-2">Search</h1>
          <p className="text-sm text-[#82959b]">
            Enter a search term to find posts and communities.
          </p>
        </div>
      </div>
    )
  }

  const posts = (await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      author: true,
      community: true,
      votes: true,
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  })) as unknown as ExtendedPost[]

  const communities = await prisma.community.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      _count: { select: { posts: true, members: true } },
    },
    take: 5,
  })

  return (
    <div className="flex gap-6 justify-center px-4 py-5 max-w-310 mx-auto min-h-screen bg-[#030303]">
      <div className="flex-1 min-w-0 max-w-160">
        <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-4 mb-4">
          <h1 className="text-lg font-bold text-[#d7dadc]">
            Results for &ldquo;{q}&rdquo;
          </h1>
          <p className="text-sm text-[#82959b]">
            {posts.length} posts found
          </p>
        </div>

        {communities.length > 0 && (
          <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-4 mb-4">
            <h2 className="text-sm font-semibold text-[#d7dadc] mb-3">
              Communities
            </h2>
            <div className="space-y-2">
              {communities.map((c) => (
                <Link
                  key={c.id}
                  href={`/r/${c.slug}`}
                  className="flex items-center gap-3 no-underline hover:no-underline p-2 rounded-lg hover:bg-[#1a282d] transition"
                >
                  <div className="size-8 rounded-full bg-[#ff4500] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#d7dadc]">
                      r/{c.name}
                    </p>
                    <p className="text-xs text-[#82959b]">
                      {c._count.posts} posts · {c._count.members} members
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-10 text-center text-[#82959b] text-sm">
            No posts found. Try a different search term.
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={userId} />
            ))}
          </div>
        )}
      </div>

      <aside className="hidden xl:block w-78 shrink-0">
        <div className="bg-[#1a282d] border border-[#223237] rounded-2xl overflow-hidden sticky top-16">
          <div className="h-16 bg-gradient-to-r from-[#ff4500]/60 to-[#ff4500]/20" />
          <div className="p-4">
            <div className="-mt-10 mb-3">
              <div className="size-12 rounded-xl border-4 border-[#030303] bg-[#ff4500] flex items-center justify-center text-white shadow-lg">
                <Search className="size-6" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-[#d7dadc] mb-1">
              Search Results
            </h2>
            <p className="text-sm text-[#82959b]">
              Showing results for &ldquo;{q}&rdquo;
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
