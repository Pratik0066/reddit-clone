import { Skeleton } from "@/components/ui/skeleton"

function PostSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex">
        <div className="w-12 bg-muted/50 flex flex-col items-center py-3 gap-2 shrink-0">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-3 w-5 rounded" />
          <Skeleton className="size-5 rounded" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <div className="flex gap-1">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="max-w-312 mx-auto px-4 py-4 flex gap-6 justify-center">
      <div className="w-full max-w-160 min-w-0 space-y-3">
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="flex-1 h-10 rounded-lg" />
        </div>
        <div className="bg-card rounded-lg p-1 flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 flex-1 rounded-md" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
      <aside className="hidden lg:block w-78 shrink-0 space-y-4">
        <div className="glass rounded-xl overflow-hidden sticky top-16">
          <Skeleton className="h-16 rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="size-12 rounded-xl" />
            <Skeleton className="h-6 w-24 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
        <div className="glass rounded-xl overflow-hidden p-4 space-y-3">
          <Skeleton className="h-4 w-32 rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-4 rounded" />
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded" />
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
