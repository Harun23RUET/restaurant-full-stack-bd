"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

type Order = {
  id: string;
  status?: string;
  orderType?: string;
  grandTotal?: number;
  total?: number;
};

type Rider = {
  id: string;
  name: string;
  isActive: boolean;
};

type Assignment = {
  id: string;
  orderId: string;
  status: string;
};

type Zone = {
  id: string;
  name: string;
  isActive: boolean;
};

function listFrom<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }

  return [];
}

function money(value: number) {
  return `BDT ৳${Number(value || 0).toFixed(2)}`;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setError("");

      const [ordersRes, ridersRes, assignmentsRes, zonesRes] =
        await Promise.all([
          apiGet<unknown>("/orders"),
          apiGet<unknown>("/delivery/riders"),
          apiGet<unknown>("/delivery/assignments"),
          apiGet<unknown>("/delivery/zones"),
        ]);

      setOrders(listFrom<Order>(ordersRes));
      setRiders(listFrom<Rider>(ridersRes));
      setAssignments(listFrom<Assignment>(assignmentsRes));
      setZones(listFrom<Zone>(zonesRes));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const timer = window.setInterval(() => {
      loadDashboard();
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  const newOrders = orders.filter(
    (order) => order.status === "NEW"
  ).length;

  const preparingOrders = orders.filter(
    (order) => order.status === "PREPARING"
  ).length;

  const deliveryOrders = orders.filter(
    (order) => String(order.orderType).toUpperCase() === "DELIVERY"
  ).length;

  const activeAssignments = assignments.filter(
    (assignment) =>
      assignment.status !== "DELIVERED" &&
      assignment.status !== "CANCELLED"
  ).length;

  const totalSales = orders.reduce(
    (sum, order) =>
      sum + Number(order.grandTotal ?? order.total ?? 0),
    0
  );

  const activeRiders = riders.filter(
    (rider) => rider.isActive
  ).length;

  const activeZones = zones.filter(
    (zone) => zone.isActive
  ).length;

  const sections = [
    {
      title: "Orders",
      description: "View customer orders and order details.",
      href: "/orders",
      value: orders.length,
      label: "Total Orders",
    },
    {
      title: "Kitchen",
      description: "Manage preparation and kitchen order status.",
      href: "/kitchen",
      value: preparingOrders,
      label: "Preparing",
    },
    {
      title: "Delivery",
      description: "Manage riders, assignments and delivery zones.",
      href: "/delivery",
      value: activeAssignments,
      label: "Active Deliveries",
    },
    {
      title: "Menu",
      description: "Manage restaurant menu and customer ordering.",
      href: "/menu",
      value: "→",
      label: "Open Menu",
    },
    {
      title: "Cart",
      description: "Customer shopping cart and checkout flow.",
      href: "/cart",
      value: "→",
      label: "Open Cart",
    },
    {
      title: "Rider",
      description: "Rider-side assigned delivery dashboard.",
      href: "/rider",
      value: activeRiders,
      label: "Active Riders",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0c0c0d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Restaurant Administration
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Shop: New Market, Rajshahi
              <span className="mx-2 text-white/20">•</span>
              Delivery: Whole Rajshahi City
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/75 hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
            Loading dashboard...
          </div>
        ) : (
          <>
            <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Orders
                </div>
                <div className="mt-2 text-3xl font-bold text-amber-300">
                  {orders.length}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  New
                </div>
                <div className="mt-2 text-3xl font-bold text-blue-300">
                  {newOrders}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Preparing
                </div>
                <div className="mt-2 text-3xl font-bold text-orange-300">
                  {preparingOrders}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Delivery Orders
                </div>
                <div className="mt-2 text-3xl font-bold text-purple-300">
                  {deliveryOrders}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Active Riders
                </div>
                <div className="mt-2 text-3xl font-bold text-emerald-300">
                  {activeRiders}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Sales
                </div>
                <div className="mt-2 text-xl font-bold text-amber-300">
                  {money(totalSales)}
                </div>
              </div>
            </section>

            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold group-hover:text-amber-300">
                        {section.title}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-white/45">
                        {section.description}
                      </p>
                    </div>

                    <span className="text-2xl font-bold text-amber-300">
                      {section.value}
                    </span>
                  </div>

                  <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/35">
                    {section.label}
                  </div>
                </Link>
              ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-2">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Quick Operations
                    </h2>

                    <p className="mt-1 text-sm text-white/40">
                      Common restaurant management actions.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/kitchen"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold hover:bg-white/10"
                  >
                    Kitchen Orders
                  </Link>

                  <Link
                    href="/delivery"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold hover:bg-white/10"
                  >
                    Delivery Control
                  </Link>

                  <Link
                    href="/rider"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold hover:bg-white/10"
                  >
                    Rider Dashboard
                  </Link>

                  <Link
                    href="/menu"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold hover:bg-white/10"
                  >
                    Menu
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold">
                    Delivery Overview
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Current delivery configuration.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-4">
                    <span className="text-sm text-white/55">
                      Active Zones
                    </span>

                    <span className="font-bold text-blue-300">
                      {activeZones}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-4">
                    <span className="text-sm text-white/55">
                      Active Riders
                    </span>

                    <span className="font-bold text-emerald-300">
                      {activeRiders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-4">
                    <span className="text-sm text-white/55">
                      Active Assignments
                    </span>

                    <span className="font-bold text-amber-300">
                      {activeAssignments}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] px-4 py-4">
                    <div className="text-xs uppercase tracking-wider text-amber-300/50">
                      Shop
                    </div>

                    <div className="mt-1 font-semibold">
                      New Market, Rajshahi
                    </div>

                    <div className="mt-1 text-sm text-white/45">
                      Delivery coverage: Whole Rajshahi City
                    </div>
                  </div>
                </div>
              </div>

            </section>
          </>
        )}
      </div>
    </main>
  );
}
