import prisma from "@/lib/prisma"
import type { Metadata } from "next"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Communities",
  description: "Browse all communities on MYReddit",
  openGraph: {
    title: "Communities — MYReddit",
    description: "Browse all communities on MYReddit",
  },
}

export default async function CommunitiesPage() {
  const communities = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { posts: true, members: true } },
    },
  })

  return (
    <div className="px-4 py-6 max-w-310 mx-auto min-h-screen bg-[#030303]">
      <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-5 mb-6">
        <h1 className="text-xl font-bold text-[#d7dadc] mb-1">
          All Communities
        </h1>
        <p className="text-sm text-[#82959b]">
          Browse all communities on Reddit
        </p>
      </div>

      {communities.length === 0 ? (
        <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-10 text-center text-[#82959b]">
          <MessageCircle className="size-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No communities yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => (
            <Link
              key={community.id}
              href={`/r/${community.slug}`}
              className="bg-[#1a282d] border border-[#223237] rounded-2xl p-4 transition-all duration-200 hover:bg-[#1a282d]/80 hover:border-[#ff4500]/30 no-underline hover:no-underline"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full bg-[#ff4500] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {community.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-[#d7dadc] truncate">
                    r/{community.name}
                  </h2>
                </div>
              </div>
              {community.description && (
                <p className="text-xs text-[#82959b] line-clamp-2 mb-3">
                  {community.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-[#82959b]">
                <span className="flex items-center gap-1">
                  <MessageCircle className="size-3.5" />
                  {community._count.posts} posts
                </span>
                <span className="flex items-center gap-1">
                  {community._count.members} members
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
