"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

type DeliveryZone = {
  id: string;
  name: string;
  minimumOrder: number;
  deliveryFee: number;
  isActive: boolean;
};

type Rider = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  isActive: boolean;
};

type Order = {
  id: string;
  orderType?: string;
  status?: string;
  total?: number;
  grandTotal?: number;
  customer?: {
    name?: string;
  };
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
  };
};

type RiderForm = {
  userId: string;
  name: string;
  phone: string;
  isActive: boolean;
};

type ZoneForm = {
  name: string;
  minimumOrder: string;
  deliveryFee: string;
  isActive: boolean;
};

const emptyRiderForm: RiderForm = {
  userId: "",
  name: "",
  phone: "",
  isActive: true,
};

const emptyZoneForm: ZoneForm = {
  name: "",
  minimumOrder: "0",
  deliveryFee: "0",
  isActive: true,
};

const assignmentStatuses = [
  "ASSIGNED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function normalizeList<T>(value: unknown): T[] {
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

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState<
    "zones" | "riders" | "assignments"
  >("riders");

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingRiderId, setEditingRiderId] = useState<string | null>(null);
  const [riderForm, setRiderForm] = useState<RiderForm>(emptyRiderForm);

  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneForm, setZoneForm] = useState<ZoneForm>(emptyZoneForm);

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [selectedAssignmentStatus, setSelectedAssignmentStatus] =
    useState("ASSIGNED");
  const [assigning, setAssigning] = useState(false);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [zonesRes, ridersRes, ordersRes, assignmentsRes] =
        await Promise.all([
          apiGet<unknown>("/delivery/zones"),
          apiGet<unknown>("/delivery/riders"),
          apiGet<unknown>("/orders"),
          apiGet<unknown>("/delivery/assignments"),
        ]);

      setZones(normalizeList<DeliveryZone>(zonesRes));
      setRiders(normalizeList<Rider>(ridersRes));

      const allOrders = normalizeList<Order>(ordersRes);
      setOrders(
        allOrders.filter(
          (order) =>
            String(order.orderType ?? "").toUpperCase() === "DELIVERY"
        )
      );

      setAssignments(normalizeList<Assignment>(assignmentsRes));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load delivery data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function saveRider() {
    clearMessages();

    const userId = riderForm.userId.trim();
    const name = riderForm.name.trim();
    const phone = riderForm.phone.trim();

    if (!userId || !name || !phone) {
      setError("User ID, rider name and phone are required.");
      return;
    }

    try {
      setSaving(true);

      const body = {
        userId,
        name,
        phone,
        isActive: riderForm.isActive,
      };

      if (editingRiderId) {
        await apiPut(`/delivery/riders/${editingRiderId}`, body);
        setSuccess("Rider updated successfully.");
      } else {
        await apiPost("/delivery/riders", body);
        setSuccess("Rider created successfully.");
      }

      setRiderForm(emptyRiderForm);
      setEditingRiderId(null);

      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save rider.");
    } finally {
      setSaving(false);
    }
  }

  function editRider(rider: Rider) {
    clearMessages();

    setEditingRiderId(rider.id);
    setRiderForm({
      userId: rider.userId,
      name: rider.name,
      phone: rider.phone,
      isActive: rider.isActive,
    });

    setActiveTab("riders");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function toggleRider(rider: Rider) {
    clearMessages();

    try {
      await apiPut(`/delivery/riders/${rider.id}`, {
        userId: rider.userId,
        name: rider.name,
        phone: rider.phone,
        isActive: !rider.isActive,
      });

      setSuccess(
        !rider.isActive
          ? `${rider.name} is now active.`
          : `${rider.name} is now inactive.`
      );

      await loadAll();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to update rider."
      );
    }
  }

  async function removeRider(rider: Rider) {
    clearMessages();

    const confirmed = window.confirm(
      `Delete rider "${rider.name}"?`
    );

    if (!confirmed) return;

    try {
      await apiDelete(`/delivery/riders/${rider.id}`);
      setSuccess("Rider deleted successfully.");
      await loadAll();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to delete rider."
      );
    }
  }

  async function saveZone() {
    clearMessages();

    const name = zoneForm.name.trim();
    const minimumOrder = Number(zoneForm.minimumOrder);
    const deliveryFee = Number(zoneForm.deliveryFee);

    if (!name) {
      setError("Zone name is required.");
      return;
    }

    if (!Number.isFinite(minimumOrder) || minimumOrder < 0) {
      setError("Minimum order must be 0 or greater.");
      return;
    }

    if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
      setError("Delivery fee must be 0 or greater.");
      return;
    }

    try {
      setSaving(true);

      const body = {
        name,
        minimumOrder,
        deliveryFee,
        isActive: zoneForm.isActive,
      };

      if (editingZoneId) {
        await apiPut(`/delivery/zones/${editingZoneId}`, body);
        setSuccess("Delivery zone updated successfully.");
      } else {
        await apiPost("/delivery/zones", body);
        setSuccess("Delivery zone created successfully.");
      }

      setZoneForm(emptyZoneForm);
      setEditingZoneId(null);

      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save zone.");
    } finally {
      setSaving(false);
    }
  }

  function editZone(zone: DeliveryZone) {
    clearMessages();

    setEditingZoneId(zone.id);
    setZoneForm({
      name: zone.name,
      minimumOrder: String(zone.minimumOrder ?? 0),
      deliveryFee: String(zone.deliveryFee ?? 0),
      isActive: zone.isActive,
    });

    setActiveTab("zones");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function toggleZone(zone: DeliveryZone) {
    clearMessages();

    try {
      await apiPut(`/delivery/zones/${zone.id}`, {
        name: zone.name,
        minimumOrder: Number(zone.minimumOrder),
        deliveryFee: Number(zone.deliveryFee),
        isActive: !zone.isActive,
      });

      setSuccess(
        !zone.isActive
          ? `${zone.name} is now active.`
          : `${zone.name} is now inactive.`
      );

      await loadAll();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to update zone."
      );
    }
  }

  async function assignOrder() {
    clearMessages();

    if (!selectedOrderId) {
      setError("Please select a delivery order.");
      return;
    }

    if (!selectedRiderId) {
      setError("Please select an active rider.");
      return;
    }

    try {
      setAssigning(true);

      await apiPost("/delivery/assignments", {
        orderId: selectedOrderId,
        riderId: selectedRiderId,
        status: selectedAssignmentStatus,
      });

      setSuccess("Delivery order assigned successfully.");

      setSelectedOrderId("");
      setSelectedRiderId("");
      setSelectedAssignmentStatus("ASSIGNED");

      await loadAll();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to assign delivery."
      );
    } finally {
      setAssigning(false);
    }
  }

  async function updateAssignmentStatus(
    assignment: Assignment,
    status: string
  ) {
    clearMessages();

    try {
      await apiPut(`/delivery/assignments/${assignment.id}/status`, {
        status,
      });

      setSuccess("Delivery status updated.");
      await loadAll();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update delivery status."
      );
    }
  }

  async function deleteAssignment(assignment: Assignment) {
    clearMessages();

    const confirmed = window.confirm(
      `Delete assignment for order ${assignment.orderId}?`
    );

    if (!confirmed) return;

    try {
      await apiDelete(`/delivery/assignments/${assignment.id}`);
      setSuccess("Assignment deleted.");
      await loadAll();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to delete assignment."
      );
    }
  }

  const activeRiders = riders.filter((rider) => rider.isActive);

  const assignedOrderIds = new Set(
    assignments.map((assignment) => assignment.orderId)
  );

  const unassignedDeliveryOrders = orders.filter(
    (order) => !assignedOrderIds.has(order.id)
  );

  return (
    <main className="min-h-screen bg-[#0c0c0d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Delivery Control Center
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Delivery Management
            </h1>

            <p className="mt-2 text-sm text-white/55">
              Shop: New Market, Rajshahi
              <span className="mx-2 text-white/20">•</span>
              Coverage: Whole Rajshahi City
            </p>
          </div>

          <button
            type="button"
            onClick={loadAll}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10"
          >
            Refresh Data
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

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-xs text-white/40">Active Riders</div>
            <div className="mt-2 text-3xl font-bold text-emerald-300">
              {activeRiders.length}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-xs text-white/40">Delivery Orders</div>
            <div className="mt-2 text-3xl font-bold text-amber-300">
              {orders.length}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-xs text-white/40">Unassigned</div>
            <div className="mt-2 text-3xl font-bold text-orange-300">
              {unassignedDeliveryOrders.length}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-xs text-white/40">Active Zones</div>
            <div className="mt-2 text-3xl font-bold text-blue-300">
              {zones.filter((zone) => zone.isActive).length}
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          <button
            type="button"
            onClick={() => {
              clearMessages();
              setActiveTab("riders");
            }}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "riders"
                ? "bg-amber-400 text-black"
                : "text-white/65 hover:bg-white/10"
            }`}
          >
            Riders
          </button>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              setActiveTab("assignments");
            }}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "assignments"
                ? "bg-amber-400 text-black"
                : "text-white/65 hover:bg-white/10"
            }`}
          >
            Assignments
          </button>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              setActiveTab("zones");
            }}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "zones"
                ? "bg-amber-400 text-black"
                : "text-white/65 hover:bg-white/10"
            }`}
          >
            Delivery Zones
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-sm text-white/50">
            Loading delivery management...
          </div>
        ) : (
          <>
            {activeTab === "riders" && (
              <section className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {editingRiderId
                          ? "Edit Rider"
                          : "Add Delivery Rider"}
                      </h2>

                      <p className="mt-1 text-sm text-white/45">
                        A rider must be linked to an existing user account.
                      </p>
                    </div>

                    {editingRiderId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRiderId(null);
                          setRiderForm(emptyRiderForm);
                        }}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">
                        User ID
                      </span>

                      <input
                        value={riderForm.userId}
                        onChange={(e) =>
                          setRiderForm((prev) => ({
                            ...prev,
                            userId: e.target.value,
                          }))
                        }
                        placeholder="Existing user ID"
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">
                        Rider Name
                      </span>

                      <input
                        value={riderForm.name}
                        onChange={(e) =>
                          setRiderForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Rider name"
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">
                        Phone
                      </span>

                      <input
                        value={riderForm.phone}
                        onChange={(e) =>
                          setRiderForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="01XXXXXXXXX"
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
                      />
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={riderForm.isActive}
                        onChange={(e) =>
                          setRiderForm((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-amber-400"
                      />

                      <span>
                        <span className="block text-sm font-medium">
                          Active Rider
                        </span>

                        <span className="block text-xs text-white/40">
                          Active riders are available for assignment.
                        </span>
                      </span>
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveRider}
                    className="mt-5 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingRiderId
                        ? "Update Rider"
                        : "Create Rider"}
                  </button>
                </div>

                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">
                      All Riders
                    </h2>

                    <p className="mt-1 text-sm text-white/45">
                      {riders.length} rider
                      {riders.length === 1 ? "" : "s"} configured
                    </p>
                  </div>

                  {riders.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">
                      No delivery riders yet.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {riders.map((rider) => (
                        <article
                          key={rider.id}
                          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {rider.name}
                              </h3>

                              <p className="mt-1 text-sm text-white/50">
                                {rider.phone}
                              </p>

                              <p className="mt-1 break-all text-xs text-white/30">
                                User: {rider.userId}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                rider.isActive
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-white/10 text-white/40"
                              }`}
                            >
                              {rider.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => editRider(rider)}
                              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleRider(rider)}
                              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
                            >
                              {rider.isActive
                                ? "Disable"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() => removeRider(rider)}
                              className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-200 hover:bg-red-400/20"
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "assignments" && (
              <section className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                  <h2 className="text-xl font-semibold">
                    Assign Delivery Order
                  </h2>

                  <p className="mt-1 text-sm text-white/45">
                    Select an unassigned delivery order and an active rider.
                  </p>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">
                        Delivery Order
                      </span>

                      <select
                        value={selectedOrderId}
                        onChange={(e) =>
                          setSelectedOrderId(e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#161617] px-4 py-3 text-sm outline-none focus:border-amber-400/60"
                      >
                        <option value="">
                          Select order
                        </option>

                        {unassignedDeliveryOrders.map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.id}
                            {order.status
                              ? ` • ${order.status}`
                              : ""}
                            {order.total || order.grandTotal
                              ? ` • ${money(
                                  order.total ?? order.grandTotal
                                )}`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">
                        Rider
                      </span>

                      <select
                        value={selectedRiderId}
                        onChange={(e) =>
                          setSelectedRiderId(e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#161617] px-4 py-3 text-sm outline-none focus:border-amber-400/60"
                      >
                        <option value="">
                          Select active rider
                        </option>

                        {activeRiders.map((rider) => (
                          <option key={rider.id} value={rider.id}>
                            {rider.name} • {rider.phone}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">
                        Initial Assignment Status
                      </span>

                      <select
                        value={selectedAssignmentStatus}
                        onChange={(e) =>
                          setSelectedAssignmentStatus(
                            e.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#161617] px-4 py-3 text-sm outline-none focus:border-amber-400/60"
                      >
                        {assignmentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={assigning}
                    onClick={assignOrder}
                    className="mt-5 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-50"
                  >
                    {assigning
                      ? "Assigning..."
                      : "Assign Delivery"}
                  </button>
                </div>

                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">
                      Delivery Assignments
                    </h2>

                    <p className="mt-1 text-sm text-white/45">
                      Live assignment and delivery status control.
                    </p>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">
                      No delivery assignments found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assignments.map((assignment) => {
                        const riderName =
                          assignment.rider?.name ||
                          riders.find(
                            (rider) =>
                              rider.id === assignment.riderId
                          )?.name ||
                          assignment.riderId;

                        const orderId =
                          assignment.order?.id ||
                          assignment.orderId;

                        const orderTotal =
                          assignment.order?.grandTotal ??
                          assignment.order?.total;

                        return (
                          <article
                            key={assignment.id}
                            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-wider text-white/35">
                                  Order
                                </p>

                                <h3 className="mt-1 break-all text-lg font-semibold">
                                  {orderId}
                                </h3>

                                <p className="mt-1 text-sm text-white/50">
                                  Rider: {riderName}
                                </p>

                                {orderTotal !== undefined && (
                                  <p className="mt-1 text-sm text-white/40">
                                    {money(orderTotal)}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <select
                                  value={assignment.status}
                                  onChange={(e) =>
                                    updateAssignmentStatus(
                                      assignment,
                                      e.target.value
                                    )
                                  }
                                  className="rounded-xl border border-white/10 bg-[#161617] px-4 py-2 text-sm outline-none focus:border-amber-400/60"
                                >
                                  {assignmentStatuses.map(
                                    (status) => (
                                      <option
                                        key={status}
                                        value={status}
                                      >
                                        {status}
                                      </option>
                                    )
                                  )}
                                </select>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteAssignment(
                                      assignment
                                    )
                                  }
                                  className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-200 hover:bg-red-400/20"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                              {assignment.assignedAt && (
                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
                                  Assigned:{" "}
                                  {new Date(
                                    assignment.assignedAt
                                  ).toLocaleString()}
                                </span>
                              )}

                              {assignment.pickedUpAt && (
                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
                                  Picked Up:{" "}
                                  {new Date(
                                    assignment.pickedUpAt
                                  ).toLocaleString()}
                                </span>
                              )}

                              {assignment.outForDeliveryAt && (
                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
                                  Out for Delivery:{" "}
                                  {new Date(
                                    assignment.outForDeliveryAt
                                  ).toLocaleString()}
                                </span>
                              )}

                              {assignment.deliveredAt && (
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                                  Delivered:{" "}
                                  {new Date(
                                    assignment.deliveredAt
                                  ).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "zones" && (
              <section className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {editingZoneId
                          ? "Edit Delivery Zone"
                          : "Delivery Zone"}
                      </h2>

                      <p className="mt-1 text-sm text-white/45">
                        Current coverage: Whole Rajshahi City
                      </p>
                    </div>

                    {editingZoneId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingZoneId(null);
                          setZoneForm(emptyZoneForm);
                        }}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">
                        Zone Name
                      </span>

                      <input
                        value={zoneForm.name}
                        onChange={(e) =>
                          setZoneForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Rajshahi City"
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">
                        Minimum Order (BDT)
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={zoneForm.minimumOrder}
                        onChange={(e) =>
                          setZoneForm((prev) => ({
                            ...prev,
                            minimumOrder: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm text-white/65">
                        Delivery Fee (BDT)
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={zoneForm.deliveryFee}
                        onChange={(e) =>
                          setZoneForm((prev) => ({
                            ...prev,
                            deliveryFee: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
                      />
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={zoneForm.isActive}
                        onChange={(e) =>
                          setZoneForm((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-amber-400"
                      />

                      <span className="text-sm">
                        Active Delivery Zone
                      </span>
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveZone}
                    className="mt-5 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingZoneId
                        ? "Update Zone"
                        : "Create Zone"}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {zones.map((zone) => (
                    <article
                      key={zone.id}
                      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {zone.name}
                          </h3>

                          <span
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              zone.isActive
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-white/10 text-white/40"
                            }`}
                          >
                            {zone.isActive
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold text-amber-300">
                            {money(zone.deliveryFee)}
                          </div>

                          <div className="text-xs text-white/35">
                            delivery fee
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs text-white/35">
                          Minimum Order
                        </div>

                        <div className="mt-1 font-semibold">
                          {money(zone.minimumOrder)}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editZone(zone)}
                          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleZone(zone)}
                          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
                        >
                          {zone.isActive
                            ? "Disable"
                            : "Activate"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
