"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
  imageUrl?: string | null;
};

type Cart = {
  id: string | null;
  userId: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
};

const API = "http://localhost:4000/api";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  function getAuthHeaders() {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    return {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    };
  }

  async function loadCart(id: string) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/cart/${id}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Cart API error: ${response.status}`,
        );
      }

      const data = await response.json();

      const items: CartItem[] = Array.isArray(data?.items)
        ? data.items.map((item: any) => ({
            id: String(item.id),
            menuItemId: String(item.menuItemId),
            name:
              item.name ??
              item.menuItem?.name ??
              "Menu Item",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            lineTotal:
              Number(item.lineTotal) ||
              (Number(item.price) || 0) *
                (Number(item.quantity) || 1),
            imageUrl:
              item.imageUrl ??
              item.menuItem?.imageUrl ??
              null,
          }))
        : [];

      const itemCount = items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const subtotal = items.reduce(
        (sum, item) => sum + item.lineTotal,
        0,
      );

      setCart({
        id: data?.id ?? null,
        userId: data?.userId ?? id,
        items,
        itemCount,
        subtotal,
        total: subtotal,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load cart.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = localStorage.getItem("userId");

    setUserId(id);

    if (!id) {
      setError("Please log in before viewing your cart.");
      setLoading(false);
      return;
    }

    loadCart(id);
  }, []);

  async function updateQuantity(
    itemId: string,
    quantity: number,
  ) {
    if (!userId) return;

    try {
      setBusy(itemId);
      setError("");

      if (quantity <= 0) {
        const response = await fetch(
          `${API}/cart/${itemId}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to remove item.");
        }
      } else {
        const response = await fetch(
          `${API}/cart/${itemId}`,
          {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ quantity }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update quantity.");
        }
      }

      await loadCart(userId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Cart update failed.",
      );
    } finally {
      setBusy("");
    }
  }

  async function clearCart() {
    if (!userId) return;

    try {
      setBusy("clear");
      setError("");

      const response = await fetch(
        `${API}/cart/clear/${userId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to clear cart.");
      }

      await loadCart(userId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to clear cart.",
      );
    } finally {
      setBusy("");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Loading your cart...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.25em] text-orange-500">
              YOUR CART
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900 sm:text-5xl">
              Shopping Cart
            </h1>

            <p className="mt-2 text-slate-500">
              Review your selected dishes before checkout.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex w-fit rounded-xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800"
          >
            Continue Shopping
          </Link>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-black text-red-700">
              Cart Error
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            {userId && (
              <button
                type="button"
                onClick={() => loadCart(userId)}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <section className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-4xl">
              🛒
            </div>

            <h2 className="mt-6 text-3xl font-black text-slate-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Your selected food items will appear here.
            </p>

            <Link
              href="/menu"
              className="mt-7 inline-flex rounded-xl bg-orange-500 px-7 py-3 font-black text-white hover:bg-orange-600"
            >
              Browse Menu
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">

              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Cart Items
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {cart.itemCount} item(s)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  disabled={busy === "clear"}
                  className="rounded-xl px-4 py-2 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {busy === "clear"
                    ? "Clearing..."
                    : "Clear Cart"}
                </button>
              </div>

              <div className="space-y-4">
                {cart.items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex min-w-0 items-center gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-orange-50">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl">
                              Food
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black text-slate-900">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            BDT ৳{item.price.toFixed(0)} each
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">

                        <div className="flex items-center rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                              )
                            }
                            disabled={!!busy}
                            className="px-4 py-2 text-lg font-black hover:bg-slate-50 disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="min-w-10 text-center font-black text-slate-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                              )
                            }
                            disabled={!!busy}
                            className="px-4 py-2 text-lg font-black hover:bg-slate-50 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <div className="min-w-28 text-right">
                          <p className="font-black text-slate-900">
                            BDT ৳{item.lineTotal.toFixed(0)}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, 0)
                            }
                            disabled={!!busy}
                            className="mt-1 text-xs font-black text-red-500 hover:text-red-700 disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </div>

                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-xl">

              <p className="text-sm font-black tracking-[0.2em] text-orange-400">
                SUMMARY
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Order Summary
              </h2>

              <div className="mt-7 space-y-4">
                <div className="flex justify-between text-white/65">
                  <span>Items</span>
                  <span>{cart.itemCount}</span>
                </div>

                <div className="flex justify-between text-white/65">
                  <span>Subtotal</span>
                  <span>
                    BDT ৳{cart.subtotal.toFixed(0)}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black">
                      Total
                    </span>

                    <span className="text-2xl font-black">
                      BDT ৳{cart.total.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-7 block rounded-xl bg-orange-500 px-5 py-3 text-center font-black text-white hover:bg-orange-400"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/menu"
                className="mt-3 block rounded-xl border border-white/15 px-5 py-3 text-center font-bold text-white/80 hover:bg-white/5"
              >
                Add More Food
              </Link>
            </aside>

          </div>
        )}

      </div>
    </main>
  );
}
