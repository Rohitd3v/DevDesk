"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function GitHubSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processGitHubAuth = async () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const userStr = searchParams.get("user");

        if (!accessToken || !userStr) {
          throw new Error("Missing authentication data");
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store tokens in localStorage
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // Update auth context
        setUser(user);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (error) {
        console.error("GitHub auth processing error:", error);
        setTimeout(() => {
          router.push("/login?error=github_auth_processing_failed");
        }, 2000);
      } finally {
        setProcessing(false);
      }
    };

    processGitHubAuth();
  }, [searchParams, setUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          {processing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          ) : (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {processing ? "Processing GitHub Authentication..." : "GitHub Connected Successfully!"}
        </h2>
        
        <p className="text-gray-600">
          {processing 
            ? "Please wait while we set up your account..." 
            : "Redirecting you to the dashboard..."
          }
        </p>
      </div>
    </div>
  );
}