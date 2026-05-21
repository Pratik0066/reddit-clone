import { create } from "zustand"

interface VoteState {
  postVotes: Record<string, { count: number; userVote: "UP" | "DOWN" | null }>
  commentVotes: Record<string, { count: number; userVote: "UP" | "DOWN" | null }>
  setPostVote: (postId: string, count: number, userVote: "UP" | "DOWN" | null) => void
  setCommentVote: (commentId: string, count: number, userVote: "UP" | "DOWN" | null) => void
}

export const useVoteStore = create<VoteState>((set) => ({
  postVotes: {},
  commentVotes: {},
  setPostVote: (postId, count, userVote) =>
    set((state) => ({
      postVotes: { ...state.postVotes, [postId]: { count, userVote } },
    })),
  setCommentVote: (commentId, count, userVote) =>
    set((state) => ({
      commentVotes: { ...state.commentVotes, [commentId]: { count, userVote } },
    })),
}))

interface SidebarState {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}))
