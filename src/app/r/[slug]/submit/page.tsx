import prisma from "@/lib/prisma"
import type { Metadata } from "next"
import { ensureUser } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import CreatePostForm from "@/components/CreatePostForm"
import { ArrowLeft } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Create Post — r/${slug}`,
    description: `Create a new post in r/${slug}`,
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function SubmitPostPage({ params }: PageProps) {
  const { slug } = await params
  const user = await ensureUser()

  if (!user) {
    return redirect("/")
  }

  const community = await prisma.community.findUnique({
    where: { slug },
  })

  if (!community) {
    return notFound()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen bg-[#030303]">
      <div className="mb-4">
        <Link
          href={`/r/${community.slug}`}
          className="inline-flex items-center gap-1 text-sm text-[#82959b] hover:text-[#d7dadc] no-underline hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to r/{community.name}
        </Link>
        <h1 className="text-xl font-bold text-[#d7dadc] mt-2">
          Create a post in r/{community.name}
        </h1>
      </div>

      <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-5">
        <CreatePostForm communityId={community.id} communityName={community.name} />
      </div>
    </div>
  )
}
