"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  postId: string;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // We will build this API route in the very next step!
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          postId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment.");
      }

      // Clear the form and refresh the page to show the new comment
      setText("");
      router.refresh();
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mb-6 flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What are your thoughts?"
        rows={4}
        className="w-full p-4 border border-gray-300 rounded-lg outline-none focus:border-orange-500 resize-y text-sm"
        disabled={loading}
        required
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={loading || text.trim().length === 0}
          className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {loading ? "Posting..." : "Comment"}
        </button>
      </div>
    </form>
  );
}