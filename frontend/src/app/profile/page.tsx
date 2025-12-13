"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/contexts/AuthContext";
import { ProfileService } from "@/app/features/profiles/services/profileService";
import { GitHubConnection } from "@/app/features/github/components/GitHubConnection";

interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

function ProfileContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    avatar_url: "",
    role: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await ProfileService.getProfileById(user.id);
        setProfile(data.data);
        setFormData({
          username: data.data.username || "",
          full_name: data.data.full_name || "",
          avatar_url: data.data.avatar_url || "",
          role: data.data.role || "",
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          // Profile doesn't exist yet
          setProfile(null);
        } else {
          setError(error.response?.data?.error || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setLoading(true);
      if (profile) {
        // Update existing profile
        const data = await ProfileService.updateProfile(user.id, formData);
        setProfile(data.data);
      } else {
        // Create new profile
        const data = await ProfileService.createProfile(formData);
        setProfile(data.data);
      }
      setEditing(false);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-black">
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          {profile && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!profile && !editing ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No profile found</h3>
            <p className="text-gray-600 mb-4">Create your profile to get started</p>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Profile
            </button>
          </div>
        ) : editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-black"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-black"
                placeholder="e.g., Developer, Designer, Manager"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">{profile.full_name || profile.username}</h2>
                {profile.full_name && (
                  <p className="text-gray-600">@{profile.username}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              {profile.role && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="text-gray-900">{profile.role}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* GitHub Integration Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">GitHub Integration</h2>
        <GitHubConnection />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}