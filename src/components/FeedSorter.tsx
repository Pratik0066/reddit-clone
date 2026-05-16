"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FeedSorter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Default to "new" if there is no sort parameter in the URL
  const currentSort = searchParams.get("sort") || "new";

  const handleSort = (sortType: string) => {
    // Update the URL without reloading the whole page!
    router.push(`/?sort=${sortType}`);
  };

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 mb-4 overflow-x-auto">
      <button
        onClick={() => handleSort("new")}
        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
          currentSort === "new" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        ✨ New
      </button>
      <button
        onClick={() => handleSort("top")}
        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
          currentSort === "top" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        🔥 Top
      </button>
    </div>
  );
}