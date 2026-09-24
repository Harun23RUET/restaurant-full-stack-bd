"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";

const STATUS_OPTIONS = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

type AnyRecord = Record<string, any>;

function money(value: any) {
  const n = Number(value ?? 0);
  return `৳${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

function dateText(value: any) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(status: string) {
  return String(status || "-")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusClass(status: string) {
  switch (status) {
    case "NEW":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "CONFIRMED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "PREPARING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "READY":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "OUT_FOR_DELIVERY":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "COMPLETED":
      return "bg-green-50 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function unwrapOrders(result: any): AnyRecord[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.orders)) return result.orders;
  if (Array.isArray(result?.data?.orders)) return result.data.orders;
  return [];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders(initial = false) {
    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      setError("");

      const result = await apiGet("/orders");
      setOrders(unwrapOrders(result));
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not load orders. Make sure you are logged in as an admin/manager."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders(true);

    const timer = setInterval(() => {
      loadOrders(false);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  async function updateStatus(orderId: string, status: string) {
    try {
      setUpdatingId(orderId);
      setError("");

      await apiPut(`/orders/${orderId}/status`, { status });

      await loadOrders(false);
    } catch (err: any) {
      setError(err?.message || "Could not update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...orders]
      .filter((order) => {
        if (statusFilter !== "ALL" && order.status !== statusFilter) {
          return false;
        }

        const orderType =
          order.orderType ||
          order.type ||
          order.deliveryType ||
          "";

        if (typeFilter !== "ALL" && String(orderType) !== typeFilter) {
          return false;
        }

        if (!q) return true;

        const haystack = [
          order.id,
          order.orderNumber,
          order.customerName,
          order.customerPhone,
          order.phone,
          order.email,
          order.address,
          order.deliveryAddress,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      })
      .sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
      });
  }, [orders, search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = orders.length;

    const active = orders.filter(
      (o) =>
        !["DELIVERED", "COMPLETED", "CANCELLED"].includes(o.status)
    ).length;

    const preparing = orders.filter(
      (o) => o.status === "PREPARING"
    ).length;

    const ready = orders.filter((o) => o.status === "READY").length;

    const delivery = orders.filter(
      (o) => o.status === "OUT_FOR_DELIVERY"
    ).length;

    const completed = orders.filter(
      (o) => ["DELIVERED", "COMPLETED"].includes(o.status)
    ).length;

    return {
      total,
      active,
      preparing,
      ready,
      delivery,
      completed,
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">
              MARHABA DUM BIRYANI & LOUNGE
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Order Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor customer orders and manage the order workflow.
            </p>
          </div>

          <button
            onClick={() => loadOrders(false)}
            disabled={refreshing}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-500">Active</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {stats.active}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-500">Preparing</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {stats.preparing}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-500">Ready</p>
            <p className="mt-1 text-2xl font-bold text-cyan-600">
              {stats.ready}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-500">
              Out for Delivery
            </p>
            <p className="mt-1 text-2xl font-bold text-purple-600">
              {stats.delivery}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-500">Delivered</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {stats.completed}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer, phone, address..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="ALL">All Order Types</option>
              <option value="DELIVERY">Delivery</option>
              <option value="PICKUP">Pickup</option>
              <option value="DINE_IN">Dine In</option>
            </select>
          </div>
        </div>

        {/* Main content */}
        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-lg font-semibold text-slate-900">
              No orders found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing the search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const id = String(order.id);
              const expanded = expandedId === id;

              const customerName =
                order.customerName ||
                order.customer?.name ||
                order.user?.name ||
                "Customer";

              const customerPhone =
                order.customerPhone ||
                order.phone ||
                order.customer?.phone ||
                order.user?.phone ||
                "-";

              const address =
                order.deliveryAddress ||
                order.address ||
                order.customerAddress ||
                "-";

              const orderType =
                order.orderType ||
                order.type ||
                order.deliveryType ||
                "-";

              const total =
                order.total ??
                order.grandTotal ??
                order.amount ??
                0;

              const items =
                order.items ||
                order.orderItems ||
                order.products ||
                [];

              return (
                <div
                  key={id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"
                >
                  <div className="p-4 md:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900">
                            #{order.orderNumber || id.slice(-8)}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                              order.status
                            )}`}
                          >
                            {statusLabel(order.status)}
                          </span>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {String(orderType).replaceAll("_", " ")}
                          </span>
                        </div>

                        <div className="mt-2 grid gap-1 text-sm text-slate-600 md:grid-cols-2">
                          <div>
                            <span className="font-semibold text-slate-900">
                              Customer:
                            </span>{" "}
                            {customerName}
                          </div>

                          <div>
                            <span className="font-semibold text-slate-900">
                              Phone:
                            </span>{" "}
                            {customerPhone}
                          </div>

                          <div>
                            <span className="font-semibold text-slate-900">
                              Total:
                            </span>{" "}
                            {money(total)}
                          </div>

                          <div>
                            <span className="font-semibold text-slate-900">
                              Created:
                            </span>{" "}
                            {dateText(order.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row lg:items-center">
                        <select
                          value={order.status || "NEW"}
                          disabled={updatingId === id}
                          onChange={(e) =>
                            updateStatus(id, e.target.value)
                          }
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-orange-400 disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel(status)}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() =>
                            setExpandedId(expanded ? null : id)
                          }
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          {expanded ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-slate-100 bg-slate-50 p-4 md:p-5">

                      <div className="grid gap-4 lg:grid-cols-3">

                        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                          <h3 className="font-semibold text-slate-900">
                            Delivery / Customer
                          </h3>

                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold text-slate-900">
                                Name:
                              </span>{" "}
                              {customerName}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-900">
                                Phone:
                              </span>{" "}
                              {customerPhone}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-900">
                                Address:
                              </span>{" "}
                              {address}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                          <h3 className="font-semibold text-slate-900">
                            Payment
                          </h3>

                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold text-slate-900">
                                Method:
                              </span>{" "}
                              {order.paymentMethod ||
                                order.payment?.method ||
                                "Not specified"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-900">
                                Transaction:
                              </span>{" "}
                              {order.transactionId ||
                                order.payment?.transactionId ||
                                "-"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-900">
                                Payment Status:
                              </span>{" "}
                              {order.payment?.status ||
                                order.paymentStatus ||
                                "-"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-900">
                                Amount:
                              </span>{" "}
                              {money(
                                order.payment?.amount ??
                                  order.total ??
                                  0
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                          <h3 className="font-semibold text-slate-900">
                            Discount / Coupon
                          </h3>

                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold text-slate-900">
                                Coupon:
                              </span>{" "}
                              {order.couponCode ||
                                order.coupon?.code ||
                                "-"}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-900">
                                Discount:
                              </span>{" "}
                              {money(
                                order.discount ??
                                  order.discountAmount ??
                                  0
                              )}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-900">
                                Subtotal:
                              </span>{" "}
                              {money(order.subtotal ?? 0)}
                            </p>

                            <p>
                              <span className="font-semibold text-slate-900">
                                Total:
                              </span>{" "}
                              {money(total)}
                            </p>
                          </div>
                        </div>

                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                        <h3 className="font-semibold text-slate-900">
                          Order Items
                        </h3>

                        {Array.isArray(items) && items.length > 0 ? (
                          <div className="mt-3 divide-y divide-slate-100">
                            {items.map((item: AnyRecord, index: number) => {
                              const name =
                                item.name ||
                                item.menuItem?.name ||
                                item.product?.name ||
                                `Item ${index + 1}`;

                              const qty =
                                item.quantity ??
                                item.qty ??
                                1;

                              const price =
                                item.price ??
                                item.unitPrice ??
                                item.menuItem?.price ??
                                0;

                              const lineTotal =
                                item.total ??
                                item.lineTotal ??
                                Number(price) * Number(qty);

                              return (
                                <div
                                  key={
                                    item.id ||
                                    `${id}-${index}`
                                  }
                                  className="flex items-center justify-between gap-4 py-3 text-sm"
                                >
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-900">
                                      {name}
                                    </p>
                                    <p className="text-slate-500">
                                      Qty: {qty} × {money(price)}
                                    </p>
                                  </div>

                                  <p className="shrink-0 font-semibold text-slate-900">
                                    {money(lineTotal)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">
                            Item details are not available in this response.
                          </p>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-400">
          Auto-refreshes every 8 seconds
        </div>

      </div>
    </main>
  );
}
