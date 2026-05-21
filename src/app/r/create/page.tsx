"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function CreateCommunityPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(errorMessage)
      }

      const community = await response.json()
      toast.success("Community created!")
      router.push(`/r/${community.slug}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-[#1a282d] border border-[#223237] rounded-2xl p-6">
          <h1 className="text-xl font-bold text-[#d7dadc] mb-1">
            Create a Community
          </h1>
          <p className="text-sm text-[#82959b] mb-6">
            Choose a name for your community. You can add a description later.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#d7dadc]">
                Name
              </label>
              <p className="text-xs text-[#82959b]">
                Community names including capitalization cannot be changed.
              </p>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#82959b] font-medium text-sm">
                  r/
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-transparent border border-[#223237] hover:border-[#34464c] focus:border-[#d7dadc] rounded-xl text-sm outline-none transition-colors text-[#d7dadc] placeholder:text-[#82959b]"
                  placeholder="community_name"
                  maxLength={21}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#d7dadc]">
                Description <span className="text-[#82959b]">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-transparent border border-[#223237] hover:border-[#34464c] focus:border-[#d7dadc] rounded-xl text-sm outline-none transition-colors text-[#d7dadc] placeholder:text-[#82959b] resize-y"
                placeholder="What's your community about?"
                rows={3}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="bg-transparent text-[#d7dadc] border-[#34464c] hover:bg-[#223237] hover:text-white rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || name.length < 3}
                className="bg-[#ff4500] hover:bg-[#e03d00] text-white rounded-full"
              >
                {loading ? "Creating..." : "Create Community"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
