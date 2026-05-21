"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Globe, Plus, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Community {
  id: string
  name: string
  slug: string
  icon: string | null
}

export default function LeftSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        let url = "/api/community"
        if (user) url += "?joined=true"
        const res = await fetch(url)
        if (!cancelled && res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            setCommunities(data)
          } else if (user) {
            const fallback = await fetch("/api/community")
            if (!cancelled && fallback.ok) {
              setCommunities(await fallback.json())
            }
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()

    return () => { cancelled = true }
  }, [user])

  const isLoading = loading
  const isEmpty = !isLoading && communities.length === 0

  const displayed = showAll ? communities : communities.slice(0, 10)

  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="fixed top-14 bottom-0 w-56 overflow-y-auto scrollbar-thin border-r border-[#223237] bg-[#030303]">
        <div className="p-3 space-y-0.5">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition no-underline",
              pathname === "/"
                ? "bg-[#1a282d] text-[#d7dadc]"
                : "text-[#82959b] hover:text-[#d7dadc] hover:bg-[#1a282d]/50"
            )}
          >
            <Home className="size-5" />
            Home
          </Link>
          <Link
            href="/communities"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition no-underline",
              pathname === "/communities"
                ? "bg-[#1a282d] text-[#d7dadc]"
                : "text-[#82959b] hover:text-[#d7dadc] hover:bg-[#1a282d]/50"
            )}
          >
            <Globe className="size-5" />
            Communities
          </Link>
        </div>

        <div className="border-t border-[#223237] my-2" />

        <div className="px-3 pb-3">
          <div className="flex items-center justify-between mb-1 px-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#82959b]">
              {user ? "My Communities" : "Communities"}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-1 px-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-full" />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-[#82959b] mb-2">
                No communities found
              </p>
              <Link href="/r/create" className="no-underline">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1 bg-transparent text-[#d7dadc] border-[#34464c] hover:bg-[#223237] hover:text-white rounded-full">
                  <Plus className="size-3" />
                  Create Community
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-0.5">
              {displayed.map((c) => (
                <Link
                  key={c.id}
                  href={`/r/${c.slug}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 rounded-full text-sm transition no-underline",
                    pathname === `/r/${c.slug}`
                      ? "bg-[#1a282d] text-[#d7dadc] font-medium"
                      : "text-[#82959b] hover:text-[#d7dadc] hover:bg-[#1a282d]/50"
                  )}
                >
                  {c.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.icon} alt="" className="size-6 rounded-full" />
                  ) : (
                    <div className="size-6 rounded-full bg-[#ff4500]/10 flex items-center justify-center text-[#ff4500] text-[10px] font-bold shrink-0">
                      {c.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="truncate">r/{c.name}</span>
                </Link>
              ))}
              {communities.length > 10 && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-full text-sm text-[#82959b] hover:text-[#d7dadc] hover:bg-[#1a282d]/50 transition w-full cursor-pointer"
                >
                  <ChevronDown className="size-4" />
                  Show all ({communities.length})
                </button>
              )}
            </div>
          )}

          <div className="mt-3 px-3">
            <Link href="/r/create" className="no-underline">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1 bg-transparent text-[#d7dadc] border-[#34464c] hover:bg-[#223237] hover:text-white rounded-full">
                <Plus className="size-3" />
                Create Community
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
