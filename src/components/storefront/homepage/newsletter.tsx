"use client";

import { useState } from "react";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hp, setHp] = useState(""); // honeypot

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setErr(null);
    if (!isValidEmail(email)) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (hp) return; // bot
    try {
      setLoading(true);
      const res = await fetch("/api/storefront/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || "Subscription failed");
      setOk("Thanks for subscribing! You'll hear from us soon.");
      setEmail("");
      setName("");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border ring-1 ring-border bg-gradient-to-br from-primary/10 via-background to-primary/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-10">
            <div className="flex flex-col justify-center gap-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Subscribe to our Newsletter</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Get early access to drops, exclusive offers, and style guides. No spam, unsubscribe anytime.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary" /> Weekly highlights</li>
                <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary" /> Member-only discounts</li>
                <li className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-primary" /> New arrivals alerts</li>
              </ul>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col justify-center gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-1 sm:col-span-1 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="name"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="col-span-1 sm:col-span-2 w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="email"
                />
                {/* Honeypot */}
                <input
                  type="text"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  aria-hidden
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium shadow hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
                {ok && <span className="text-sm text-green-600">{ok}</span>}
                {err && <span className="text-sm text-red-600">{err}</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                By subscribing you agree to our Terms and the occasional email. You can unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
