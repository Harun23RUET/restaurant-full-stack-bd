"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const API = "http://localhost:4000/api";

type OrderItem = {
  id: string;
  itemNameSnapshot?: string;
  unitPrice?: string | number;
  quantity?: number;
  subtotal?: string | number;
};

type Order = {
  id: string;
  orderNumber?: string;
  orderType?: string;
  status?: string;
  subtotal?: string | number;
  deliveryFee?: string | number;
  tax?: string | number;
  serviceCharge?: string | number;
  discount?: string | number;
  total?: string | number;
  paymentStatus?: string;
  specialInstructions?: string | null;
  createdAt?: string;
  items?: OrderItem[];
  deliveryAssignment?: {
    status?: string;
    rider?: {
      name?: string;
      phone?: string;
    };
  } | null;
};

const steps = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function money(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function readableStatus(status?: string) {
  return String(status || "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrder() {
    if (!orderId) return;

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token") || ""
          : "";

      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API}/orders/${encodeURIComponent(orderId)}`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Unable to load order (${response.status})`,
        );
      }

      setOrder(data);
      setError("");
    } catch (err: any) {
      setError(err?.message || "Unable to load this order.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrder();

    const timer = window.setInterval(() => {
      void loadOrder();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-orange-400" />
          <p className="text-slate-300">Loading order...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-xl">
          <Link
            href="/account"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Account
          </Link>

          <div className="mt-6 rounded-3xl border border-red-400/20 bg-red-400/10 p-6">
            <h1 className="text-2xl font-black">Order unavailable</h1>
            <p className="mt-2 text-red-200">
              {error || "The requested order could not be loaded."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const status = String(order.status || "NEW").toUpperCase();
  const currentIndex = steps.indexOf(status);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/account"
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Back to Account
            </Link>

            <h1 className="mt-2 text-3xl font-black">Track Order</h1>
          </div>

          <Link
            href="/menu"
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black hover:bg-orange-400"
          >
            Back to Menu
          </Link>
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/20 via-white/[0.05] to-transparent p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                Order Number
              </p>

              <h2 className="mt-1 text-3xl font-black">
                {order.orderNumber || order.id}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs text-slate-500">Current Status</p>
              <p className="mt-1 font-black text-orange-300">
                {readableStatus(status)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-xl font-black">Order Progress</h3>

          <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex min-w-[760px] items-start">
              {steps.map((step, index) => {
                const done =
                  currentIndex >= 0 && index <= currentIndex;

                const active = index === currentIndex;

                return (
                  <div key={step} className="flex flex-1 items-start">
                    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-black ${
                          done
                            ? "border-orange-400 bg-orange-500 text-white"
                            : "border-white/10 bg-white/[0.03] text-slate-500"
                        } ${active ? "ring-4 ring-orange-500/20" : ""}`}
                      >
                        {done ? "✓" : index + 1}
                      </div>

                      <p
                        className={`mt-3 text-xs font-bold ${
                          done ? "text-white" : "text-slate-500"
                        }`}
                      >
                        {readableStatus(step)}
                      </p>
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={`mt-5 h-0.5 w-full ${
                          currentIndex > index
                            ? "bg-orange-500"
                            : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            This page refreshes automatically every 5 seconds.
          </p>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-xl font-black">Items</h3>

            <div className="mt-4 space-y-3">
              {(order.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div>
                    <p className="font-black">
                      {item.itemNameSnapshot || "Food Item"}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.quantity || 0} ×{" "}
                      {money(item.unitPrice)} BDT
                    </p>
                  </div>

                  <p className="font-black">
                    {money(item.subtotal)} BDT
                  </p>
                </div>
              ))}

              {(order.items || []).length === 0 && (
                <p className="text-slate-400">No items available.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-xl font-black">Payment Summary</h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Subtotal</span>
                <span>{money(order.subtotal)} BDT</span>
              </div>

              <div className="flex justify-between gap-4 text-slate-400">
                <span>Delivery Fee</span>
                <span>{money(order.deliveryFee)} BDT</span>
              </div>

              <div className="flex justify-between gap-4 text-slate-400">
                <span>Tax</span>
                <span>{money(order.tax)} BDT</span>
              </div>

              <div className="flex justify-between gap-4 text-slate-400">
                <span>Service Charge</span>
                <span>{money(order.serviceCharge)} BDT</span>
              </div>

              <div className="flex justify-between gap-4 text-slate-400">
                <span>Discount</span>
                <span>- {money(order.discount)} BDT</span>
              </div>

              <div className="my-3 h-px bg-white/10" />

              <div className="flex justify-between gap-4 text-base">
                <span className="font-bold">Total</span>
                <span className="font-black text-orange-300">
                  {money(order.total)} BDT
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-slate-500">Payment Status</p>
                <p className="mt-1 font-black">
                  {readableStatus(order.paymentStatus)}
                </p>
              </div>
            </div>
          </section>
        </div>

        {order.deliveryAssignment && (
          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-xl font-black">Delivery</h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Assignment Status</p>
                <p className="mt-1 font-bold">
                  {readableStatus(order.deliveryAssignment.status)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Rider</p>
                <p className="mt-1 font-bold">
                  {order.deliveryAssignment.rider?.name ||
                    "Not assigned"}
                </p>

                {order.deliveryAssignment.rider?.phone && (
                  <p className="mt-1 text-sm text-slate-400">
                    {order.deliveryAssignment.rider.phone}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {order.specialInstructions && (
          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-xl font-black">
              Special Instructions
            </h3>

            <p className="mt-3 text-slate-300">
              {order.specialInstructions}
            </p>
          </section>
        )}

        <p className="mt-8 text-center text-xs text-slate-600">
          Order created{" "}
          {order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : ""}
        </p>
      </div>
    </main>
  );
}
