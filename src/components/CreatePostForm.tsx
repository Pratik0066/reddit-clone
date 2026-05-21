"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { UploadDropzone } from "@/lib/uploadthing"
import { ChevronDown, Bold, Italic, Code, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  content: z.string().optional(),
})

type PostFormData = z.infer<typeof postSchema>

interface Community {
  id: string
  name: string
  slug: string
}

const FORMATTERS: Record<string, { prefix: string; suffix: string }> = {
  bold: { prefix: "**", suffix: "**" },
  italic: { prefix: "*", suffix: "*" },
  code: { prefix: "`", suffix: "`" },
  codeblock: { prefix: "```\n", suffix: "\n```" },
  quote: { prefix: "> ", suffix: "" },
}

export default function CreatePostForm({
  communityId: preselectedCommunityId,
  communityName: preselectedCommunityName,
  onSuccess,
}: {
  communityId?: string
  communityName?: string
  onSuccess?: () => void
}) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tab, setTab] = useState<"text" | "image">("text")
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState(preselectedCommunityId || "")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  })

  const titleValue = useWatch({ control, name: "title", defaultValue: "" })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/community")
        if (res.ok) {
          const data = await res.json()
          setCommunities(data)
        }
      } catch {}
    }
    if (!preselectedCommunityId) load()
  }, [preselectedCommunityId])

  const applyFormat = useCallback((type: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const { prefix, suffix } = FORMATTERS[type] || { prefix: "", suffix: "" }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = ta.value
    const selected = text.substring(start, end)
    const replacement = prefix + selected + suffix
    const newValue = text.substring(0, start) + replacement + text.substring(end)
    setValue("content", newValue, { shouldDirty: true })
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
    })
  }, [setValue])

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        title: data.title,
        content: data.content || "",
        imageUrl,
        communityId: selectedCommunity || undefined,
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success("Post created!")
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/")
          router.refresh()
        }
      } else {
        const errorText = await res.text()
        toast.error(errorText || "Failed to create post")
      }
    } catch {
      toast.error("Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-185 mx-auto p-4 space-y-5 bg-[#030303] text-white rounded-2xl">
      {/* ── Top Header Layout ── */}
      <div className="flex items-center justify-between border-b border-[#223237] pb-3">
        <h1 className="text-xl font-semibold text-[#d7dadc]">Create post</h1>
        <button type="button" className="text-xs font-semibold text-[#82959b] hover:text-white bg-[#1a282d] px-3 py-1.5 rounded-full transition">
          Drafts
        </button>
      </div>

      {/* ── Community Selection ── */}
      {preselectedCommunityName ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a282d] border border-[#34464c] rounded-full text-xs font-semibold text-[#d7dadc]">
          r/{preselectedCommunityName}
        </div>
      ) : (
        <div className="relative inline-block min-w-50">
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-1.5 bg-[#1a282d] hover:bg-[#223237] border border-[#34464c] rounded-full text-xs font-semibold text-[#d7dadc] outline-none transition cursor-pointer"
          >
            <option value="">Select Community</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                r/{c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-2 size-3.5 text-[#82959b] pointer-events-none" />
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex gap-2 border-b border-[#223237]">
        {([
          { key: "text" as const, label: "Text" },
          { key: "image" as const, label: "Images & Video" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "relative px-4 py-2 text-[14px] font-bold tracking-wide transition cursor-pointer pb-3",
              tab === key
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#ff4500]"
                : "text-[#82959b] hover:bg-[#1a282d]/40"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Form Inputs Content ── */}
      <div className="space-y-4">
        {/* Title Input Box */}
        <div className="relative">
          <input
            type="text"
            maxLength={300}
            {...register("title")}
            className={cn(
              "w-full bg-transparent border border-[#223237] hover:border-[#34464c] focus:border-[#d7dadc] rounded-xl px-4 py-3 text-[14px] text-white outline-none placeholder-[#82959b] transition-all pr-14",
              errors.title && "border-red-500"
            )}
            placeholder="Title*"
          />
          <span className="absolute bottom-3 right-3 text-[10px] text-[#82959b]">
            {titleValue.length}/300
          </span>
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Media Upload Area */}
        {tab === "image" && (
          <div>
            {imageUrl ? (
              <div className="relative w-full h-48 bg-[#1a282d] rounded-xl overflow-hidden border border-[#223237]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Uploaded preview"
                  className="object-contain w-full h-full p-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 rounded-full h-7 text-xs"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    setImageUrl(res[0].url)
                    toast.success("Image uploaded!")
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(error.message)
                }}
                className="border-2 border-dashed border-[#223237] hover:border-[#34464c] rounded-xl min-h-32.5 flex flex-col items-center justify-center cursor-pointer transition ut-button:bg-[#ff4500] ut-button:hover:bg-[#e03d00] ut-button:text-white ut-button:rounded-full ut-button:text-xs ut-button:font-semibold ut-button:h-8 ut-button:px-4 ut-label:text-sm ut-label:text-[#d7dadc] ut-allowed-content:text-xs ut-allowed-content:text-[#82959b]"
              />
            )}
          </div>
        )}

        {/* Body Text Container */}
        <div className="border border-[#223237] rounded-xl overflow-hidden focus-within:border-[#d7dadc] transition-all bg-transparent">
          <div className="flex items-center flex-wrap gap-1 px-3 py-2 border-b border-[#223237] text-[#82959b]">
            <FormatButton icon={Bold} onClick={() => applyFormat("bold")} title="Bold" />
            <FormatButton icon={Italic} onClick={() => applyFormat("italic")} title="Italic" />
            <FormatButton icon={Code} onClick={() => applyFormat("code")} title="Inline code" />
            <span className="w-px h-4 bg-[#223237] mx-1" />
            <FormatButton icon={Quote} onClick={() => applyFormat("quote")} title="Quote" />
            <span className="text-[11px] text-[#82959b] ml-auto hidden sm:inline-block pr-1">
              Styling with markdown is supported
            </span>
          </div>

          <textarea
            {...register("content")}
            ref={(e) => {
              register("content").ref(e)
              textareaRef.current = e
            }}
            className="w-full bg-transparent p-4 text-[14px] min-h-35 outline-none text-[#d7dadc] placeholder-[#82959b] resize-none"
            placeholder="Body text (optional)"
          />
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#223237]/40">
          <Button
            type="submit"
            disabled={isSubmitting || !selectedCommunity || titleValue.length === 0}
            className="px-5 h-8 text-xs font-bold bg-[#ffffff] text-[#030303] hover:bg-[#d7dadc] rounded-full transition disabled:bg-[#1a282d] disabled:text-[#545759]"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </form>
  )
}

function FormatButton({
  icon: Icon,
  onClick,
  title,
}: {
  icon: typeof Bold
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1 hover:bg-[#1a282d] hover:text-white rounded transition cursor-pointer"
    >
      <Icon className="size-4" />
    </button>
  )
}