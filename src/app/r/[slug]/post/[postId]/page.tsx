import prisma from "@/lib/prisma"
import type { Metadata } from "next"
import PostCard from "@/components/PostCard"
import CommentForm from "@/components/CommentForm"
import ThreadedComment from "@/components/ThreadedComment"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import CommunitySidebar from "@/components/CommunitySidebar"
import type { ExtendedPost, CommentWithAuthor } from "@/lib/types"

interface PageProps {
  params: Promise<{ slug: string; postId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postId } = await params
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { title: true, community: { select: { name: true } } },
  })
  if (!post) return { title: "Post Not Found" }
  return {
    title: post.title,
    description: `View post in ${post.community?.name ? `r/${post.community.name}` : "Reddit"} — MYReddit`,
    openGraph: {
      title: post.title,
      description: `View post in ${post.community?.name ? `r/${post.community.name}` : "Reddit"}`,
    },
  }
}

function buildCommentTree(
  comments: CommentWithAuthor[]
): CommentWithAuthor[] {
  const map = new Map<string, CommentWithAuthor>()
  const roots: CommentWithAuthor[] = []

  comments.forEach((c) => {
    map.set(c.id, { ...c, replies: [] })
  })

  comments.forEach((c) => {
    const node = map.get(c.id)!
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = await params
  const { userId } = await auth()

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      community: {
        include: {
          _count: { select: { posts: true, members: true } },
        },
      },
      votes: true,
      savedBy: userId ? { where: { userId } } : false,
      _count: { select: { comments: true } },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              imageUrl: true,
              createdAt: true,
            },
          },
          votes: userId ? { where: { userId } } : false,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!post) {
    return notFound()
  }

  const commentTree = buildCommentTree(
    post.comments as unknown as CommentWithAuthor[]
  )

  return (
    <div className="flex gap-6 justify-center px-4 py-5 max-w-310 mx-auto min-h-screen bg-[#030303]">
      <div className="flex-1 min-w-0 max-w-160">
        <PostCard
          post={post as unknown as ExtendedPost}
          currentUserId={userId}
        />

        <div className="mt-2 border-t border-[#223237] pt-3">
          <h3 className="text-sm font-semibold text-[#d7dadc] mb-3 px-1">
            {post._count.comments} Comments
          </h3>

          <CommentForm postId={post.id} />

          <div className="mt-4">
            {commentTree.length === 0 ? (
              <p className="text-sm text-[#82959b] italic text-center py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              commentTree.map((comment) => (
                <ThreadedComment
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  currentUserId={userId}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <aside className="hidden xl:block w-78 shrink-0">
        {post.community && (
          <div className="sticky top-16">
            <CommunitySidebar
              name={post.community.name}
              slug={post.community.slug}
              description={post.community.description}
              createdAt={post.community.createdAt}
              postCount={post.community._count.posts}
              memberCount={post.community._count.members}
              icon={post.community.icon}
              banner={post.community.banner}
            />
          </div>
        )}
      </aside>
    </div>
  )
}
