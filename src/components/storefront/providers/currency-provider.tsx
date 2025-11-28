"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Currency = {
  code: string; // ISO 4217, e.g. USD, EGP, EUR
};

type CurrencyContextType = {
  currency: Currency;
  format: (amount: number, options?: Intl.NumberFormatOptions & { codeOverride?: string }) => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>({ code: "EGP" });

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        // Cache currency for 10 minutes (600 seconds)
        const res = await fetch("/api/storefront/currency", {
          next: { revalidate: 600 }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!aborted && data?.success && data?.data?.code) {
          setCurrency({ code: String(data.data.code) });
        }
      } catch { }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  const format = useMemo(() => {
    return (amount: number, options?: Intl.NumberFormatOptions & { codeOverride?: string }) => {
      const code = options?.codeOverride || currency.code || "EGP";
      const value = Number(amount || 0);
      const isInteger = Number.isInteger(value);
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: code,
          currencyDisplay: "symbol",
          minimumFractionDigits: isInteger ? 0 : 2,
          maximumFractionDigits: isInteger ? 0 : 2,
          ...options,
        }).format(value);
      } catch {
        return `${code} ${isInteger ? value.toString() : value.toFixed(2)}`;
      }
    };
  }, [currency.code]);

  const value = useMemo(() => ({ currency, format }), [currency, format]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
