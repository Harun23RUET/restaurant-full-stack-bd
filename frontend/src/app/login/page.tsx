"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "../../lib/api";
import { saveAuth } from "../../lib/auth";

type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    status?: string;
  };
  customer?: {
    id: string;
    userId: string;
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await apiPost<LoginResponse>("/auth/login", {
        email,
        password,
      });

      saveAuth(data);

      router.push("/cart");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed"
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
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Login to continue to your cart.
            </p>
          </div>

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

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <Link
            href="/menu"
            className="mt-6 block text-center text-sm font-bold text-slate-500 hover:text-orange-500"
          >
            ← Back to Menu
          </Link>
        </section>
      </div>
    </main>
  );
}
