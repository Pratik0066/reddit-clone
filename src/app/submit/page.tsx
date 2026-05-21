import type { Metadata } from "next"
import CreatePostForm from "@/components/CreatePostForm"

export const metadata: Metadata = {
  title: "Create Post",
  description: "Create a new post on MYReddit",
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#030303] pt-4">
      <CreatePostForm />
    </div>
  )
}
