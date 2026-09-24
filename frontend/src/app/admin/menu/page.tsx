"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

type AnyRecord = Record<string, any>;

function unwrap(result: any): AnyRecord[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.menuItems)) return result.menuItems;
  if (Array.isArray(result?.menus)) return result.menus;
  if (Array.isArray(result?.data?.items)) return result.data.items;
  if (Array.isArray(result?.data?.menuItems)) return result.data.menuItems;
  return [];
}

function money(value: any) {
  const n = Number(value ?? 0);
  return `৳${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

function categoryOf(item: AnyRecord) {
  if (typeof item.category === "string") {
    return item.category;
  }

  return (
    item.category?.name ||
    item.categoryName ||
    "Chef's Selection"
  );
}

function imageOf(item: AnyRecord) {
  return (
    item.imageUrl ||
    item.image ||
    item.photoUrl ||
    item.image_url ||
    ""
  );
}

export default function MenuPage() {
  const [items, setItems] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await apiGet("/menu");
        setItems(unwrap(result));
      } catch (err: any) {
        setError(err?.message || "Could not load menu.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map(categoryOf)
          .filter(Boolean)
      )
    );
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const categoryMatch =
        category === "ALL" ||
        categoryOf(item) === category;

      if (!categoryMatch) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.name,
        item.description,
        categoryOf(item),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, search, category]);

  async function addToCart(item: AnyRecord) {
    try {
      setAddingId(String(item.id));
      setError("");
      setMessage("");

      await apiPost("/cart/items", {
        menuItemId: item.id,
        quantity: 1,
      });

      setMessage(`${item.name || "Item"} added to cart.`);
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not add this item to cart."
      );
    } finally {
      setAddingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">
                MARHABA DUM BIRYANI & LOUNGE
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
                Our Menu
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/55 md:text-base">
                Discover our biryani, mains, sides and drinks. Every dish is
                prepared with care and served fresh.
              </p>
            </div>

            <Link
              href="/cart"
              className="w-fit rounded-full bg-orange-500 px-6 py-3 text-sm font-black hover:bg-orange-400"
            >
              View Cart →
            </Link>
          </div>

          <div className="mt-8">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm outline-none placeholder:text-white/30 focus:border-orange-400/50"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory("ALL")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                category === "ALL"
                  ? "bg-orange-500 text-white"
                  : "bg-white/[0.05] text-white/55 hover:bg-white/10"
              }`}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                  category === cat
                    ? "bg-orange-500 text-white"
                    : "bg-white/[0.05] text-white/55 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[400px] animate-pulse rounded-3xl bg-white/[0.05] ring-1 ring-white/10"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-14 text-center">
            <h2 className="text-xl font-black">
              No dishes found
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => {
              const id = String(item.id);
              const image = imageOf(item);
              const available =
                item.isAvailable !== false &&
                item.isActive !== false;

              return (
                <article
                  key={id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] transition hover:-translate-y-1 hover:bg-white/[0.065]"
                >
                  <div className="relative h-52 overflow-hidden bg-white/[0.04]">
                    {image ? (
                      <img
                        src={image}
                        alt={item.name || "Menu item"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),transparent_48%)]">
                        <div className="h-24 w-24 rounded-full border border-white/10 bg-white/[0.04]" />
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-bold backdrop-blur">
                      {categoryOf(item)}
                    </span>

                    {!available && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest">
                          Unavailable
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-black leading-tight">
                        {item.name || "Unnamed Dish"}
                      </h2>

                      <span className="shrink-0 text-base font-black text-orange-400">
                        {money(item.price)}
                      </span>
                    </div>

                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/45">
                      {item.description ||
                        "Freshly prepared with Marhaba's signature flavour."}
                    </p>

                    <button
                      disabled={!available || addingId === id}
                      onClick={() => addToCart(item)}
                      className="mt-5 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                    >
                      {addingId === id
                        ? "Adding..."
                        : available
                          ? "Add to Cart"
                          : "Unavailable"}
                    </button>
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
