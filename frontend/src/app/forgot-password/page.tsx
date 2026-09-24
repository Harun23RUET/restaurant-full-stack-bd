"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { apiPost } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await apiPost<{
        success?: boolean;
        message?: string;
      }>("/auth/forgot-password", {
        email,
      });

      setMessage(
        data?.message ||
          "If an account exists for this email, a reset link has been sent."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
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
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Enter your email and we&apos;ll send you a password reset link.
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">
              {message}
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
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
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
