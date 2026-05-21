import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <SearchX className="size-16 text-muted-foreground mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-2">404</h1>
      <p className="text-sm text-muted-foreground mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="no-underline hover:no-underline">
        <Button>Go Home</Button>
      </Link>
    </div>
  )
}
