"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Icon, { type IconName } from "../components/Icon";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  category: string;
  is_active: boolean;
  rate_per_hour: number;
  rate_per_day: number;
  rate_per_week: number;
  rate_per_month: number;
  deposit_amount: number;
  city: string;
  image: string;
};

const VEHICLES: Vehicle[] = [
  {
    id: "veh_001",
    brand: "Honda",
    model: "Activa 6G",
    category: "scooter",
    is_active: true,
    rate_per_hour: 120,
    rate_per_day: 750,
    rate_per_week: 4200,
    rate_per_month: 15000,
    deposit_amount: 2000,
    city: "bengaluru",
    image: "https://images.pexels.com/photos/2393821/pexels-photo-2393821.jpeg?auto=compress&cs=tinysrgb&w=900"
  },
  {
    id: "veh_002",
    brand: "Yamaha",
    model: "MT-15",
    category: "bike",
    is_active: true,
    rate_per_hour: 180,
    rate_per_day: 1200,
    rate_per_week: 7000,
    rate_per_month: 25000,
    deposit_amount: 3000,
    city: "bengaluru",
    image: "https://images.pexels.com/photos/1629180/pexels-photo-1629180.jpeg?auto=compress&cs=tinysrgb&w=900"
  },
  {
    id: "veh_003",
    brand: "TVS",
    model: "iQube",
    category: "ev_bike",
    is_active: true,
    rate_per_hour: 140,
    rate_per_day: 900,
    rate_per_week: 5000,
    rate_per_month: 17000,
    deposit_amount: 2500,
    city: "bengaluru",
    image: "https://images.pexels.com/photos/8442674/pexels-photo-8442674.jpeg?auto=compress&cs=tinysrgb&w=900"
  }
];

const CATEGORY_ICONS: Record<string, IconName> = {
  scooter: "scooter",
  bike: "bike",
  ev_bike: "ev",
  cruiser: "bike"
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "scooter", label: "Scooters" },
  { key: "bike", label: "Bikes" },
  { key: "ev_bike", label: "EV Bikes" }
];

const DURATIONS = [
  { key: "hour", label: "Hourly", rateKey: "rate_per_hour" as keyof Vehicle },
  { key: "day", label: "Daily", rateKey: "rate_per_day" as keyof Vehicle },
  { key: "week", label: "Weekly", rateKey: "rate_per_week" as keyof Vehicle },
  { key: "month", label: "Monthly", rateKey: "rate_per_month" as keyof Vehicle }
];

function mapDurationParamToRateKey(param: string | null): keyof Vehicle {
  switch (param) {
    case "hourly":
      return "rate_per_hour";
    case "weekly":
      return "rate_per_week";
    case "monthly":
      return "rate_per_month";
    case "daily":
    default:
      return "rate_per_day";
  }
}

