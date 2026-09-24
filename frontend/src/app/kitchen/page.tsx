"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";

type AnyRecord = Record<string, any>;

const ACTIVE_STATUSES = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
];

const ALL_STATUSES = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

function unwrap(result: any): AnyRecord[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.orders)) return result.orders;
  if (Array.isArray(result?.data?.orders)) return result.data.orders;
  return [];
}

function money(value: any) {
  const n = Number(value ?? 0);
  return `৳${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

function label(value: string) {
  return String(value || "-")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function badge(status: string) {
  switch (status) {
    case "NEW":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "CONFIRMED":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "PREPARING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "READY":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "OUT_FOR_DELIVERY":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "DELIVERED":
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-red-200 bg-red-50 text-red-700";
  }
}

function nextStatus(status: string) {
  if (status === "NEW") return "CONFIRMED";
  if (status === "CONFIRMED") return "PREPARING";
  if (status === "PREPARING") return "READY";
  if (status === "READY") return "OUT_FOR_DELIVERY";
  return null;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<AnyRecord[]>([]);
  const [tab, setTab] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load(initial = false) {
    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      setError("");

      const result = await apiGet("/orders");
      setOrders(unwrap(result));
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not load kitchen orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(true);

    const timer = setInterval(() => {
      load(false);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  async function changeStatus(id: string, status: string) {
    try {
      setUpdatingId(id);
      setError("");

      await apiPut(`/orders/${id}/status`, {
        status,
      });

      await load(false);
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not update status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = useMemo(() => {
    return {
      new: orders.filter((o) => o.status === "NEW").length,
      confirmed: orders.filter(
        (o) => o.status === "CONFIRMED"
      ).length,
      preparing: orders.filter(
        (o) => o.status === "PREPARING"
      ).length,
      ready: orders.filter(
        (o) => o.status === "READY"
      ).length,
    };
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const source =
      tab === "ACTIVE"
        ? orders.filter((o) =>
            ACTIVE_STATUSES.includes(o.status)
          )
        : orders.filter(
            (o) => o.status === tab
          );

    return [...source].sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
    );
  }, [orders, tab]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-600">
              MARHABA DUM BIRYANI & LOUNGE
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Kitchen Control
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage the live kitchen queue from confirmation to ready for
              dispatch.
            </p>
          </div>

          <button
            onClick={() => load(false)}
            disabled={refreshing}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh Queue"}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-bold text-blue-600">
              NEW
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">
              {counts.new}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-bold text-indigo-600">
              CONFIRMED
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">
              {counts.confirmed}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-bold text-amber-600">
              PREPARING
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">
              {counts.preparing}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-bold text-cyan-600">
              READY
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">
              {counts.ready}
            </p>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
          <div className="flex min-w-max gap-2">
            {[
              ["ACTIVE", "Active Queue"],
              ["NEW", "New"],
              ["CONFIRMED", "Confirmed"],
              ["PREPARING", "Preparing"],
              ["READY", "Ready"],
              ["OUT_FOR_DELIVERY", "Out for Delivery"],
              ["DELIVERED", "Delivered"],
            ].map(([value, text]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`rounded-xl px-4 py-2.5 text-sm font-black ${
                  tab === value
                    ? "bg-orange-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[350px] animate-pulse rounded-3xl bg-white shadow-sm"
              />
            ))}
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-3xl bg-white p-14 text-center shadow-sm ring-1 ring-slate-100">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-orange-50" />

            <h2 className="mt-5 text-xl font-black text-slate-900">
              No orders in this queue
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New orders will appear automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {visibleOrders.map((order) => {
              const id = String(order.id);

              const items =
                order.items ||
                order.orderItems ||
                [];

              const customer =
                order.customerName ||
                order.customer?.name ||
                order.user?.name ||
                "Customer";

              const phone =
                order.customerPhone ||
                order.phone ||
                order.customer?.phone ||
                order.user?.phone ||
                "-";

              const total =
                order.total ??
                order.grandTotal ??
                order.amount ??
                0;

              const next =
                nextStatus(order.status);

              const expanded =
                expandedId === id;

              return (
                <article
                  key={id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100"
                >
                  <div className="p-5 md:p-6">

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-black text-slate-900">
                            #{order.orderNumber || id.slice(-8)}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${badge(
                              order.status
                            )}`}
                          >
                            {label(order.status)}
                          </span>
                        </div>

                        <p className="mt-2 text-xs font-medium text-slate-400">
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleString("en-BD", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "-"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 text-xl font-black text-slate-900">
                          {money(total)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Customer
                        </p>

                        <p className="mt-1 truncate text-sm font-black text-slate-800">
                          {customer}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 truncate text-sm font-black text-slate-800">
                          {phone}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-900">
                          Order Items
                        </h2>

                        <span className="text-xs font-bold text-slate-400">
                          {Array.isArray(items)
                            ? items.length
                            : 0}{" "}
                          line(s)
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {(Array.isArray(items)
                          ? items.slice(
                              0,
                              expanded
                                ? undefined
                                : 3
                            )
                          : []
                        ).map(
                          (
                            item: AnyRecord,
                            index: number
                          ) => {
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

                            return (
                              <div
                                key={
                                  item.id ||
                                  `${id}-${index}`
                                }
                                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-3 py-3"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-800">
                                    {name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    Qty {qty}
                                  </p>
                                </div>

                                <p className="shrink-0 text-sm font-black text-slate-900">
                                  {money(
                                    Number(price) *
                                      Number(qty)
                                  )}
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>

                      {Array.isArray(items) &&
                        items.length > 3 && (
                          <button
                            onClick={() =>
                              setExpandedId(
                                expanded
                                  ? null
                                  : id
                              )
                            }
                            className="mt-3 text-xs font-black text-orange-600"
                          >
                            {expanded
                              ? "Show less"
                              : `Show all ${items.length} items`}
                          </button>
                        )}
                    </div>

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">

                      {next ? (
                        <button
                          disabled={
                            updatingId === id
                          }
                          onClick={() =>
                            changeStatus(
                              id,
                              next
                            )
                          }
                          className="rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white hover:bg-orange-700 disabled:opacity-60"
                        >
                          {updatingId === id
                            ? "Updating..."
                            : `Move to ${label(
                                next
                              )}`}
                        </button>
                      ) : (
                        <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-500">
                          No kitchen action
                        </div>
                      )}

                      <select
                        value={
                          order.status || "NEW"
                        }
                        disabled={
                          updatingId === id
                        }
                        onChange={(e) =>
                          changeStatus(
                            id,
                            e.target.value
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-orange-400"
                      >
                        {ALL_STATUSES.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {label(status)}
                            </option>
                          )
                        )}
                      </select>

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-400">
          Kitchen board auto-refreshes every 5 seconds.
        </div>
      </div>
    </main>
  );
}
