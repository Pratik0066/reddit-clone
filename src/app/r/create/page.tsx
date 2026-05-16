"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCommunityPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Make the POST request to our new API route
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const community = await response.json();
      
      // Redirect the user to their newly created community page
      router.push(`/r/${community.slug}`);
      
    }  catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Create a Community</h1>
      <hr className="mb-4" />
      
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Community names including capitalization cannot be changed.
          </p>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              r/
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md outline-none focus:border-orange-500"
              placeholder="community_name"
              maxLength={21}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-full text-sm font-semibold hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || name.length < 3}
            className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Community"}
          </button>
        </div>
      </form>
    </div>
  );
}