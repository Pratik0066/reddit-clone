import prisma from "@/lib/prisma"
import Link from "next/link"
import type { Metadata } from "next"
import PostCard from "@/components/PostCard"
import CommunitySidebar from "@/components/CommunitySidebar"
import { Button } from "@/components/ui/button"
import type { ExtendedPost } from "@/lib/types"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const community = await prisma.community.findUnique({ where: { slug } })
  if (!community) return { title: "Community Not Found" }
  return {
    title: `r/${community.name}`,
    description: community.description || `Browse r/${community.name} — MYReddit`,
    openGraph: {
      title: `r/${community.name}`,
      description: community.description || `Browse r/${community.name}`,
    },
  }
}

export default async function CommunityPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { sort } = await searchParams
  const { userId } = await auth()

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      _count: { select: { posts: true, members: true } },
    },
  })

  if (!community) {
    notFound()
  }

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" }
  if (sort === "top") orderBy = { commentCount: "desc" }
  else if (sort === "hot") orderBy = { createdAt: "desc" }

  const posts = await prisma.post.findMany({
    where: { communityId: community.id },
    orderBy,
    include: {
      author: true,
      community: true,
      votes: true,
      _count: { select: { comments: true } },
    },
  })

  return (
    <div className="min-h-screen bg-[#030303]">
      <div className="h-24 bg-linear-to-r from-[#ff4500]/60 to-[#ff5d1a]/20">
        {community.banner && (
          <img
            src={community.banner}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="max-w-310 mx-auto px-4">
        <div className="flex items-end gap-4 -mt-10 mb-4">
          {community.icon ? (
            <img
              src={community.icon}
              alt=""
              className="size-20 rounded-full border-4 border-[#030303] bg-[#030303]"
            />
          ) : (
            <div className="size-20 rounded-full border-4 border-[#030303] bg-[#ff4500] flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {community.name[0]?.toUpperCase()}
            </div>
          )}
          <div className="pb-2">
            <h1 className="text-2xl font-bold text-[#d7dadc]">
              r/{community.name}
            </h1>
          </div>
        </div>

        <div className="flex gap-6 justify-center">
          <div className="flex-1 min-w-0 max-w-160">
            <div className="flex items-center gap-2 mb-4 border-b border-[#223237] pb-3">
              <div className="flex items-center gap-1">
                {["hot", "new", "top"].map((s) => (
                  <Link
                    key={s}
                    href={`/r/${slug}${s !== "hot" ? `?sort=${s}` : ""}`}
                    className={`text-sm font-medium px-3 py-1.5 rounded-full transition no-underline ${
                      (sort || "hot") === s
                        ? "bg-[#1a282d] text-[#d7dadc]"
                        : "text-[#82959b] hover:text-[#d7dadc] hover:bg-[#1a282d]/50"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Link>
                ))}
              </div>
              <div className="flex-1" />
              <Link
                href={`/r/${community.slug}/submit`}
                className="no-underline hover:no-underline"
              >
                <Button size="sm" className="bg-[#ff4500] hover:bg-[#e03d00] text-white rounded-full text-xs font-semibold h-8">Create Post</Button>
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-10 text-center text-[#82959b] text-sm">
                There are no posts here yet. Be the first to create one!
              </div>
            ) : (
              <div className="flex flex-col">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post as unknown as ExtendedPost}
                    currentUserId={userId}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="hidden xl:block w-78 shrink-0">
            <div className="sticky top-16">
              <CommunitySidebar
                name={community.name}
                slug={community.slug}
                description={community.description}
                createdAt={community.createdAt}
                postCount={community._count.posts}
                memberCount={community._count.members}
                icon={community.icon}
                banner={community.banner}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
