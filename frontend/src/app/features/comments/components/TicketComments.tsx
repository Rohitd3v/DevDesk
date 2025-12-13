"use client";

import { useState } from "react";
import { useComments } from "../hooks/useComments";
import { useAuth } from "@/app/contexts/AuthContext";

interface TicketCommentsProps {
  ticketId: string;
}

export const TicketComments = ({ ticketId }: TicketCommentsProps) => {
  const { comments, loading, error, addComment, removeComment } = useComments(ticketId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await addComment(newComment.trim());
      setNewComment("");
    } catch (error: any) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await removeComment(commentId);
    } catch (error: any) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 border rounded-lg resize-none text-black"
          rows={3}
          required
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Adding..." : "Add Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">User {comment.author_id.slice(0, 8)}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                {user?.id === comment.author_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};