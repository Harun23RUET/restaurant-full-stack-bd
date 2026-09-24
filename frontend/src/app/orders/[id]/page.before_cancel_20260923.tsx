"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

type OrderItem = {
  id?: string;
  itemNameSnapshot?: string;
  quantity?: number;
  unitPrice?: number | string;
  subtotal?: number | string;
};

type Order = {
  id: string;
  orderNumber?: string;
  status?: OrderStatus;
  orderType?: string;
  paymentStatus?: string;
  subtotal?: number | string;
  deliveryFee?: number | string;
  tax?: number | string;
  serviceCharge?: number | string;
  discount?: number | string;
  total?: number | string;
  createdAt?: string;
  specialInstructions?: string;
  items?: OrderItem[];
};

const timeline: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
];

function money(value: unknown) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function statusClass(status?: string) {
  if (status === "COMPLETED" || status === "DELIVERED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "CANCELLED") {
    return "bg-red-50 text-red-700";
  }

  if (status === "PREPARING" || status === "READY") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-orange-50 text-orange-700";
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrder(showLoading = false) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await apiGet<Order>(
        `/orders/${orderId}`,
      );

      setOrder(response);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load this order.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!orderId) return;

    loadOrder(true);

    const timer = window.setInterval(() => {
      loadOrder(false);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [orderId]);

  const currentStatus = order?.status ?? "NEW";
  const currentIndex = timeline.indexOf(currentStatus);

  return (
    <main className="min-h-screen bg-[#fffaf5] text-slate-900">
      <section className="marhaba-gradient">
        <div className="marhaba-shell py-8 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="marhaba-pill inline-flex">
                ORDER TRACKING
              </p>

              <h1 className="marhaba-title mt-3">
                {order?.orderNumber || "Order Details"}
              </h1>

              <p className="marhaba-muted mt-2">
                This page refreshes automatically every 5 seconds.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/orders"
                className="marhaba-btn marhaba-btn-soft"
              >
                My Orders
              </Link>

              <Link
                href="/menu"
                className="marhaba-btn marhaba-btn-primary"
              >
                Browse Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="marhaba-shell marhaba-section-space">
        {loading && !order && (
          <div className="marhaba-soft-card p-8 text-center font-extrabold">
            Loading order...
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 font-bold text-red-700">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-5">
            <div className="marhaba-soft-card p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Current Status
                  </p>

                  <div
                    className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-black uppercase ${statusClass(order.status)}`}
                  >
                    {(order.status ?? "NEW").replaceAll("_", " ")}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Total
                  </p>
                  <p className="mt-1 text-3xl font-black text-orange-700">
                    {money(order.total)}
                  </p>
                </div>
              </div>

              {currentStatus !== "CANCELLED" && (
                <div className="mt-8 overflow-x-auto">
                  <div className="flex min-w-[760px] items-start">
                    {timeline.map((status, index) => {
                      const done =
                        currentIndex >= index &&
                        currentIndex >= 0;

                      const active = currentStatus === status;

                      return (
                        <div
                          key={status}
                          className="flex flex-1 items-start"
                        >
                          <div className="flex min-w-0 flex-1 flex-col items-center">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black ${
                                done
                                  ? "border-orange-500 bg-orange-500 text-white"
                                  : "border-slate-200 bg-white text-slate-400"
                              }`}
                            >
                              {done ? "✓" : index + 1}
                            </div>

                            <div
                              className={`mt-2 text-center text-xs font-black uppercase ${
                                active
                                  ? "text-orange-700"
                                  : "text-slate-500"
                              }`}
                            >
                              {status.replaceAll("_", " ")}
                            </div>
                          </div>

                          {index < timeline.length - 1 && (
                            <div
                              className={`mt-5 h-0.5 flex-1 ${
                                currentIndex > index
                                  ? "bg-orange-400"
                                  : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStatus === "CANCELLED" && (
                <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 font-bold text-red-700">
                  This order has been cancelled.
                </div>
              )}
            </div>

            <div className="marhaba-soft-card p-5 sm:p-7">
              <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                <span className="rounded-xl bg-orange-50 px-3 py-2">
                  Type: {order.orderType || "—"}
                </span>

                <span className="rounded-xl bg-orange-50 px-3 py-2">
                  Payment: {order.paymentStatus || "—"}
                </span>

                {order.createdAt && (
                  <span className="rounded-xl bg-orange-50 px-3 py-2">
                    {new Date(order.createdAt).toLocaleString("en-BD")}
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {(order.items ?? []).map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-orange-100"
                  >
                    <div>
                      <div className="font-black text-slate-900">
                        {item.itemNameSnapshot || "Item"}
                      </div>

                      <div className="mt-1 text-sm font-semibold text-slate-500">
                        Qty: {Number(item.quantity ?? 0)} · Unit:{" "}
                        {money(item.unitPrice)}
                      </div>
                    </div>

                    <div className="font-black text-orange-700">
                      {money(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-orange-100 pt-5">
                <div className="space-y-2 text-sm font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{money(order.subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{money(order.deliveryFee)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{money(order.tax)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Service Charge</span>
                    <span>{money(order.serviceCharge)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-{money(order.discount)}</span>
                  </div>

                  <div className="mt-3 flex justify-between border-t border-orange-100 pt-3 text-lg font-black text-slate-900">
                    <span>Total</span>
                    <span className="text-orange-700">
                      {money(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {order.specialInstructions && (
                <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4">
                  <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Instructions
                  </div>

                  <div className="mt-2 whitespace-pre-wrap text-sm font-semibold text-slate-700">
                    {order.specialInstructions}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
