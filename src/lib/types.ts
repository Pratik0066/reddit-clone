import type { Post, User, Community, Vote, CommentVote, SavedPost } from "@prisma/client"

export type ExtendedPost = Post & {
  author: User
  community: Community | null
  votes: Vote[]
  _count?: { comments: number }
  savedBy?: SavedPost[]
}

export interface CommentWithAuthor {
  id: string
  content: string
  voteCount: number
  createdAt: Date
  author: Pick<User, "id" | "username" | "imageUrl" | "createdAt">
  parentId: string | null
  replies: CommentWithAuthor[]
  votes?: CommentVote[]
}
