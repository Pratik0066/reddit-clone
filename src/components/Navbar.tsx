"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import {
  Search,
  Plus,
  Menu,
  X,
  Bell,
  MessageSquareMore,
  PenSquare,
  Users,
  Loader2,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/lib/store"
import { toast } from "sonner"

interface SuggestionCommunity {
  id: string
  name: string
  slug: string
  _count: { members: number }
}

interface SuggestionPost {
  id: string
  title: string
  community: { name: string; slug: string } | null
}

interface SearchSuggestions {
  communities: SuggestionCommunity[]
  posts: SuggestionPost[]
}

export default function Navbar() {
  const router = useRouter()
  const { user } = useUser()
  const [search, setSearch] = useState("")
  const { toggle } = useSidebarStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("navbar-search")?.focus()
      }
      if (e.key === "Escape") {
        setCreateOpen(false)
        setShowSuggestions(false)
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCreateOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions(null)
      setShowSuggestions(false)
      return
    }
    setSuggestionsLoading(true)
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data)
        setShowSuggestions(true)
      }
    } catch {
      /* ignore */
    } finally {
      setSuggestionsLoading(false)
    }
  }, [])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 250)
    },
    [fetchSuggestions]
  )

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (search.trim()) {
        router.push(`/search?q=${encodeURIComponent(search.trim())}`)
        setSearch("")
        setShowSuggestions(false)
        ;(document.getElementById("navbar-search") as HTMLInputElement)?.blur()
      }
    },
    [search, router]
  )

  const handleSuggestionClick = useCallback(() => {
    setSearch("")
    setShowSuggestions(false)
    setSuggestions(null)
  }, [])

  const hasSuggestions =
    suggestions && (suggestions.communities.length > 0 || suggestions.posts.length > 0)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#030303] border-b border-[#223237] px-4 flex items-center justify-between">
      {/* ── Left Side: Menu + Brand Logo ── */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-[#1a282d] rounded-full"
          onClick={toggle}
        >
          <Menu className="size-5" />
        </Button>

        <Link href="/" className="flex items-center gap-2 no-underline group">
          <div className="bg-[#ff4500] p-1.5 rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.16 9.32c0-.77-.63-1.39-1.4-1.39-.33 0-.63.12-.87.31-1.28-.9-3.03-1.48-4.98-1.55l1.06-3.34 2.92.68c.03.54.48.97 1.03.97.57 0 1.03-.46 1.03-1.03s-.46-1.03-1.03-1.03c-.48 0-.89.33-.99.78l-3.2-.74c-.12-.03-.25.04-.29.16L9.31 6.69c-2 .03-3.8.6-5.1 1.5-.23-.2-.54-.31-.87-.31-.77 0-1.4.62-1.4 1.39 0 .54.31 1.01.76 1.24-.04.2-.06.4-.06.61 0 2.45 2.99 4.43 6.67 4.43s6.67-1.98 6.67-4.43c0-.21-.02-.41-.06-.61.45-.23.76-.7.76-1.24zm-11 1.11c0-.57.46-1.03 1.03-1.03s1.03.46 1.03 1.03c0 .57-.46 1.03-1.03 1.03s-1.03-.46-1.03-1.03zm6.5 2.37c-.77.77-2.22.84-2.66.84-.44 0-1.89-.07-2.66-.84-.09-.09-.09-.24 0-.33.09-.09.24-.09.33 0 .61.61 1.77.7 2.33.7.56 0 1.72-.09 2.33-.7.09-.09.24-.09.33 0 .09.1.09.25 0 .33zm-.33-1.34c-.57 0-1.03-.46-1.03-1.03s.46-1.03 1.03-1.03 1.03.46 1.03 1.03c0 .57-.46 1.03-1.03 1.03z"/>
            </svg>
          </div>
          <span className="text-[20px] font-black tracking-tighter text-white font-sans hidden sm:block">
            reddit
          </span>
        </Link>
      </div>

      {/* ── Center: Search Bar with Suggestions ── */}
      <div className="flex-1 max-w-170 mx-4 relative" ref={searchRef}>
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative w-full flex items-center bg-[#1a282d] hover:bg-[#223237] border border-transparent focus-within:border-[#34464c] rounded-full h-10 px-4 transition-all group">
            <Search className="size-4.5 text-[#82959b] mr-2 shrink-0" />
            <input
              id="navbar-search"
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => { if (hasSuggestions) setShowSuggestions(true) }}
              placeholder="Find anything"
              autoComplete="off"
              className="flex-1 bg-transparent py-2 text-[14px] outline-none text-[#d7dadc] placeholder-[#82959b] min-w-0"
            />
            {search ? (
              <button
                type="button"
                onClick={() => { setSearch(""); setSuggestions(null); setShowSuggestions(false) }}
                className="p-1 rounded-full text-[#82959b] hover:bg-[#2d3f46] shrink-0 mr-1"
              >
                <X className="size-4" />
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-1 bg-[#223237] hover:bg-[#2d3f46] text-[#ff4500] text-xs font-semibold py-1 px-2.5 rounded-full border border-[#ff4500]/30 cursor-pointer transition">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.8 8.4L22 9.2L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.2L9.2 8.4L12 2Z" />
                </svg>
                <span>Ask</span>
              </div>
            )}
          </div>
        </form>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && search.trim().length >= 2 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-[#1a282d] border border-[#34464c] rounded-2xl overflow-hidden shadow-2xl z-50">
            {suggestionsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 text-[#82959b] animate-spin" />
              </div>
            ) : hasSuggestions ? (
              <div className="py-2">
                {suggestions.communities.length > 0 && (
                  <div>
                    <div className="px-4 py-1.5">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#82959b]">
                        Communities
                      </span>
                    </div>
                    {suggestions.communities.map((c) => (
                      <Link
                        key={c.id}
                        href={`/r/${c.slug}`}
                        onClick={handleSuggestionClick}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-[#223237] transition no-underline"
                      >
                        <div className="size-7 rounded-full bg-[#ff4500]/10 flex items-center justify-center text-[#ff4500] text-xs font-bold shrink-0">
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#d7dadc] truncate">
                            r/{c.name}
                          </p>
                          <p className="text-[11px] text-[#82959b]">
                            {c._count.members} members
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {suggestions.posts.length > 0 && (
                  <div>
                    <div className="px-4 py-1.5 mt-1">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#82959b]">
                        Posts
                      </span>
                    </div>
                    {suggestions.posts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/r/${p.community?.slug || "all"}/post/${p.id}`}
                        onClick={handleSuggestionClick}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-[#223237] transition no-underline"
                      >
                        <div className="size-7 rounded-full bg-[#1a282d] border border-[#34464c] flex items-center justify-center text-[#82959b] shrink-0">
                          <TrendingUp className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#d7dadc] truncate">
                            {p.title}
                          </p>
                          {p.community && (
                            <p className="text-[11px] text-[#82959b]">
                              r/{p.community.name}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-[#82959b]">
                No results found for &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right Side: Navigation Actions & Profile ── */}
      <div className="flex items-center gap-1 sm:gap-3">
        {user && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#d7dadc] hover:bg-[#1a282d] rounded-full hidden sm:inline-flex"
            >
              <MessageSquareMore className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#d7dadc] hover:bg-[#1a282d] rounded-full hidden sm:inline-flex"
            >
              <Bell className="size-5" />
            </Button>
          </>
        )}

        {/* Create Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            className="bg-transparent hover:bg-[#1a282d] text-white rounded-full font-medium text-sm px-3 gap-2 h-9"
            onClick={() => {
              if (!user) {
                toast.error("Sign in to create")
                return
              }
              setCreateOpen(!createOpen)
            }}
          >
            <Plus className="size-4.5" />
            <span className="hidden md:inline text-[14px]">Create</span>
          </Button>

          {createOpen && user && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a282d] border border-[#34464c] rounded-xl overflow-hidden shadow-2xl py-1 z-50">
              <Link
                href="/submit"
                onClick={() => setCreateOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#d7dadc] hover:bg-[#223237] transition no-underline"
              >
                <PenSquare className="size-4 text-[#82959b]" />
                Create Post
              </Link>
              <Link
                href="/r/create"
                onClick={() => setCreateOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#d7dadc] hover:bg-[#223237] transition no-underline"
              >
                <Users className="size-4 text-[#82959b]" />
                Create Community
              </Link>
            </div>
          )}
        </div>

        {!user ? (
          <SignInButton mode="modal">
            <Button className="bg-[#ff4500] hover:bg-[#e03d00] text-white font-bold rounded-full text-xs px-4 h-8 transition-colors">
              Log In
            </Button>
          </SignInButton>
        ) : (
          <div className="pl-1 flex items-center">
            <UserButton
  appearance={{
    elements: {
      avatarBox: "size-7 border border-[#34464c]",
      userButtonPopoverCard: "bg-[#1a282d] border border-[#34464c] shadow-2xl",
      userButtonPopoverMain: "text-[#FFFFFF]",
      userButtonPopoverActions: "bg-[#1a282d] text-[#d7dadc]",
      
      // Force custom highlights directly onto the popover line actions
      userButtonPopoverActionButton: "hover:bg-[#223237] transition-colors group",
      
      // Decisively forces the text labels white using !important flag modifiers
      userButtonPopoverActionButtonText: "!text-[#d7dadc] font-medium group-hover:!text-white",
      
      // Decisively forces the vector svg icon color fills using !important flag modifiers
      userButtonPopoverActionButtonIcon: "!text-[#82959b] group-hover:!text-white",
      
      userButtonPopoverFooter: "hidden",
      userPreviewMainIdentifier: "!text-white font-semibold",
      userPreviewSecondaryIdentifier: "!text-[#82959b]",
    },
  }}
/>
          </div>
        )}
      </div>
    </nav>
  )
}