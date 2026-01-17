'use client';
import { LoginForm } from "@/app/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-center text-black mb-6">DevDesk Login</h2>
        <LoginForm />
      </div>
    </div>
  );
}


