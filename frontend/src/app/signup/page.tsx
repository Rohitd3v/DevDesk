
import { SignupForm } from "../features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-center mb-6 text-black">Create Account</h2>
        <SignupForm />
      </div>
    </div>
  );
}
