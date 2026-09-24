"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";

type Order = {
  id: string;
  status?: string;
  orderType?: string;
  createdAt?: string;
  grandTotal?: number;
  total?: number;
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

function dateKey(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const result = await apiGet<unknown>("/orders");
      setOrders(listFrom<Order>(result));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();

    const timer = window.setInterval(() => {
      loadReports();
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  const totalSales = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum + Number(order.grandTotal ?? order.total ?? 0),
        0
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "DELIVERED" ||
          order.status === "COMPLETED"
      ),
    [orders]
  );

  const cancelledOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "CANCELLED"
      ),
    [orders]
  );

  const deliveryOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          String(order.orderType).toUpperCase() ===
          "DELIVERY"
      ),
    [orders]
  );

  const takeawayOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          String(order.orderType).toUpperCase() ===
          "TAKEAWAY"
      ),
    [orders]
  );

  const dineInOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          String(order.orderType).toUpperCase() ===
          "DINE_IN"
      ),
    [orders]
  );

  const averageOrderValue =
    orders.length > 0 ? totalSales / orders.length : 0;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const order of orders) {
      const status = order.status || "UNKNOWN";
      counts[status] = (counts[status] || 0) + 1;
    }

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );
  }, [orders]);

  const dailySales = useMemo(() => {
    const map = new Map<
      string,
      { date: string; orders: number; sales: number }
    >();

    for (const order of orders) {
      const key = dateKey(order.createdAt);

      if (!key) continue;

      const current = map.get(key) || {
        date: key,
        orders: 0,
        sales: 0,
      };

      current.orders += 1;
      current.sales += Number(
        order.grandTotal ?? order.total ?? 0
      );

      map.set(key, current);
    }

    return Array.from(map.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#0c0c0d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Business Intelligence
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Shop: New Market, Rajshahi
              <span className="mx-2 text-white/20">•</span>
              All amounts in BDT ৳
            </p>
          </div>

          <button
            type="button"
            onClick={loadReports}
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
            Loading reports...
          </div>
        ) : (
          <>
            <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Total Orders
                </div>

                <div className="mt-2 text-3xl font-bold text-amber-300">
                  {orders.length}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Total Sales
                </div>

                <div className="mt-2 text-xl font-bold text-emerald-300">
                  {money(totalSales)}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Average Order
                </div>

                <div className="mt-2 text-xl font-bold text-blue-300">
                  {money(averageOrderValue)}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Completed
                </div>

                <div className="mt-2 text-3xl font-bold text-emerald-300">
                  {completedOrders.length}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Delivery
                </div>

                <div className="mt-2 text-3xl font-bold text-purple-300">
                  {deliveryOrders.length}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Cancelled
                </div>

                <div className="mt-2 text-3xl font-bold text-red-300">
                  {cancelledOrders.length}
                </div>
              </div>

            </section>

            <section className="mb-8 grid gap-5 lg:grid-cols-3">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-lg font-semibold">
                  Order Types
                </h2>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
                    <span className="text-sm text-white/55">
                      Delivery
                    </span>

                    <span className="font-bold text-purple-300">
                      {deliveryOrders.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
                    <span className="text-sm text-white/55">
                      Takeaway
                    </span>

                    <span className="font-bold text-blue-300">
                      {takeawayOrders.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
                    <span className="text-sm text-white/55">
                      Dine In
                    </span>

                    <span className="font-bold text-amber-300">
                      {dineInOrders.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold">
                  Order Status
                </h2>

                {statusCounts.length === 0 ? (
                  <div className="mt-5 text-sm text-white/40">
                    No order data yet.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {statusCounts.map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                      >
                        <span className="text-sm font-medium text-white/65">
                          {status.replaceAll("_", " ")}
                        </span>

                        <span className="text-xl font-bold text-amber-300">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </section>

            <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">
                  Recent Daily Sales
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Latest 14 days with recorded orders.
                </p>
              </div>

              {dailySales.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
                  No sales data yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/35">
                        <th className="px-4 py-3">
                          Date
                        </th>

                        <th className="px-4 py-3">
                          Orders
                        </th>

                        <th className="px-4 py-3 text-right">
                          Sales
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dailySales.map((day) => (
                        <tr
                          key={day.date}
                          className="border-b border-white/5"
                        >
                          <td className="px-4 py-4 text-sm text-white/70">
                            {formatDate(day.date)}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-white/70">
                            {day.orders}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-amber-300">
                            {money(day.sales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">
                  Latest Orders
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Recent activity from the restaurant.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
                  No orders yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders
                    .slice()
                    .sort((a, b) =>
                      String(b.createdAt || "").localeCompare(
                        String(a.createdAt || "")
                      )
                    )
                    .slice(0, 10)
                    .map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="break-all text-sm font-semibold">
                            {order.id}
                          </div>

                          <div className="mt-1 text-xs text-white/40">
                            {order.createdAt
                              ? formatDate(order.createdAt)
                              : "Date unavailable"}

                            <span className="mx-2 text-white/20">
                              •
                            </span>

                            {String(
                              order.orderType || "UNKNOWN"
                            ).replaceAll("_", " ")}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/55">
                            {String(
                              order.status || "UNKNOWN"
                            ).replaceAll("_", " ")}
                          </span>

                          <span className="font-bold text-amber-300">
                            {money(
                              Number(
                                order.grandTotal ??
                                  order.total ??
                                  0
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
