import { Skeleton } from "@/components/ui/skeleton"

export default function CommunitiesLoading() {
  return (
    <div className="max-w-312 mx-auto px-4 py-6">
      <div className="glass rounded-xl p-5 mb-6">
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-4 w-64 rounded mt-2" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
