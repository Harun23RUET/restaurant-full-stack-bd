"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiPost } from "../../lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiPost<{
        success?: boolean;
        message?: string;
      }>("/auth/reset-password", {
        token,
        password,
      });

      setSuccess(
        data?.message || "Password reset successful."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <section className="w-full rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <p className="font-black tracking-widest text-orange-500">
              MARHABA
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Reset Password
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create a new password for your account.
            </p>
          </div>

          {success && (
            <div className="mb-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">
              {success}
              <Link
                href="/login"
                className="mt-3 block font-black text-orange-600 hover:text-orange-700"
              >
                Go to Login →
              </Link>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-16 outline-none focus:border-orange-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 hover:text-orange-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter password again"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-16 outline-none focus:border-orange-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 hover:text-orange-500"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-6 block text-center text-sm font-bold text-slate-500 hover:text-orange-500"
          >
            ← Back to Login
          </Link>
        </section>
      </div>
    </main>
  );
}
