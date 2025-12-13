"use client";

import { useProjects } from "@/app/features/projects/hooks/useProjects";
import { useAuth } from "@/app/contexts/AuthContext";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import Link from "next/link";

function DashboardContent() {
  const { projects, loading, error } = useProjects();
  const { user } = useAuth();

  if (loading)
    return (
      <div className="text-black">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  if (error)
    return (
      <div>
        <p className="text-red-600">{error}</p>
      </div>
    );

  return (
    <div className="text-black">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user?.email}</h1>
          <p className="text-gray-600">Here's what's happening with your projects</p>
        </div>
        <span className="text-sm text-gray-600">{projects.length} projects</span>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="rounded-xl border border-dashed p-8 bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first project</p>
            <Link
              href="/projects"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer">
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <p className="text-gray-700 text-sm line-clamp-3">{p.description}</p>
                <div className="mt-3 text-xs text-gray-500">
                  Created {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
