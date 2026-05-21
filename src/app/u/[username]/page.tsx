import prisma from "@/lib/prisma"
import type { Metadata } from "next"
import PostCard from "@/components/PostCard"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { CalendarDays, Award, MessageSquare } from "lucide-react"
import Link from "next/link"
import type { ExtendedPost } from "@/lib/types"

interface PageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  return {
    title: `u/${username}`,
    description: `View u/${username}'s profile on MYReddit`,
    openGraph: {
      title: `u/${username}`,
      description: `View u/${username}'s profile`,
    },
  }
}

export default async function UserProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params
  const { tab } = await searchParams
  const { userId } = await auth()
  const activeTab = tab || "posts"

  const profileUser = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      imageUrl: true,
      createdAt: true,
      postKarma: true,
      commentKarma: true,
    },
  })

  if (!profileUser) {
    return notFound()
  }

  const totalKarma = profileUser.postKarma + profileUser.commentKarma

  const posts = activeTab === "saved"
    ? await prisma.savedPost.findMany({
        where: { userId: profileUser.id },
        include: {
          post: {
            include: {
              author: true,
              community: true,
              votes: true,
              _count: { select: { comments: true } },
            },
          },
        },
        orderBy: { savedAt: "desc" },
      })
    : await prisma.post.findMany({
        where: { authorId: profileUser.id },
        include: {
          author: true,
          community: true,
          votes: true,
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      })

  const comments = await prisma.comment.findMany({
    where: { authorId: profileUser.id },
    include: {
      post: { select: { id: true, title: true, community: { select: { slug: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const isOwnProfile = userId === profileUser.id

  return (
    <div className="flex gap-6 justify-center px-4 py-5 max-w-310 mx-auto min-h-screen bg-[#030303]">
      <div className="flex-1 min-w-0 max-w-160">
        <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-4">
            {profileUser.imageUrl ? (
              <img
                src={profileUser.imageUrl}
                alt=""
                className="size-16 rounded-full bg-[#1a282d]"
              />
            ) : (
              <div className="size-16 rounded-full bg-[#ff4500] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {profileUser.username[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-[#d7dadc]">
                u/{profileUser.username}
              </h1>
              <div className="flex items-center gap-3 text-sm text-[#82959b] mt-1">
                <span className="flex items-center gap-1">
                  <Award className="size-3.5" />
                  {totalKarma} karma
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  Joined{" "}
                  {new Date(profileUser.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3 border-b border-[#223237]">
          <Link
            href={`/u/${username}`}
            className={`text-sm font-medium px-3 py-2 border-b-2 transition no-underline ${
              activeTab === "posts"
                ? "text-[#d7dadc] border-[#ff4500]"
                : "text-[#82959b] hover:text-[#d7dadc] border-transparent"
            }`}
          >
            Posts
          </Link>
          <Link
            href={`/u/${username}?tab=comments`}
            className={`text-sm font-medium px-3 py-2 border-b-2 transition no-underline ${
              activeTab === "comments"
                ? "text-[#d7dadc] border-[#ff4500]"
                : "text-[#82959b] hover:text-[#d7dadc] border-transparent"
            }`}
          >
            Comments
          </Link>
          {isOwnProfile && (
            <Link
              href={`/u/${username}?tab=saved`}
              className={`text-sm font-medium px-3 py-2 border-b-2 transition no-underline ${
                activeTab === "saved"
                  ? "text-[#d7dadc] border-[#ff4500]"
                  : "text-[#82959b] hover:text-[#d7dadc] border-transparent"
              }`}
            >
              Saved
            </Link>
          )}
        </div>

        {activeTab === "comments" ? (
          comments.length === 0 ? (
            <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-10 text-center text-[#82959b] text-sm">
              No comments yet.
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="border-b border-[#223237] py-3 px-1">
                  <div className="flex items-center gap-1 text-xs text-[#82959b] mb-1">
                    <MessageSquare className="size-3" />
                    {c.post.community && (
                      <>
                        <Link href={`/r/${c.post.community.slug}`} className="hover:underline no-underline text-[#82959b]">
                          r/{c.post.community.name}
                        </Link>
                        <span>·</span>
                      </>
                    )}
                    <Link href={`/r/${c.post.community?.slug || "all"}/post/${c.post.id}`} className="hover:underline no-underline text-[#82959b]">
                      {c.post.title}
                    </Link>
                  </div>
                  <p className="text-sm text-[#d7dadc] line-clamp-2">{c.content}</p>
                </div>
              ))}
            </div>
          )
        ) : posts.length === 0 ? (
          <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-10 text-center text-[#82959b] text-sm">
            {activeTab === "saved"
              ? "No saved posts yet."
              : "This user hasn't posted anything yet."}
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map((item) => {
              const post = activeTab === "saved"
                ? (item as { post: ExtendedPost }).post
                : (item as ExtendedPost)
              return (
                <PostCard
                  key={post.id}
                  post={post as unknown as ExtendedPost}
                  currentUserId={userId}
                />
              )
            })}
          </div>
        )}
      </div>

      <aside className="hidden xl:block w-78 shrink-0">
        <div className="bg-[#1a282d] border border-[#223237] rounded-2xl overflow-hidden sticky top-16">
          <div className="h-16 bg-gradient-to-r from-[#ff4500]/60 to-[#ff4500]/20" />
          <div className="p-4">
            <div className="-mt-10 mb-3">
              {profileUser.imageUrl ? (
                <img
                  src={profileUser.imageUrl}
                  alt=""
                  className="size-12 rounded-xl border-4 border-[#030303] bg-[#030303]"
                />
              ) : (
                <div className="size-12 rounded-xl border-4 border-[#030303] bg-[#ff4500] flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {profileUser.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="text-lg font-bold text-[#d7dadc] mb-1">
              u/{profileUser.username}
            </h2>
            <div className="space-y-2 text-sm text-[#82959b]">
              <p>
                <span className="font-semibold text-[#d7dadc]">{totalKarma}</span> Karma
              </p>
              <p>
                Joined{" "}
                {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
