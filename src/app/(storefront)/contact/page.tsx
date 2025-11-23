import type { Metadata } from "next";
import ContactForm from "@/components/storefront/static/contact-form";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { PageBreadcrumbs } from "@/components/storefront/static/breadcrumbs";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-4">
        <PageBreadcrumbs items={[{ href: "/", label: "Home" }, { label: "Contact" }]} />
      </div>
      {/* Hero header */}
      <div className="rounded-2xl border ring-1 ring-border bg-gradient-to-br from-primary/10 via-background to-primary/10 p-8 sm:p-10 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">We're here to help</h1>
        <p className="text-muted-foreground mt-2">Our team responds within 24 hours on business days.</p>
      </div>

      {/* Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl border ring-1 ring-border p-5 bg-card">
          <div className="flex items-center gap-3 mb-2"><MessageSquare className="h-5 w-5" /><div className="font-semibold">Live chat</div></div>
          <p className="text-sm text-muted-foreground">Chat with us Mon–Fri, 9:00–18:00 (UTC).</p>
        </div>
        <div className="rounded-xl border ring-1 ring-border p-5 bg-card">
          <div className="flex items-center gap-3 mb-2"><Mail className="h-5 w-5" /><div className="font-semibold">Email</div></div>
          <p className="text-sm text-muted-foreground">support@store.local — we reply within 24h.</p>
        </div>
        <div className="rounded-xl border ring-1 ring-border p-5 bg-card">
          <div className="flex items-center gap-3 mb-2"><Phone className="h-5 w-5" /><div className="font-semibold">Phone</div></div>
          <p className="text-sm text-muted-foreground">+1 (555) 000-0000 — 9:00–18:00 (UTC).</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="rounded-xl border ring-1 ring-border p-4 space-y-3 bg-card">
            <div><div className="text-sm font-medium">Email</div><div className="text-sm text-muted-foreground">support@store.local</div></div>
            <div><div className="text-sm font-medium">Hours</div><div className="text-sm text-muted-foreground">Mon–Fri, 9:00–18:00</div></div>
            <div><div className="text-sm font-medium">Address</div><div className="text-sm text-muted-foreground">123 Commerce St, City</div></div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-2xl border ring-1 ring-border p-6 bg-card">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
