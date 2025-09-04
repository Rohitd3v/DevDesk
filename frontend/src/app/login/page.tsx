'use client';
import { LoginForm } from "@/app/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-center text-black mb-6">DevDesk Login</h2>
        <LoginForm />
      </div>
    </div>
  );
}


