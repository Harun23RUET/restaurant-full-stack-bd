"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { getUserId } from "@/lib/auth";

type Rider = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  isActive: boolean;
};

type Assignment = {
  id: string;
  orderId: string;
  riderId: string;
  status: string;
  assignedAt?: string;
  pickedUpAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  rider?: {
    id?: string;
    name?: string;
    phone?: string;
  };
  order?: {
    id?: string;
    status?: string;
    orderType?: string;
    total?: number;
    grandTotal?: number;
    deliveryAddress?: {
      address?: string;
      building?: string;
      roomNumber?: string;
      label?: string;
    };
    specialInstructions?: string;
    items?: Array<{
      id?: string;
      quantity?: number;
      unitPrice?: number;
      totalPrice?: number;
      menuItem?: {
        name?: string;
      };
    }>;
  };
};

const statuses = [
  "ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

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

function money(value: number | undefined | null) {
  return `BDT ৳${Number(value ?? 0).toFixed(2)}`;
}

function nextStatus(current: string) {
  const flow = [
    "ASSIGNED",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const index = flow.indexOf(current);

  if (index === -1 || index === flow.length - 1) {
    return null;
  }

  return flow[index + 1];
}

export default function RiderPage() {
  const [currentUserId, setCurrentUserId] = useState("");
  const [rider, setRider] = useState<Rider | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDashboard() {
    try {
      setError("");

      const userId = getUserId() || "";
      setCurrentUserId(userId);

      if (!userId) {
        setError("No logged-in user found. Please login first.");
        setRider(null);
        setAssignments([]);
        return;
      }

      const [ridersRes, assignmentsRes] = await Promise.all([
        apiGet<unknown>("/delivery/riders"),
        apiGet<unknown>("/delivery/assignments"),
      ]);

      const allRiders = listFrom<Rider>(ridersRes);
      const matchedRider =
        allRiders.find((item) => item.userId === userId) ?? null;

      setRider(matchedRider);

      if (!matchedRider) {
        setAssignments([]);
        setError(
          "Your account is not linked to a delivery rider profile yet."
        );
        return;
      }

      const allAssignments =
        listFrom<Assignment>(assignmentsRes);

      setAssignments(
        allAssignments.filter(
          (assignment) => assignment.riderId === matchedRider.id
        )
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to load rider dashboard."
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

  async function updateStatus(
    assignment: Assignment,
    status: string
  ) {
    try {
      setError("");
      setSuccess("");
      setUpdatingId(assignment.id);

      await apiPut(
        `/delivery/assignments/${assignment.id}/status`,
        { status }
      );

      setSuccess(`Order ${assignment.orderId} updated to ${status}.`);

      await loadDashboard();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update delivery status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  const activeAssignments = useMemo(
    () =>
      assignments.filter(
        (item) => item.status !== "DELIVERED" && item.status !== "CANCELLED"
      ),
    [assignments]
  );

  const completedAssignments = useMemo(
    () =>
      assignments.filter(
        (item) =>
          item.status === "DELIVERED" ||
          item.status === "CANCELLED"
      ),
    [assignments]
  );

  return (
    <main className="min-h-screen bg-[#0c0c0d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Rider Dashboard
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              My Deliveries
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Shop: New Market, Rajshahi
              <span className="mx-2 text-white/20">•</span>
              Coverage: Whole Rajshahi City
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

        {(error || success) && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {error || success}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
            Loading rider dashboard...
          </div>
        ) : (
          <>
            <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Rider
                </div>
                <div className="mt-2 truncate text-lg font-bold">
                  {rider?.name || "Not linked"}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Phone
                </div>
                <div className="mt-2 text-lg font-bold">
                  {rider?.phone || "—"}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Active Deliveries
                </div>
                <div className="mt-2 text-3xl font-bold text-amber-300">
                  {activeAssignments.length}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs text-white/40">
                  Completed
                </div>
                <div className="mt-2 text-3xl font-bold text-emerald-300">
                  {
                    completedAssignments.filter(
                      (item) => item.status === "DELIVERED"
                    ).length
                  }
                </div>
              </div>
            </section>

            {rider && (
              <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Rider Account
                    </h2>

                    <p className="mt-1 break-all text-xs text-white/35">
                      User ID: {currentUserId}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      rider.isActive
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    {rider.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </section>
            )}

            <section className="mb-10">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  Active Deliveries
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  Update your assigned orders as you complete each step.
                </p>
              </div>

              {activeAssignments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
                  <p className="text-lg font-medium">
                    No active deliveries
                  </p>
                  <p className="mt-2 text-sm text-white/40">
                    New assignments will appear automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {activeAssignments.map((assignment) => {
                    const next = nextStatus(assignment.status);
                    const order = assignment.order;

                    const addressParts = [
                      order?.deliveryAddress?.label,
                      order?.deliveryAddress?.address,
                      order?.deliveryAddress?.building,
                      order?.deliveryAddress?.roomNumber
                        ? `Room ${order.deliveryAddress.roomNumber}`
                        : "",
                    ].filter(Boolean);

                    return (
                      <article
                        key={assignment.id}
                        className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl sm:p-6"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                              Delivery Order
                            </p>

                            <h3 className="mt-2 break-all text-xl font-bold">
                              {assignment.orderId}
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                {assignment.status}
                              </span>

                              {order?.orderType && (
                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                                  {order.orderType}
                                </span>
                              )}

                              {(order?.grandTotal !== undefined ||
                                order?.total !== undefined) && (
                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/55">
                                  {money(
                                    order.grandTotal ??
                                      order.total
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {next && (
                            <button
                              type="button"
                              disabled={
                                updatingId === assignment.id
                              }
                              onClick={() =>
                                updateStatus(
                                  assignment,
                                  next
                                )
                              }
                              className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingId === assignment.id
                                ? "Updating..."
                                : `Mark ${next.replaceAll("_", " ")}`}
                            </button>
                          )}
                        </div>

                        {addressParts.length > 0 && (
                          <div className="mt-5 rounded-2xl border border-blue-400/15 bg-blue-400/[0.06] p-4">
                            <div className="text-xs uppercase tracking-wider text-blue-300/60">
                              Delivery Address
                            </div>

                            <div className="mt-2 text-sm leading-6 text-white/80">
                              {addressParts.join(" • ")}
                            </div>
                          </div>
                        )}

                        {order?.specialInstructions && (
                          <div className="mt-4 rounded-2xl border border-orange-400/15 bg-orange-400/[0.05] p-4">
                            <div className="text-xs uppercase tracking-wider text-orange-300/60">
                              Special Instructions
                            </div>

                            <div className="mt-2 text-sm text-white/75">
                              {order.specialInstructions}
                            </div>
                          </div>
                        )}

                        {order?.items &&
                          order.items.length > 0 && (
                            <div className="mt-5">
                              <div className="mb-3 text-sm font-semibold">
                                Items
                              </div>

                              <div className="space-y-2">
                                {order.items.map(
                                  (item, index) => (
                                    <div
                                      key={
                                        item.id ||
                                        `${assignment.id}-${index}`
                                      }
                                      className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3"
                                    >
                                      <span className="text-sm text-white/70">
                                        {item.quantity ?? 1} ×{" "}
                                        {item.menuItem
                                          ?.name ||
                                          "Menu Item"}
                                      </span>

                                      {item.totalPrice !==
                                        undefined && (
                                        <span className="text-sm text-white/55">
                                          {money(
                                            item.totalPrice
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  Delivery History
                </h2>
              </div>

              {completedAssignments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-white/40">
                  No completed delivery history yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {completedAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="break-all text-sm font-semibold">
                          {assignment.orderId}
                        </div>

                        <div className="mt-1 text-xs text-white/40">
                          {assignment.deliveredAt
                            ? `Delivered ${new Date(
                                assignment.deliveredAt
                              ).toLocaleString()}`
                            : assignment.status}
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          assignment.status === "DELIVERED"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {assignment.status}
                      </span>
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
