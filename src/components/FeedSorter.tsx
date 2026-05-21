"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Flame, Sparkles, Trophy, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const SORT_OPTIONS = [
  { key: "hot", label: "Hot", icon: Flame },
  { key: "new", label: "New", icon: Sparkles },
  { key: "top", label: "Top", icon: Trophy },
  { key: "rising", label: "Rising", icon: TrendingUp },
] as const

export default function FeedSorter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "hot"

  const handleSort = (sortType: string) => {
    router.push(`/?sort=${sortType}`)
  }

  return (
    <div className="flex items-center gap-0.5 mb-3 border-b border-[#223237]">
      {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => handleSort(key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all cursor-pointer border-b-2 -mb-[1px]",
            currentSort === key
              ? "text-[#d7dadc] border-[#ff4500]"
              : "text-[#82959b] hover:text-[#d7dadc] border-transparent hover:border-[#223237]"
          )}
        >
          <Icon className="size-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
