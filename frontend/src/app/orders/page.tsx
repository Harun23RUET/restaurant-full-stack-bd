"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../lib/api";
import { getToken } from "../../lib/auth";

type OrderItem = {
  id?: string;
  itemNameSnapshot?: string;
  quantity?: number;
  subtotal?: number | string;
  unitPrice?: number | string;
};

type Order = {
  id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  orderType?: string;
  total?: number | string;
  subtotal?: number | string;
  createdAt?: string;
  items?: OrderItem[];
};

function money(value: unknown) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusClass(status: string) {
  switch (status) {
    case "DELIVERED":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    case "PREPARING":
    case "READY":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-orange-50 text-orange-700";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setError("");

        const token = getToken();

        if (!token) {
          window.location.href = "/account";
          return;
        }

        const response = await apiGet<Order[] | { data?: Order[]; items?: Order[] }>(
          "/orders/my",
        );

        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.items)
              ? response.items
              : [];

        setOrders(list);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your orders.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const orderCountText = useMemo(() => {
    if (orders.length === 0) return "No orders yet";
    if (orders.length === 1) return "1 order";
    return `${orders.length} orders`;
  }, [orders.length]);

  return (
    <main className="min-h-screen bg-[#fffaf5] text-slate-900">
      <section className="marhaba-gradient">
        <div className="marhaba-shell py-8 sm:py-10">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="marhaba-pill inline-flex">
                ORDER HISTORY
              </p>

              <h1 className="marhaba-title mt-3">
                My Orders
              </h1>

              <p className="marhaba-muted mt-2">
                Track your previous orders and open their details.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="marhaba-btn marhaba-btn-soft"
              >
                Browse Menu
              </Link>

              <Link
                href="/cart"
                className="marhaba-btn marhaba-btn-primary"
              >
                Open Cart
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-orange-100 bg-white/90 px-5 py-4 shadow-sm">
            <div className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">
              {orderCountText}
            </div>
          </div>

        </div>
      </section>

      <section className="marhaba-shell marhaba-section-space">
        {loading && (
          <div className="marhaba-soft-card p-8 text-center">
            <div className="text-lg font-extrabold text-slate-700">
              Loading orders...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 font-bold text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="marhaba-soft-card p-10 text-center">
            <h2 className="text-2xl font-black text-slate-900">
              No orders yet
            </h2>

            <p className="marhaba-muted mx-auto mt-2 max-w-xl">
              Your completed and active orders will appear here after you place one.
            </p>

            <Link
              href="/menu"
              className="marhaba-btn marhaba-btn-primary mt-6 inline-flex"
            >
              Start Ordering
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = (order.items ?? []).reduce(
                (sum, item) => sum + Number(item.quantity ?? 0),
                0,
              );

              const status = order.status ?? "NEW";

              return (
                <article
                  key={order.id}
                  className="marhaba-soft-card overflow-hidden"
                >
                  <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-black text-slate-900">
                          {order.orderNumber || `Order ${order.id.slice(0, 8)}`}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusClass(
                            status,
                          )}`}
                        >
                          {status.replaceAll("_", " ")}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">
                        <span>
                          Type: {order.orderType || "—"}
                        </span>

                        <span>
                          Items: {itemCount}
                        </span>

                        <span>
                          Payment: {order.paymentStatus || "—"}
                        </span>

                        {order.createdAt && (
                          <span>
                            {new Date(order.createdAt).toLocaleString("en-BD")}
                          </span>
                        )}
                      </div>

                      {!!order.items?.length && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {order.items.slice(0, 4).map((item, index) => (
                            <span
                              key={item.id || `${order.id}-${index}`}
                              className="rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-orange-800"
                            >
                              {item.itemNameSnapshot || "Item"} ×{" "}
                              {Number(item.quantity ?? 0)}
                            </span>
                          ))}

                          {order.items.length > 4 && (
                            <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">
                              +{order.items.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-sm ring-1 ring-orange-100">
                        <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Total
                        </div>

                        <div className="mt-1 text-2xl font-black text-orange-700">
                          {money(order.total)}
                        </div>
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="marhaba-btn marhaba-btn-primary justify-center"
                      >
                        View Order
                      </Link>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
