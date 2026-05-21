"use client"

import Link from "next/link"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/lib/store"
import { Home, Globe, Plus, Flame } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface Community {
  id: string
  name: string
  slug: string
  icon: string | null
}

export default function MobileSidebar() {
  const { isOpen, close } = useSidebarStore()
  const { user } = useUser()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !isOpen) return

    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/community?joined=true")
        if (!cancelled && res.ok) {
          const data = await res.json()
          setCommunities(data)
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()

    return () => { cancelled = true }
  }, [user, isOpen])

  const isLoading = loading && !!user

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="left" className="w-72 p-0 text-[#d7dadc] bg-[#030303] border-[#223237]">
        <SheetHeader className="p-4 border-b border-[#223237]">
          <SheetTitle className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <circle cx="128" cy="128" r="128" fill="#FF4500"/>
              <path d="M174.81 76.63c11.697 0 21.18-9.482 21.18-21.18 0-11.697-9.483-21.18-21.18-21.18-11.697 0-21.18 9.483-21.18 21.18 0 11.698 9.483 21.18 21.18 21.18z" fill="white"/>
              <path d="M128.07 165.12c-10.58 0-20.72.51-30.1 1.44-1.6.16-2.62 1.79-2 3.25 5.25 12.31 17.64 20.96 32.1 20.96s26.84-8.65 32.1-20.96c.62-1.46-.39-3.09-2-3.25-9.38-.93-19.52-1.44-30.1-1.44z" fill="white"/>
            </svg>
            <span className="text-lg font-bold">MYReddit</span>
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-20">
          <nav className="p-2">
            <Link
              href="/"
              onClick={close}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#d7dadc] hover:bg-[#1a282d] transition no-underline hover:no-underline"
            >
              <Home className="size-4 text-[#82959b]" />
              Home
            </Link>
            <Link
              href="/communities"
              onClick={close}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#d7dadc] hover:bg-[#1a282d] transition no-underline hover:no-underline"
            >
              <Globe className="size-4 text-[#82959b]" />
              Communities
            </Link>
          </nav>

          <div className="border-t border-[#223237] my-2" />

          <div className="px-4 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#82959b]">
              {user ? "My Communities" : "Communities"}
            </span>
          </div>

          <div className="px-2">
            {isLoading ? (
              <div className="space-y-1 px-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : communities.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-[#82959b] mb-2">
                  {user ? "No communities yet" : "Sign in to join communities"}
                </p>
              </div>
            ) : (
              communities.slice(0, 15).map((c) => (
                <Link
                  key={c.id}
                  href={`/r/${c.slug}`}
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#82959b] hover:text-[#d7dadc] hover:bg-[#1a282d]/50 transition no-underline"
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
              ))
            )}

            <Link
              href="/r/create"
              onClick={close}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#82959b] hover:text-[#d7dadc] hover:bg-[#1a282d]/50 transition no-underline mt-2"
            >
              <Plus className="size-4" />
              Create Community
            </Link>
          </div>

          <div className="border-t border-[#223237] mt-2 pt-2 px-3">
            {!user ? (
              <SignInButton mode="modal">
                <Button size="sm" className="w-full cursor-pointer">
                  Log In
                </Button>
              </SignInButton>
            ) : (
              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "size-8",
                    },
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#d7dadc] truncate">
                    {user.username || user.firstName || "User"}
                  </p>
                  <p className="text-xs text-[#82959b]">
                    <Flame className="size-3 inline text-[#ff4500] mr-0.5" />
                    0 karma
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
