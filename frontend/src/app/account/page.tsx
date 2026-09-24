"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const API = "http://localhost:4000/api";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status?: string;
  role?: string | null;
};

type Customer = {
  id: string;
  userId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
};

type MeState = {
  user: User;
  customer?: Customer | null;
};

type Order = {
  id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  total?: string | number;
  createdAt?: string;
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("access_token") || "";
}

function saveSession(data: any) {
  if (typeof window === "undefined") return;

  if (data?.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }

  const user = data?.user ?? data;
  const customer = data?.customer ?? null;

  if (user?.id) {
    localStorage.setItem("userId", user.id);
  }

  if (customer?.id) {
    localStorage.setItem("customerId", customer.id);
  }
}

function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("userId");
  localStorage.removeItem("customerId");
}

async function request(
  path: string,
  options: RequestInit = {},
) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(
      Array.isArray(message) ? message.join(", ") : String(message),
    );
  }

  return data;
}

export default function AccountPage() {
  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState<MeState | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [activeTab, setActiveTab] =
    useState<"overview" | "orders" | "addresses">("overview");

  async function loadAccount() {
    const token = getToken();

    if (!token) {
      setMe(null);
      setOrders([]);
      setChecking(false);
      return;
    }

    setChecking(true);

    try {
      const raw = await request("/auth/me");

      const rawUser = raw?.user ?? raw;
      const customer = raw?.customer ?? null;

      const normalized: MeState = {
        user: rawUser,
        customer,
      };

      setMe(normalized);

      try {
        const orderData = await request("/orders/my");

        const list = Array.isArray(orderData)
          ? orderData
          : Array.isArray(orderData?.data)
            ? orderData.data
            : [];

        setOrders(list);
      } catch {
        setOrders([]);
      }
    } catch {
      clearSession();
      setMe(null);
      setOrders([]);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    void loadAccount();
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    setAuthBusy(true);
    setAuthError("");

    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      saveSession(data);

      setEmail("");
      setPassword("");

      await loadAccount();
    } catch (error: any) {
      setAuthError(
        error?.message || "Login failed. Please check your credentials.",
      );
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    setAuthBusy(true);
    setAuthError("");

    try {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
        }),
      });

      if (data?.access_token) {
        saveSession(data);
        await loadAccount();
      } else {
        setMode("login");
        setAuthError(
          "Registration successful. Please login with your new account.",
        );
      }
    } catch (error: any) {
      setAuthError(
        error?.message ||
          "Registration failed. Please check your information.",
      );
    } finally {
      setAuthBusy(false);
    }
  }

  function logout() {
    clearSession();
    setMe(null);
    setOrders([]);
    setAuthError("");
    setMode("login");
    setActiveTab("overview");
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
  }

  const totalOrders = orders.length;

  const completedOrders = orders.filter((order) =>
    ["COMPLETED", "DELIVERED"].includes(
      String(order.status || "").toUpperCase(),
    ),
  ).length;

  const activeOrders = orders.filter(
    (order) =>
      !["COMPLETED", "DELIVERED", "CANCELLED"].includes(
        String(order.status || "").toUpperCase(),
      ),
  ).length;

  const totalSpent = orders.reduce((sum, order) => {
    const value = Number(order.total || 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-white/15 border-t-white animate-spin" />
          <p className="text-slate-300">Loading account...</p>
        </div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                MARHABA DUM BIRYANI & LOUNGE
              </p>

              <h1 className="mt-2 text-3xl font-black">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                {mode === "login"
                  ? "Login to view orders and track your account."
                  : "Create your customer account to place and track orders."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-black/20 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setAuthError("");
                }}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  mode === "login"
                    ? "bg-white text-slate-900"
                    : "text-slate-400"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setAuthError("");
                }}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  mode === "register"
                    ? "bg-white text-slate-900"
                    : "text-slate-400"
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {authError}
              </div>
            )}

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Password
                  </label>

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-orange-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full rounded-2xl bg-orange-500 px-4 py-3.5 font-black text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {authBusy ? "Logging in..." : "Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-orange-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full rounded-2xl bg-orange-500 px-4 py-3.5 font-black text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {authBusy ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Home
            </Link>

            <h1 className="mt-2 text-3xl font-black">My Account</h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/menu"
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/5"
            >
              Menu
            </Link>

            <Link
              href="/cart"
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black hover:bg-orange-400"
            >
              Cart
            </Link>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-red-400/20 px-4 py-2.5 text-sm font-bold text-red-300 hover:bg-red-400/10"
            >
              Logout
            </button>
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/20 via-white/[0.06] to-transparent p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-300">
                Customer Dashboard
              </p>

              <h2 className="mt-1 text-3xl font-black">
                {me.user.name || me.customer?.fullName || "Customer"}
              </h2>

              <p className="mt-2 text-slate-300">
                {me.user.email}
                {me.user.phone ? ` • ${me.user.phone}` : ""}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Account Status
              </p>

              <p className="mt-1 font-black text-emerald-300">
                {me.user.status || "ACTIVE"}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <p className="text-sm text-slate-400">Total Orders</p>
            <p className="mt-2 text-3xl font-black">{totalOrders}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <p className="text-sm text-slate-400">Active Orders</p>
            <p className="mt-2 text-3xl font-black">{activeOrders}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="mt-2 text-3xl font-black">{completedOrders}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <p className="text-sm text-slate-400">Total Spent</p>
            <p className="mt-2 text-3xl font-black">
              {totalSpent.toFixed(2)} BDT
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="flex flex-wrap gap-2 border-b border-white/10 p-3">
            {[
              ["overview", "Overview"],
              ["orders", "My Orders"],
              ["addresses", "Saved Addresses"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setActiveTab(
                    id as "overview" | "orders" | "addresses",
                  )
                }
                className={`rounded-xl px-4 py-2.5 text-sm font-bold ${
                  activeTab === id
                    ? "bg-white text-slate-900"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-xl font-black">Latest Orders</h3>

                {orders.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-400">
                    No orders yet.
                    <div className="mt-4">
                      <Link
                        href="/menu"
                        className="inline-flex rounded-xl bg-orange-500 px-4 py-2.5 font-black text-white"
                      >
                        Browse Menu
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-black">
                            {order.orderNumber || order.id}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Status: {order.status || "UNKNOWN"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black">
                            {Number(order.total || 0).toFixed(2)} BDT
                          </span>

                          <Link
                            href={`/orders/${order.id}`}
                            className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-black"
                          >
                            Track
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h3 className="text-xl font-black">My Orders</h3>

                {orders.length === 0 ? (
                  <p className="mt-4 text-slate-400">
                    You have no orders yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-black">
                              {order.orderNumber || order.id}
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              {order.createdAt
                                ? new Date(
                                    order.createdAt,
                                  ).toLocaleString()
                                : "Date unavailable"}
                            </p>

                            <p className="mt-1 text-sm">
                              Status:{" "}
                              <span className="font-bold text-orange-300">
                                {order.status || "UNKNOWN"}
                              </span>
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              Payment:{" "}
                              {order.paymentStatus || "UNKNOWN"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-black">
                              {Number(order.total || 0).toFixed(2)} BDT
                            </span>

                            <Link
                              href={`/orders/${order.id}`}
                              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black"
                            >
                              Track
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <h3 className="text-xl font-black">Saved Addresses</h3>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-slate-300">
                    {me.customer?.email || me.user.email}
                  </p>

                  <p className="mt-1 text-slate-400">
                    {me.customer?.phone || me.user.phone || "No phone saved"}
                  </p>

                  <p className="mt-4 text-sm text-slate-500">
                    Address management will appear here when saved
                    customer addresses are available.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
