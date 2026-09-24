"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type AnyRecord = Record<string, any>;

function unwrap(result: any): AnyRecord[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.options)) return result.options;
  if (Array.isArray(result?.addons)) return result.addons;
  if (Array.isArray(result?.data?.options)) return result.data.options;
  if (Array.isArray(result?.data?.addons)) return result.data.addons;
  return [];
}

function money(value: any) {
  const n = Number(value ?? 0);
  return `৳${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

export default function MenuOptionsAdminPage() {
  const [options, setOptions] = useState<AnyRecord[]>([]);
  const [addons, setAddons] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          apiGet("/menu-options"),
          apiGet("/menu-addons"),
        ]);

        if (!mounted) return;

        if (results[0].status === "fulfilled") {
          setOptions(unwrap(results[0].value));
        }

        if (results[1].status === "fulfilled") {
          setAddons(unwrap(results[1].value));
        }

        if (
          results[0].status === "rejected" &&
          results[1].status === "rejected"
        ) {
          setError(
            "Option/Add-on API is not currently available."
          );
        }
      } catch (err: any) {
        if (mounted) {
          setError(
            err?.message ||
              "Could not load options and add-ons."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-600">
              MARHABA DUM BIRYANI & LOUNGE
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Options & Add-ons
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage food customizations and extra selections used by
              customers while ordering.
            </p>
          </div>

          <Link
            href="/admin/menu"
            className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
          >
            ← Menu Management
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                  Customization
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Options
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Size, spice level, meat choice and other food options.
                </p>
              </div>

              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">
                {options.length}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                  Loading options...
                </div>
              ) : options.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <h3 className="font-bold text-slate-800">
                    No options configured
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Option records will appear here when available from the
                    backend.
                  </p>
                </div>
              ) : (
                options.map((item) => (
                  <div
                    key={String(item.id)}
                    className="rounded-2xl border border-slate-100 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {item.name || "Option"}
                        </h3>

                        {(item.menuItem?.name ||
                          item.menuItemName) && (
                          <p className="mt-1 text-xs text-slate-400">
                            {item.menuItem?.name ||
                              item.menuItemName}
                          </p>
                        )}
                      </div>

                      <span className="font-black text-orange-600">
                        +{money(
                          item.priceModifier ??
                            item.price ??
                            0
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-purple-500">
                  Extras
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Add-ons
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Extra meat, egg, drinks, sides and other additions.
                </p>
              </div>

              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-600">
                {addons.length}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                  Loading add-ons...
                </div>
              ) : addons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <h3 className="font-bold text-slate-800">
                    No add-ons configured
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Add-on records will appear here when available from the
                    backend.
                  </p>
                </div>
              ) : (
                addons.map((item) => (
                  <div
                    key={String(item.id)}
                    className="rounded-2xl border border-slate-100 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {item.name || "Add-on"}
                        </h3>

                        {(item.menuItem?.name ||
                          item.menuItemName) && (
                          <p className="mt-1 text-xs text-slate-400">
                            {item.menuItem?.name ||
                              item.menuItemName}
                          </p>
                        )}
                      </div>

                      <span className="font-black text-purple-600">
                        +{money(
                          item.price ??
                            item.priceModifier ??
                            0
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-lg font-black text-slate-900">
            Management Flow
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <span className="text-xs font-black text-orange-600">
                01
              </span>
              <p className="mt-2 text-sm font-bold text-slate-800">
                Create Menu Item
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <span className="text-xs font-black text-orange-600">
                02
              </span>
              <p className="mt-2 text-sm font-bold text-slate-800">
                Add Options
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <span className="text-xs font-black text-orange-600">
                03
              </span>
              <p className="mt-2 text-sm font-bold text-slate-800">
                Add Extras
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <span className="text-xs font-black text-orange-600">
                04
              </span>
              <p className="mt-2 text-sm font-bold text-slate-800">
                Customer Customizes
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
