
import { SignupForm } from "../features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-black">Create Account</h2>
        <SignupForm />
      </div>
    </div>
  );
}
