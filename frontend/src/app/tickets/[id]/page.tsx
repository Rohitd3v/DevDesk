"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { getTicketById, updateTicket } from "@/app/features/tickets/services/ticketService";
import { TicketComments } from "@/app/features/comments/components/TicketComments";
import Link from "next/link";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  project_id: string;
  created_by: string;
  assigned_to?: string;
}

function TicketDetailContent() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const data = await getTicketById(ticketId);
        setTicket(data.ticket);
      } catch (error: any) {
        setError(error.response?.data?.error || "Failed to load ticket");
        if (error.response?.status === 404) {
          router.push("/tickets");
        }
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, router]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    
    try {
      setUpdating(true);
      await updateTicket(ticket.id, { status: newStatus });
      setTicket({ ...ticket, status: newStatus });
    } catch (error: any) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!ticket) return;
    
    try {
      setUpdating(true);
      await updateTicket(ticket.id, { priority: newPriority });
      setTicket({ ...ticket, priority: newPriority });
    } catch (error: any) {
      console.error("Failed to update priority:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-black">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Ticket not found</h2>
        <p className="text-gray-600 mb-4">{error || "The ticket you're looking for doesn't exist."}</p>
        <Link
          href="/tickets"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Tickets
        </Link>
      </div>
    );
  }

  const priorityBadge = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
    critical: "bg-purple-100 text-purple-700",
  }[ticket.priority as "low" | "medium" | "high" | "critical"] || "bg-gray-100 text-gray-700";

  const statusBadge = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  }[ticket.status as "open" | "in_progress" | "resolved" | "closed"] || "bg-gray-100 text-gray-700";

  return (
    <div className="max-w-4xl mx-auto text-black">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/tickets" className="hover:text-blue-600">Tickets</Link>
        <span className="mx-2">/</span>
        <span>{ticket.title}</span>
      </nav>

      {/* Ticket Header */}
      <div className="bg-white rounded-xl border p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold flex-1 mr-4">{ticket.title}</h1>
          <div className="flex gap-2">
            <span className={`text-sm px-3 py-1 rounded-full ${priorityBadge}`}>
              {ticket.priority}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full ${statusBadge}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{ticket.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span> {new Date(ticket.created_at).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Project:</span>{" "}
            <Link href={`/projects/${ticket.project_id}`} className="text-blue-600 hover:underline">
              View Project
            </Link>
          </div>
        </div>
      </div>

      {/* Status and Priority Controls */}
      <div className="bg-white rounded-xl border p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Update Ticket</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="w-full px-3 py-2 border rounded-lg bg-white text-black disabled:opacity-50"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              disabled={updating}
              className="w-full px-3 py-2 border rounded-lg bg-white text-black disabled:opacity-50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <TicketComments ticketId={ticket.id} />
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <ProtectedRoute>
      <TicketDetailContent />
    </ProtectedRoute>
  );
}