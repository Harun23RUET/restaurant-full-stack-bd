"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

type Coupon = {
  id: string;
  code: string;
  offerId: string;
};

type Offer = {
  id: string;
  name: string;
  type: string;
  value: number;
  minimumOrder: number;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  coupons?: Coupon[];
};

type OfferForm = {
  name: string;
  type: string;
  value: string;
  minimumOrder: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  isActive: boolean;
};

const emptyForm: OfferForm = {
  name: "",
  type: "PERCENTAGE",
  value: "10",
  minimumOrder: "0",
  startDate: "",
  endDate: "",
  usageLimit: "",
  isActive: true,
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

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [couponOfferId, setCouponOfferId] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadOffers() {
    try {
      setLoading(true);
      setError("");

      const result = await apiGet<unknown>("/offers");
      setOffers(listFrom<Offer>(result));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to load offers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOffers();
  }, []);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editOffer(offer: Offer) {
    clearMessages();

    setEditingId(offer.id);
    setForm({
      name: offer.name,
      type: offer.type,
      value: String(offer.value),
      minimumOrder: String(offer.minimumOrder),
      startDate: new Date(offer.startDate)
        .toISOString()
        .slice(0, 16),
      endDate: new Date(offer.endDate)
        .toISOString()
        .slice(0, 16),
      usageLimit:
        offer.usageLimit === null ||
        offer.usageLimit === undefined
          ? ""
          : String(offer.usageLimit),
      isActive: offer.isActive,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveOffer() {
    clearMessages();

    const name = form.name.trim();
    const type = form.type;
    const value = Number(form.value);
    const minimumOrder = Number(form.minimumOrder);

    if (!name) {
      setError("Offer name is required.");
      return;
    }

    if (!Number.isFinite(value) || value < 0) {
      setError("Discount value must be 0 or greater.");
      return;
    }

    if (type === "PERCENTAGE" && value > 100) {
      setError("Percentage discount cannot exceed 100.");
      return;
    }

    if (!Number.isFinite(minimumOrder) || minimumOrder < 0) {
      setError("Minimum order must be 0 or greater.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Start and end dates are required.");
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setError("Invalid offer dates.");
      return;
    }

    if (end <= start) {
      setError("End date must be later than start date.");
      return;
    }

    let usageLimit: number | undefined = undefined;

    if (form.usageLimit.trim()) {
      usageLimit = Number(form.usageLimit);

      if (!Number.isInteger(usageLimit) || usageLimit < 1) {
        setError("Usage limit must be a positive whole number.");
        return;
      }
    }

    try {
      setSaving(true);

      const body = {
        name,
        type,
        value,
        minimumOrder,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        ...(usageLimit !== undefined
          ? { usageLimit }
          : {}),
        isActive: form.isActive,
      };

      if (editingId) {
        await apiPut(`/offers/${editingId}`, body);
        setSuccess("Offer updated successfully.");
      } else {
        await apiPost("/offers", body);
        setSuccess("Offer created successfully.");
      }

      resetForm();
      await loadOffers();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to save offer."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteOffer(offer: Offer) {
    clearMessages();

    if (!window.confirm(`Delete offer "${offer.name}"?`)) {
      return;
    }

    try {
      await apiDelete(`/offers/${offer.id}`);
      setSuccess("Offer deleted successfully.");
      await loadOffers();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to delete offer."
      );
    }
  }

  async function toggleOffer(offer: Offer) {
    clearMessages();

    try {
      await apiPut(`/offers/${offer.id}`, {
        isActive: !offer.isActive,
      });

      setSuccess(
        !offer.isActive
          ? `${offer.name} activated.`
          : `${offer.name} deactivated.`
      );

      await loadOffers();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update offer."
      );
    }
  }

  async function createCoupon() {
    clearMessages();

    const code = couponCode.trim().toUpperCase();

    if (!couponOfferId) {
      setError("Select an offer for the coupon.");
      return;
    }

    if (!code) {
      setError("Coupon code is required.");
      return;
    }

    try {
      setCreatingCoupon(true);

      await apiPost("/offers/coupons", {
        offerId: couponOfferId,
        code,
      });

      setCouponCode("");
      setSuccess(`Coupon ${code} created successfully.`);

      await loadOffers();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to create coupon."
      );
    } finally {
      setCreatingCoupon(false);
    }
  }

  async function deleteCoupon(coupon: Coupon) {
    clearMessages();

    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      await apiDelete(`/offers/coupons/${coupon.id}`);
      setSuccess("Coupon deleted successfully.");
      await loadOffers();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to delete coupon."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#0c0c0d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Promotions
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Offers & Coupons
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Shop: New Market, Rajshahi
              <span className="mx-2 text-white/20">•</span>
              Discounts in BDT ৳
            </p>
          </div>

          <button
            type="button"
            onClick={loadOffers}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-white/70 hover:bg-white/10"
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

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Offer" : "Create Offer"}
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Percentage, fixed discount or free delivery.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <label className="block">
              <span className="mb-2 block text-sm text-white/65">
                Offer Name
              </span>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Weekend Special"
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/65">
                Discount Type
              </span>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-[#161617] px-4 py-3 text-sm outline-none focus:border-amber-400/60"
              >
                <option value="PERCENTAGE">
                  Percentage Discount
                </option>

                <option value="FIXED">
                  Fixed Discount
                </option>

                <option value="FREE_DELIVERY">
                  Free Delivery
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/65">
                Value
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                placeholder={
                  form.type === "PERCENTAGE"
                    ? "10"
                    : "100"
                }
                disabled={form.type === "FREE_DELIVERY"}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60 disabled:opacity-40"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/65">
                Minimum Order (BDT)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minimumOrder}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    minimumOrder: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/65">
                Start Date
              </span>

              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/65">
                End Date
              </span>

              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/65">
                Usage Limit
              </span>

              <input
                type="number"
                min="1"
                step="1"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    usageLimit: e.target.value,
                  }))
                }
                placeholder="Unlimited"
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-amber-400/60"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-amber-400"
              />

              <span>
                <span className="block text-sm font-medium">
                  Active Offer
                </span>

                <span className="block text-xs text-white/40">
                  Customers can use active offers during the valid period.
                </span>
              </span>
            </label>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={saveOffer}
            className="mt-5 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Offer"
                : "Create Offer"}
          </button>
        </section>

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Create Coupon
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Attach a customer-facing coupon code to an offer.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">

            <select
              value={couponOfferId}
              onChange={(e) =>
                setCouponOfferId(e.target.value)
              }
              className="rounded-2xl border border-white/10 bg-[#161617] px-4 py-3 text-sm outline-none focus:border-amber-400/60"
            >
              <option value="">
                Select offer
              </option>

              {offers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.name}
                </option>
              ))}
            </select>

            <input
              value={couponCode}
              onChange={(e) =>
                setCouponCode(e.target.value.toUpperCase())
              }
              placeholder="e.g. MARHABA10"
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm uppercase outline-none focus:border-amber-400/60"
            />

            <button
              type="button"
              disabled={creatingCoupon}
              onClick={createCoupon}
              className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-50"
            >
              {creatingCoupon
                ? "Creating..."
                : "Create Coupon"}
            </button>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              All Offers
            </h2>

            <p className="mt-1 text-sm text-white/40">
              {offers.length} offer
              {offers.length === 1 ? "" : "s"} configured.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/45">
              Loading offers...
            </div>
          ) : offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/40">
              No offers yet.
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {offers.map((offer) => (
                <article
                  key={offer.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {offer.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                          {offer.type.replaceAll("_", " ")}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            offer.isActive
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-white/10 text-white/40"
                          }`}
                        >
                          {offer.isActive
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-300">
                        {offer.type === "PERCENTAGE"
                          ? `${offer.value}%`
                          : offer.type === "FREE_DELIVERY"
                            ? "FREE"
                            : money(offer.value)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-black/20 p-4">
                      <div className="text-xs text-white/35">
                        Minimum Order
                      </div>

                      <div className="mt-1 font-semibold">
                        {money(offer.minimumOrder)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-black/20 p-4">
                      <div className="text-xs text-white/35">
                        Usage
                      </div>

                      <div className="mt-1 font-semibold">
                        {offer.usedCount} /{" "}
                        {offer.usageLimit ?? "∞"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-white/35">
                    {new Date(
                      offer.startDate
                    ).toLocaleString()}{" "}
                    →{" "}
                    {new Date(
                      offer.endDate
                    ).toLocaleString()}
                  </div>

                  {offer.coupons &&
                    offer.coupons.length > 0 && (
                      <div className="mt-5">
                        <div className="mb-2 text-xs uppercase tracking-wider text-white/35">
                          Coupon Codes
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {offer.coupons.map((coupon) => (
                            <span
                              key={coupon.id}
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
                            >
                              <span className="font-bold text-amber-300">
                                {coupon.code}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteCoupon(coupon)
                                }
                                className="text-red-300 hover:text-red-200"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => editOffer(offer)}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleOffer(offer)}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
                    >
                      {offer.isActive
                        ? "Disable"
                        : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteOffer(offer)}
                      className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-200 hover:bg-red-400/20"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
