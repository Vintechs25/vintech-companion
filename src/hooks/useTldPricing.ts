import { useState, useEffect } from "react";
import { domainsApi } from "@/lib/api";

export interface TldPrice {
  tld: string;
  register: string;
  transfer: string;
  renew: string;
  popular?: boolean;
}

// Popular TLDs to highlight
const POPULAR_TLDS = ["com", "net", "io", "co", "dev", "org"];

// Auto-refresh interval (5 minutes)
const REFRESH_INTERVAL = 5 * 60 * 1000;

export function useTldPricing() {
  const [pricing, setPricing] = useState<TldPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPricing = async () => {
    try {
      const data = await domainsApi.getPricing();
      
      // Transform pricing response to our format
      const tldList: TldPrice[] = Object.entries(data).map(([tld, prices]) => ({
        tld: `.${tld}`,
        register: extractPrice(prices?.register),
        transfer: extractPrice(prices?.transfer),
        renew: extractPrice(prices?.renew),
        popular: POPULAR_TLDS.includes(tld.toLowerCase()),
      }));

      // Sort: popular first, then alphabetically
      tldList.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.tld.localeCompare(b.tld);
      });

      setPricing(tldList);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch TLD pricing:", err);
      setError("Failed to load pricing");
      // Fallback to common pricing
      if (pricing.length === 0) {
        setPricing(getFallbackPricing());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();

    // Auto-refresh pricing every 5 minutes
    const intervalId = setInterval(fetchPricing, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return { pricing, isLoading, error, lastUpdated, refetch: fetchPricing };
}

// Extract price from WHMCS pricing object (handles different year keys)
function extractPrice(priceObj: unknown): string {
  if (!priceObj || typeof priceObj !== "object") return "0";
  
  const prices = priceObj as Record<string, string>;
  // Try to get 1-year price first, then 2-year, etc.
  return prices["1"] || prices["2"] || prices["3"] || Object.values(prices)[0] || "0";
}

// Fallback pricing if API fails
function getFallbackPricing(): TldPrice[] {
  return [
    { tld: ".com", register: "1500", transfer: "1500", renew: "1500", popular: true },
    { tld: ".net", register: "1800", transfer: "1800", renew: "1800", popular: true },
    { tld: ".org", register: "1600", transfer: "1600", renew: "1600", popular: false },
    { tld: ".io", register: "4500", transfer: "4500", renew: "4500", popular: true },
    { tld: ".co", register: "3500", transfer: "3500", renew: "3500", popular: true },
    { tld: ".dev", register: "2000", transfer: "2000", renew: "2000", popular: true },
  ];
}

// Get price for a specific TLD
export function getTldPrice(pricing: TldPrice[], tld: string): TldPrice | undefined {
  const cleanTld = tld.startsWith(".") ? tld : `.${tld}`;
  return pricing.find((p) => p.tld.toLowerCase() === cleanTld.toLowerCase());
}
