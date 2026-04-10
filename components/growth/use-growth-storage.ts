"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "closerflow_growth_v1";

export interface PipelineCounts {
  contacted: number;
  replied: number;
  demoBooked: number;
  closed: number;
}

export interface TestimonialRow {
  id: string;
  quote: string;
  name: string;
  role: string;
}

export interface GrowthStored {
  pipeline: PipelineCounts;
  checklist: Record<string, boolean>;
  dailyTasks: Record<string, boolean>;
  testimonials: TestimonialRow[];
  demoSlug: string;
}

const DEFAULT_PIPELINE: PipelineCounts = {
  contacted: 0,
  replied: 0,
  demoBooked: 0,
  closed: 0,
};

const DEFAULT_CHECKLIST: Record<string, boolean> = {
  contact_20: false,
  get_5_replies: false,
  book_2_demos: false,
  close_1_deal: false,
};

const DEFAULT_DAILY: Record<string, boolean> = {
  contact_10: false,
  demo_5: false,
  follow_3: false,
  call_1: false,
};

const SEED_TESTIMONIALS: TestimonialRow[] = [
  {
    id: "seed-1",
    quote:
      "Vrijdagmiddag geen gemiste WhatsApp meer — antwoorden gaan binnen seconden de deur uit.",
    name: "Mark V.",
    role: "Garage-eigenaar, regio Utrecht",
  },
  {
    id: "seed-2",
    quote:
      "Ik zie eindelijk wat elke lead waard is. Het dashboard verdiende zich terug met één extra klus.",
    name: "Sophie D.",
    role: "Service-adviseur",
  },
];

function defaultState(): GrowthStored {
  return {
    pipeline: { ...DEFAULT_PIPELINE },
    checklist: { ...DEFAULT_CHECKLIST },
    dailyTasks: { ...DEFAULT_DAILY },
    testimonials: [...SEED_TESTIMONIALS],
    demoSlug: "",
  };
}

function load(): GrowthStored {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const p = JSON.parse(raw) as Partial<GrowthStored>;
    return {
      pipeline: { ...DEFAULT_PIPELINE, ...p.pipeline },
      checklist: { ...DEFAULT_CHECKLIST, ...p.checklist },
      dailyTasks: { ...DEFAULT_DAILY, ...p.dailyTasks },
      testimonials:
        p.testimonials?.length ? p.testimonials : [...SEED_TESTIMONIALS],
      demoSlug: p.demoSlug || "",
    };
  } catch {
    return defaultState();
  }
}

function save(data: GrowthStored) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function useGrowthStorage() {
  const [data, setData] = useState<GrowthStored | null>(null);

  useEffect(() => {
    setData(load());
  }, []);

  const mutate = useCallback((fn: (prev: GrowthStored) => GrowthStored) => {
    setData((prev) => {
      const base = prev ?? load();
      const next = fn(base);
      save(next);
      return next;
    });
  }, []);

  const ensureDemoSlug = useCallback(() => {
    mutate((prev) => {
      if (prev.demoSlug) return prev;
      const slug =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID().slice(0, 8)
          : `d${Date.now().toString(36)}`;
      return { ...prev, demoSlug: slug };
    });
  }, [mutate]);

  return { data, mutate, ensureDemoSlug, ready: data !== null };
}
