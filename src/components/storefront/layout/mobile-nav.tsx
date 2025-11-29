"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { data: session } = useSession();

  const navLinks = [
    { href: "/shop", label: "Shop All" },
    { href: "/shop/new", label: "New Arrivals" },
    { href: "/shop/sale", label: "Sale" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[100vw] max-w-[100vw] sm:w-[380px] p-0">
        {/* Custom Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
          <Button onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav
          role="navigation"
          aria-label="Mobile"
          className="flex h-[calc(100dvh-56px)] flex-col overflow-y-auto px-2 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-1"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-base sm:text-lg font-medium transition-colors hover:text-primary block px-3 py-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {link.label}
            </Link>
          ))}

          {session?.user && (
            <div className="border-t pt-3 mt-3">
              <Link
                href="/account"
                onClick={onClose}
                className="text-base sm:text-lg font-medium transition-colors hover:text-primary block px-3 py-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                My Account
              </Link>
              <Link
                href="/account/orders"
                onClick={onClose}
                className="text-sm sm:text-base text-muted-foreground transition-colors hover:text-primary block mt-1 px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Orders
              </Link>
              <Link
                href="/account/wishlist"
                onClick={onClose}
                className="text-sm sm:text-base text-muted-foreground transition-colors hover:text-primary block mt-1 px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Wishlist
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