function VehicleCard({
  vehicle,
  durationKey
}: {
  vehicle: Vehicle;
  durationKey: keyof Vehicle;
}) {
  const rate = vehicle[durationKey] as number;
  const durUnit = DURATIONS.find((d) => d.rateKey === durationKey)?.key ?? "day";
  const icon = CATEGORY_ICONS[vehicle.category] ?? "scooter";

  return (
    <Link href={`/book/${vehicle.id}`} className="group block">
      <article className="card transition-colors duration-200 group-hover:border-[color:var(--color-ink)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--color-paper-2)]">
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[color:var(--color-ink)]">
            <Icon name={icon} className="h-3.5 w-3.5" />
            {vehicle.category.replace("_", " ")}
          </span>
          <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ${vehicle.is_active ? "bg-[color:var(--color-green)] text-white" : "bg-[color:var(--color-muted)] text-white"}`}>
            {vehicle.is_active ? "Available" : "Unavailable"}
          </span>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black leading-tight text-[color:var(--color-ink)]">
                {vehicle.brand} {vehicle.model}
              </h3>
              <div className="mt-2 flex items-center gap-1 text-xs capitalize text-[color:var(--color-muted)]">
                <Icon name="location" className="h-3.5 w-3.5" />
                {vehicle.city}
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-end justify-between gap-4 border-y border-[color:var(--color-line)] py-4">
            <div>
              <span className="text-3xl font-black text-[color:var(--color-ink)]">Rs. {rate.toLocaleString()}</span>
              <span className="ml-1 text-sm text-[color:var(--color-copy)]">/{durUnit}</span>
            </div>
            <p className="text-right text-xs text-[color:var(--color-muted)]">
              Deposit<br />
              Rs. {vehicle.deposit_amount.toLocaleString()}
            </p>
          </div>

          <span className="btn-primary w-full py-2.5 text-sm">Book Now</span>
        </div>
      </article>
    </Link>
  );
}

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const initialDuration = mapDurationParamToRateKey(searchParams.get("duration"));
  const [category, setCategory] = useState("all");
  const [duration, setDuration] = useState<keyof Vehicle>(initialDuration);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "model">("price_asc");

  useEffect(() => {
    setDuration(mapDurationParamToRateKey(searchParams.get("duration")));
  }, [searchParams]);

  const currentDurUnit = DURATIONS.find((d) => d.rateKey === duration)?.key ?? "day";

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const list = VEHICLES.filter((vehicle) => {
      const matchCat = category === "all" || vehicle.category === category;
      const rate = vehicle[duration] as number;
      const matchPrice = rate <= maxPrice;
      const matchQuery =
        !normalizedQuery || `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(normalizedQuery);
      return matchCat && matchPrice && matchQuery;
    });

    return list.sort((a, b) => {
      if (sortBy === "model") {
        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      }
      const aRate = a[duration] as number;
      const bRate = b[duration] as number;
      return sortBy === "price_asc" ? aRate - bRate : bRate - aRate;
    });
  }, [category, duration, maxPrice, query, sortBy]);

  return (
    <div className="min-h-screen bg-[color:var(--color-paper)]">
      <section className="border-b border-[color:var(--color-line)] bg-[color:var(--color-ink)] py-12 text-white sm:py-16">
        <div className="section-shell">
          <div className="grid gap-8 md:grid-cols-[1fr_340px] md:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold text-[color:var(--color-accent)]">Fleet catalogue</p>
              <h1 className="max-w-3xl text-[clamp(2.75rem,7vw,6.25rem)] font-black leading-none text-white">
                Choose the bike around your day.
              </h1>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="text-3xl font-black text-white">{filtered.length}</div>
              <p className="mt-1 text-sm leading-relaxed text-white/62">
                vehicle(s) currently matching your filters in Bengaluru.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[72px] z-40 border-b border-[color:var(--color-line)] bg-[color:var(--color-paper)]/95 backdrop-blur-md">
        <div className="section-shell py-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCategory(item.key)}
                  className={`chip ${category === item.key ? "chip-active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
              {DURATIONS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setDuration(item.rateKey)}
                  className={`chip ${duration === item.rateKey ? "chip-active" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-[220px_190px] lg:grid-cols-[220px_190px]">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search model"
                  className="field-control pl-9"
                />
              </div>
              <select
                className="field-control"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "price_asc" | "price_desc" | "model")}
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="model">Model Name</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm font-semibold text-[color:var(--color-copy)]">
              Max Rs. {maxPrice.toLocaleString()}/{currentDurUnit}
            </label>
            <input
              type="range"
              min={120}
              max={30000}
              step={100}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="w-full accent-[color:var(--color-ink)] sm:w-72"
            />
          </div>
        </div>
      </section>

      <section className="section-shell py-10 sm:py-12">
        {filtered.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-lg border border-dashed border-[color:var(--color-line)] bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-paper-2)]">
              <Icon name="search" className="h-7 w-7 text-[color:var(--color-copy)]" />
            </div>
            <h2 className="mb-2 text-2xl font-black text-[color:var(--color-ink)]">No vehicles match your filters</h2>
            <p className="mb-6 text-sm text-[color:var(--color-copy)]">Try adjusting category, price, or model search.</p>
            <button
              onClick={() => {
                setCategory("all");
                setMaxPrice(30000);
                setQuery("");
                setSortBy("price_asc");
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} durationKey={duration} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--color-paper)]" />}>
      <BrowsePageContent />
    </Suspense>
  );
}
