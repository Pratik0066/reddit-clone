"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreatePostFormProps {
  communityId: string;
  communitySlug: string;
}

export default function CreatePostForm({ communityId, communitySlug }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // We will build this API route in the next step!
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          communityId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post.");
      }

      // If successful, redirect back to the community feed
      router.push(`/r/${communitySlug}`);
      router.refresh();
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-4">
      <div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={300}
          className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-orange-500 font-semibold text-lg"
          disabled={loading}
          required
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {title.length}/300
        </p>
      </div>

      <textarea
        placeholder="Text (optional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-orange-500 resize-y"
        disabled={loading}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2 mt-2">
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
          disabled={loading || title.trim().length === 0}
          className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}