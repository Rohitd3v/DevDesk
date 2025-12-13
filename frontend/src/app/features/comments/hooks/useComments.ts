import { useEffect, useState, useCallback } from "react";
import { getComments, createComment, deleteComment } from "../services/commentService";
import { AxiosError } from "axios";

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  ticket_id: string;
}

export const useComments = (ticketId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!ticketId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getComments(ticketId);
      setComments(data.comments || []);
    } catch (err) {
      if (err instanceof AxiosError) {
        // 404 means no comments yet, which is fine
        if (err.response?.status === 404) {
          setComments([]);
        } else {
          setError(err.response?.data?.error || "Failed to load comments");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const addComment = async (content: string) => {
    try {
      await createComment(ticketId, content);
      await fetchComments(); // Refresh comments
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new Error(err.response?.data?.error || "Failed to create comment");
      }
      throw err;
    }
  };

  const removeComment = async (commentId: string) => {
    try {
      await deleteComment(ticketId, commentId);
      await fetchComments(); // Refresh comments
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new Error(err.response?.data?.error || "Failed to delete comment");
      }
      throw err;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, addComment, removeComment, refetch: fetchComments };
};