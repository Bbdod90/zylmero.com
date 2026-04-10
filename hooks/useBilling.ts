"use client";

import { useCallback, useState } from "react";

/**
 * Client hook for billing actions once Stripe is connected.
 * Keeps a single place for loading / error state on upgrade CTAs.
 */
export function useBilling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (_priceId: string) => {
      setLoading(true);
      setError(null);
      try {
        // await fetch('/api/billing/checkout', { method: 'POST', ... })
        setError("Checkout will open here once Stripe is enabled.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, error, startCheckout };
}
