"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#08080a] text-white">

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_85%_25%,rgba(139,92,246,0.16),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">
            MARHABA DUM BIRYANI & LOUNGE
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl">
            Come hungry.
            <br />
            Leave satisfied.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
            Authentic dum biryani and a comfortable dining experience in
            Rajshahi. Visit us at New Market or order online across Rajshahi
            City.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-black transition hover:bg-orange-400"
            >
              Explore Menu
            </Link>

            <Link
              href="/cart"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white/80 transition hover:bg-white/10"
            >
              View Cart
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-xl ring-1 ring-orange-400/20">
              01
            </span>

            <h2 className="mt-6 text-xl font-black">
              Our Location
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/55">
              New Market, Rajshahi, Bangladesh.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-xl ring-1 ring-purple-400/20">
              02
            </span>

            <h2 className="mt-6 text-xl font-black">
              Delivery Area
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/55">
              Delivery service across Whole Rajshahi City.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl ring-1 ring-emerald-400/20">
              03
            </span>

            <h2 className="mt-6 text-xl font-black">
              Dine In
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/55">
              Enjoy freshly prepared food in our Rajshahi restaurant.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-xl ring-1 ring-cyan-400/20">
              04
            </span>

            <h2 className="mt-6 text-xl font-black">
              Online Order
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/55">
              Browse our menu, customize your order and checkout online.
            </p>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8 md:pb-24">
        <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] lg:grid-cols-[1.1fr_0.9fr]">

          <div className="min-h-[360px] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.16),transparent_45%)] p-8 md:p-10">
            <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/20 p-8 text-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
                  Find Us
                </p>

                <h2 className="mt-4 text-3xl font-black md:text-4xl">
                  New Market, Rajshahi
                </h2>

                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
                  Visit our restaurant in New Market, Rajshahi.
                </p>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=New+Market+Rajshahi"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black transition hover:bg-white/10"
                >
                  Open Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-8 md:p-10 lg:border-l lg:border-t-0">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
              Order Online
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Your table or your doorstep.
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Explore the menu, choose your favourites and place your order
              online.
            </p>

            <div className="mt-8 space-y-3">
              <Link
                href="/menu"
                className="flex items-center justify-between rounded-2xl bg-orange-500 px-5 py-4 text-sm font-black hover:bg-orange-400"
              >
                <span>Browse Menu</span>
                <span>→</span>
              </Link>

              <Link
                href="/orders"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-black hover:bg-white/10"
              >
                <span>My Orders</span>
                <span>→</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-8 text-center md:px-8">
          <p className="text-xs text-white/35">
            MARHABA DUM BIRYANI & LOUNGE · New Market, Rajshahi
          </p>
        </div>
      </footer>

    </main>
  );
}
