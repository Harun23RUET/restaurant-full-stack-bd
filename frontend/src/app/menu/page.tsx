"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { getUserId } from "@/lib/auth";

type MenuItem = {
  id: string;
  name?: string;
  description?: string;
  price?: number | string;
  imageUrl?: string;
  image?: string;
  category?: string | { name?: string };
  categoryName?: string;
  isAvailable?: boolean;
  isActive?: boolean;
};

function unwrap(value: any): MenuItem[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.menuItems)) return value.menuItems;
  if (Array.isArray(value?.data?.items)) return value.data.items;
  if (Array.isArray(value?.data?.menuItems)) return value.data.menuItems;
  return [];
}

function price(value: any) {
  const n = Number(value ?? 0);
  return `৳${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

function category(item: MenuItem) {
  if (typeof item.category === "string") {
    return item.category;
  }

  return (
    item.category?.name ||
    item.categoryName ||
    "Chef's Selection"
  );
}

function image(item: MenuItem) {
  const name = String(item.name || "").toLowerCase();
if (name.includes("beef") && name.includes("burger")) {
    return "https://restaumatic-production.imgix.net/uploads/accounts/348244/media_library/unnamed-f36e4efd7ad0e030e77da980f85f5098.jpg?auto=compress%2Cformat&fit=max&w=1200";
  }

  if (name.includes("chicken") && name.includes("pasta")) {
    return "https://tb-static.uber.com/prod/image-proc/processed_images/53735f6131b7c3ca19eaddf34e8aa75e/a19bb09692310dfd41e49a96c424b3a6.jpeg";
  }

  if (name.includes("vegetable") && name.includes("pasta")) {
    return "https://emeals-menubuilder.s3.amazonaws.com/v1/recipes/616625/pictures/large_vegetable-lovers-pasta-primavera.jpg";
  }

  return (
    item.imageUrl ||
    item.image ||
    "/menu-fallback.svg"
  );
}

export default function CustomerMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  async function loadMenu() {
    try {
      setLoading(true);
      setError("");

      const result = await apiGet("/menu");
      setItems(unwrap(result));
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to load menu from the server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map(category)
          .filter(Boolean)
      )
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return items.filter((item) => {
      const categoryMatches =
        selectedCategory === "ALL" ||
        category(item) === selectedCategory;

      if (!categoryMatches) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.name,
        item.description,
        category(item),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    items,
    search,
    selectedCategory,
  ]);

  async function addToCart(item: MenuItem) {
    try {
      setAddingId(item.id);
      setError("");
      setSuccess("");

      const userId = getUserId();

      if (!userId) {
        setError("Please log in before adding items to cart.");
        return;
      }

      await apiPost("/cart", {
        userId,
        menuItemId: item.id,
        quantity: 1,
      });

      setSuccess(
        `${item.name || "Item"} added to cart.`
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not add item to cart."
      );
    } finally {
      setAddingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      {/* HEADER */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">
                MARHABA DUM BIRYANI & LOUNGE
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
                Our Menu
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
                Explore our biryani, mains, sides and drinks. Freshly prepared
                for customers across Rajshahi.
              </p>
            </div>

          <div className="mt-5 flex justify-end">
            <Link
              href="/cart"
              className="relative z-[9999] inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-400"
            >
              View Cart
            </Link>


          </div>
          </div>

          {/* SEARCH */}
          <div className="mt-9">
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search chicken biryani, beef, drinks..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
            />
          </div>

          {/* CATEGORIES */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

            <button
              onClick={() =>
                setSelectedCategory("ALL")
              }
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${
                selectedCategory === "ALL"
                  ? "bg-orange-500 text-white"
                  : "bg-white/[0.05] text-white/55 hover:bg-white/10"
              }`}
            >
              All
            </button>

            {categories.map((name) => (
              <button
                key={name}
                onClick={() =>
                  setSelectedCategory(name)
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${
                  selectedCategory === name
                    ? "bg-orange-500 text-white"
                    : "bg-white/[0.05] text-white/55 hover:bg-white/10"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* MENU */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-[390px] animate-pulse rounded-3xl bg-white/[0.05] ring-1 ring-white/10"
                />
              )
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-14 text-center">
            <h2 className="text-xl font-black">
              No dishes found
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredItems.map((item) => {
              const available =
                item.isAvailable !== false &&
                item.isActive !== false;

              const img = image(item);

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.065]"
                >

                  <div className="relative h-52 overflow-hidden bg-white/[0.03]">

                    {img ? (
                      <img
                        src={img}
                        alt={item.name || "Menu item"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),transparent_50%)]">
                        <span className="text-xs font-black uppercase tracking-[0.25em] text-white/25">
                          Marhaba
                        </span>
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] font-bold backdrop-blur">
                      {category(item)}
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
                        {price(item.price)}
                      </span>
                    </div>

                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/45">
                      {item.description ||
                        "Freshly prepared with Marhaba's signature flavour."}
                    </p>

                    <button
                      disabled={
                        !available ||
                        addingId === item.id
                      }
                      onClick={() =>
                        addToCart(item)
                      }
                      className="mt-5 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                    >
                      {addingId === item.id
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










