"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon, { type IconName } from "./components/Icon";

type VehicleCardData = {
  id: string;
  name: string;
  category: "Scooter" | "Bike" | "EV";
  icon: IconName;
  priceDay: number;
  priceWeek: number;
  priceMonth: number;
  deposit: number;
  spec: string;
  badge: string | null;
  image: string;
};

const VEHICLES: VehicleCardData[] = [
  {
    id: "veh_001",
    name: "Honda Activa 6G",
    category: "Scooter",
    icon: "scooter",
    priceDay: 750,
    priceWeek: 4200,
    priceMonth: 15000,
    deposit: 2000,
    spec: "109 cc, BS6",
    badge: "City commute",
    image: "https://images.pexels.com/photos/2393821/pexels-photo-2393821.jpeg?auto=compress&cs=tinysrgb&w=900"
  },
  {
    id: "veh_002",
    name: "Yamaha MT-15",
    category: "Bike",
    icon: "bike",
    priceDay: 1200,
    priceWeek: 7000,
    priceMonth: 25000,
    deposit: 3000,
    spec: "155 cc, liquid cooled",
    badge: null,
    image: "https://images.pexels.com/photos/1629180/pexels-photo-1629180.jpeg?auto=compress&cs=tinysrgb&w=900"
  },
  {
    id: "veh_003",
    name: "TVS iQube",
    category: "EV",
    icon: "ev",
    priceDay: 900,
    priceWeek: 5000,
    priceMonth: 17000,
    deposit: 2500,
    spec: "Electric, 75 km range",
    badge: "Electric",
    image: "https://images.pexels.com/photos/8442674/pexels-photo-8442674.jpeg?auto=compress&cs=tinysrgb&w=900"
  }
];

const HOW_STEPS: Array<{ icon: IconName; title: string; desc: string }> = [
  {
    icon: "location",
    title: "Set the ride window",
    desc: "Choose a Bengaluru pickup hub, date, time, and rental duration."
  },
  {
    icon: "scooter",
    title: "Pick the right vehicle",
    desc: "Compare scooters, bikes, and EVs with deposits and tariffs upfront."
  },
  {
    icon: "idCard",
    title: "Verify once",
    desc: "Complete DigiLocker-based KYC before payment confirmation."
  },
  {
    icon: "shield",
    title: "Pay and manage",
    desc: "Use checkout, extensions, cancellations, and booking updates online."
  }
];

const RENTAL_PLANS = [
  { name: "Hourly", detail: "Short errands and quick meetings", value: "From Rs. 120/hour" },
  { name: "Daily", detail: "Office commute and single-day plans", value: "From Rs. 750/day" },
  { name: "Weekly", detail: "Busy city weeks and work assignments", value: "From Rs. 4,200/week" },
  { name: "Monthly", detail: "Long stays and repeat local travel", value: "From Rs. 15,000/month" }
];

const TRUST_FACTS: Array<{ icon: IconName; title: string; detail: string }> = [
  {
    icon: "money",
    title: "Quote before commitment",
    detail: "Fare, add-ons, tax, coupon impact, and deposit are shown before booking."
  },
  {
    icon: "shield",
    title: "Payment confirmation flow",
    detail: "Razorpay order and webhook confirmation are wired into the booking lifecycle."
  },
  {
    icon: "idCard",
    title: "KYC-first access",
    detail: "DigiLocker start, callback, and status polling are supported in the app."
  },
  {
    icon: "support",
    title: "Role-based operations",
    detail: "Customer, partner, and admin surfaces support day-to-day rental operations."
  }
];

const LOCATIONS = [
  "Indiranagar",
  "Koramangala",
  "Whitefield",
  "Electronic City",
  "Marathahalli",
  "HSR Layout",
  "Jayanagar",
  "BTM Layout",
  "Hebbal",
  "Yelahanka",
  "Bellandur",
  "JP Nagar"
];

const FAQS = [
  {
    q: "What documents are required for booking?",
    a: "Aadhaar and Driving Licence are required for the DigiLocker-based KYC flow."
  },
  {
    q: "How is the deposit handled?",
    a: "The security deposit is added during booking and tied to return-condition workflows."
  },
  {
    q: "Can I extend a live booking?",
    a: "Yes. Extension is available through the booking flow, subject to vehicle availability."
  },
  {
    q: "How is pricing shown?",
    a: "Quotes include base fare, duration amount, add-ons, tax, coupon impact, and total payable."
  }
];

const TIME_OPTIONS = Array.from({ length: 36 }, (_, index) => {
  const totalMinutes = 6 * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const labelDate = new Date(2026, 0, 1, hours, minutes);
  return {
    value,
    label: labelDate.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
  };
});

function toDateValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function fromDateTimeParts(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function nearestTimeSlot(date: Date) {
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  let closest = TIME_OPTIONS[0].value;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const slot of TIME_OPTIONS) {
    const [hours, minutes] = slot.value.split(":").map(Number);
    const slotMinutes = hours * 60 + minutes;
    const distance = Math.abs(slotMinutes - totalMinutes);
    if (distance < bestDistance) {
      closest = slot.value;
      bestDistance = distance;
    }
  }
  return closest;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function addMonths(date: Date, value: number) {
  return new Date(date.getFullYear(), date.getMonth() + value, 1);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function buildCalendarCells(viewMonth: Date) {
  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  return Array.from({ length: 42 }, (_, offset) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + offset);
    return {
      date,
      inCurrentMonth: date.getMonth() === viewMonth.getMonth()
    };
  });
}

function buildInitialSchedule() {
  const now = new Date();
  const pickup = new Date(now.getTime() + 60 * 60 * 1000);
  const drop = new Date(pickup.getTime() + 24 * 60 * 60 * 1000);
  return {
    pickupDate: toDateValue(pickup),
    pickupTime: nearestTimeSlot(pickup),
    dropDate: toDateValue(drop),
    dropTime: nearestTimeSlot(drop)
  };
}

function toDateTimeIso(dateValue: string, timeValue: string) {
  return fromDateTimeParts(dateValue, timeValue).toISOString();
}

function hoursForDuration(duration: "hourly" | "daily" | "weekly" | "monthly") {
  switch (duration) {
    case "hourly":
      return 1;
    case "daily":
      return 24;
    case "weekly":
      return 24 * 7;
    case "monthly":
      return 24 * 30;
    default:
      return 24;
  }
}

function formatDateLabel(dateValue: string) {
  const date = parseDateValue(dateValue);
  if (!date) return "Select date";
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatDateTimeLabel(dateValue: string, timeValue: string) {
  const date = fromDateTimeParts(dateValue, timeValue);
  return (
    date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short"
    }) + ` ${timeValue}`
  );
}

function CalendarDatePicker({
  value,
  onChange,
  minDate
}: {
  value: string;
  onChange: (next: string) => void;
  minDate?: string;
}) {
  const selectedDate = parseDateValue(value) ?? new Date();
  const min = minDate ? parseDateValue(minDate) : null;
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  useEffect(() => {
    const picked = parseDateValue(value);
    if (!picked) return;
    setViewMonth(new Date(picked.getFullYear(), picked.getMonth(), 1));
  }, [value]);

  const cells = useMemo(() => buildCalendarCells(viewMonth), [viewMonth]);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="field-control flex items-center justify-between"
      >
        <span className="text-left">{formatDateLabel(value)}</span>
        <Icon name="calendar" className="h-4 w-4 text-[color:var(--color-muted)]" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-[320px] max-w-[calc(100vw-4rem)] rounded-lg border border-[color:var(--color-line)] bg-white p-3 shadow-[0_18px_44px_color-mix(in_oklch,var(--color-ink)_18%,transparent)]">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((month) => addMonths(month, -1))}
              className="nav-focus h-8 w-8 rounded-md border border-[color:var(--color-line)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-2)]"
              aria-label="Previous month"
            >
              {"<"}
            </button>
            <div className="text-sm font-bold">
              {viewMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </div>
            <button
              type="button"
              onClick={() => setViewMonth((month) => addMonths(month, 1))}
              className="nav-focus h-8 w-8 rounded-md border border-[color:var(--color-line)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-2)]"
              aria-label="Next month"
            >
              {">"}
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="py-1 text-center text-[11px] font-semibold text-[color:var(--color-muted)]">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const dateValue = toDateValue(cell.date);
              const disabled = !!min && startOfDay(cell.date).getTime() < startOfDay(min).getTime();
              const selected = isSameDay(cell.date, selectedDate);
              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(dateValue);
                    setOpen(false);
                  }}
                  className={`h-9 rounded-md text-sm transition-colors ${
                    selected
                      ? "bg-[color:var(--color-ink)] text-white"
                      : cell.inCurrentMonth
                        ? "text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-2)]"
                        : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-paper-2)]"
                  } ${disabled ? "cursor-not-allowed opacity-35 hover:bg-transparent" : ""}`}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[color:var(--color-line)] last:border-0">
      <button
        className="nav-focus flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-bold text-[color:var(--color-ink)] sm:text-base">{q}</span>
        <span className={`text-2xl font-light text-[color:var(--color-muted)] transition-transform duration-200 ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      {open && <p className="max-w-2xl pb-5 pr-8 text-sm leading-relaxed text-[color:var(--color-copy)]">{a}</p>}
    </div>
  );
}

function VehicleCard({ v }: { v: VehicleCardData }) {
  return (
    <Link href={`/book/${v.id}`} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="card transition-colors duration-200 group-hover:border-[color:var(--color-ink)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--color-paper-2)]">
          <img
            src={v.image}
            alt={`${v.name} rental option`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <span className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[color:var(--color-ink)] shadow-sm">
            <Icon name={v.icon} className="h-5 w-5" />
          </span>
          {v.badge && (
            <div className="absolute left-3 top-3 rounded-full bg-[color:var(--color-ink)] px-3 py-1 text-[11px] font-semibold text-white">
              {v.badge}
            </div>
          )}
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[color:var(--color-ink)] shadow-sm">
            <Icon name="location" className="h-3 w-3" />
            Bengaluru
          </div>
        </div>

        <div className="p-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold leading-tight text-[color:var(--color-ink)]">{v.name}</h3>
            <span className="rounded-full bg-[color:var(--color-paper-2)] px-3 py-1 text-xs font-semibold text-[color:var(--color-copy)]">
              {v.category}
            </span>
          </div>
          <p className="mb-5 text-xs text-[color:var(--color-muted)]">{v.spec}</p>

          <div className="mb-5 grid grid-cols-3 overflow-hidden rounded-lg border border-[color:var(--color-line)]">
            {[
              { label: "Daily", price: v.priceDay },
              { label: "Weekly", price: v.priceWeek },
              { label: "Monthly", price: v.priceMonth }
            ].map((p) => (
              <div key={p.label} className="border-r border-[color:var(--color-line)] py-3 text-center last:border-r-0">
                <div className="mb-1 text-[10px] font-semibold uppercase text-[color:var(--color-muted)]">{p.label}</div>
                <div className="text-sm font-bold text-[color:var(--color-ink)]">Rs. {p.price.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[color:var(--color-muted)]">Deposit Rs. {v.deposit.toLocaleString()}</span>
            <span className="text-sm font-bold text-[color:var(--color-ink)] group-hover:underline">Book Now</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function HomePage() {
  const initialSchedule = useMemo(() => buildInitialSchedule(), []);
  const [duration, setDuration] = useState<"hourly" | "daily" | "weekly" | "monthly">("daily");
  const [pickupDate, setPickupDate] = useState(initialSchedule.pickupDate);
  const [pickupTime, setPickupTime] = useState(initialSchedule.pickupTime);
  const [dropDate, setDropDate] = useState(initialSchedule.dropDate);
  const [dropTime, setDropTime] = useState(initialSchedule.dropTime);
  const [pickupLocation, setPickupLocation] = useState(LOCATIONS[0]);

  useEffect(() => {
    const pickupAt = fromDateTimeParts(pickupDate, pickupTime);
    const nextDrop = new Date(pickupAt.getTime() + hoursForDuration(duration) * 60 * 60 * 1000);
    setDropDate(toDateValue(nextDrop));
    setDropTime(nearestTimeSlot(nextDrop));
  }, [duration, pickupDate, pickupTime]);

  useEffect(() => {
    const pickupAt = fromDateTimeParts(pickupDate, pickupTime);
    const dropAt = fromDateTimeParts(dropDate, dropTime);
    if (dropAt.getTime() <= pickupAt.getTime()) {
      const fallbackDrop = new Date(pickupAt.getTime() + 60 * 60 * 1000);
      setDropDate(toDateValue(fallbackDrop));
      setDropTime(nearestTimeSlot(fallbackDrop));
    }
  }, [pickupDate, pickupTime, dropDate, dropTime]);

  const pickupAtIso = toDateTimeIso(pickupDate, pickupTime);
  const dropAtIso = toDateTimeIso(dropDate, dropTime);
  const searchHref = `/browse?duration=${duration}&pickup_at=${encodeURIComponent(pickupAtIso)}&drop_at=${encodeURIComponent(dropAtIso)}&pickup_location=${encodeURIComponent(pickupLocation)}`;

  return (
    <div className="bg-[color:var(--color-paper)]">
      <section className="relative overflow-hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-ink)] py-12 text-white sm:py-16 lg:py-20">
        <div className="section-shell relative">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-end lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="min-w-0"
            >
              <p className="mb-5 text-sm font-semibold text-[color:var(--color-accent)]">Bengaluru bike rentals</p>
              <h1 className="mb-6 max-w-[820px] text-[clamp(2.65rem,8vw,5.35rem)] font-black leading-[0.94] text-white">
                <span className="block">City rides,</span>
                <span className="block whitespace-nowrap text-[0.78em]">booked cleanly.</span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/70">
                Scooters, bikes, and EVs with KYC-first booking, clear deposits, and rental windows that fit real Bengaluru days.
              </p>

              <div className="mb-8 flex flex-wrap gap-2">
                {[
                  { icon: "idCard", text: "DigiLocker KYC" },
                  { icon: "shield", text: "Razorpay checkout" },
                  { icon: "money", text: "Transparent pricing" },
                  { icon: "clock", text: "Flexible durations" }
                ].map((t) => (
                  <span key={t.text} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
                    <Icon name={t.icon as IconName} className="h-3.5 w-3.5" />
                    {t.text}
                  </span>
                ))}
              </div>

              <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
                {[
                  { n: "Hourly to monthly", l: "Rental plans" },
                  { n: "Digital KYC", l: "Before payment" },
                  { n: "Extend or cancel", l: "Online workflows" }
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-bold leading-tight text-white">{s.n}</div>
                    <div className="mt-1 text-xs text-white/55">{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid max-w-4xl grid-cols-[1.4fr_0.8fr] gap-3 max-sm:grid-cols-1">
                <img
                  src="https://images.pexels.com/photos/1629180/pexels-photo-1629180.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Motorcycle ready for city rental"
                  className="h-64 w-full rounded-lg object-cover sm:h-80"
                />
                <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-white/5 p-5">
                  <p className="text-sm leading-relaxed text-white/68">
                    Built for practical city use: office commutes, weekend errands, short stays, and partner-managed fleet ops.
                  </p>
                  <Link href="/browse" className="btn-primary mt-6 w-full">
                    Browse Fleet
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
              className="rounded-lg border border-white/60 bg-[color:var(--color-paper)] p-5 text-[color:var(--color-ink)] shadow-[0_24px_70px_color-mix(in_oklch,var(--color-ink)_36%,transparent)] sm:p-6"
            >
              <h2 className="mb-1 text-xl font-black text-[color:var(--color-ink)]">Find a bike</h2>
              <p className="mb-5 text-sm text-[color:var(--color-copy)]">Select duration, dates, and pickup location.</p>

              <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-[color:var(--color-paper-2)] p-1 sm:grid-cols-4">
                {(["hourly", "daily", "weekly", "monthly"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`rounded-md py-2 text-xs font-semibold capitalize transition-colors ${
                      duration === d
                        ? "bg-[color:var(--color-ink)] text-white"
                        : "text-[color:var(--color-copy)] hover:bg-white hover:text-[color:var(--color-ink)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">Pickup date and time</label>
                  <div className="grid w-full grid-cols-1 gap-2 rounded-lg border border-[color:var(--color-line)] bg-white p-2.5 sm:grid-cols-[1fr_138px]">
                    <CalendarDatePicker value={pickupDate} onChange={setPickupDate} minDate={toDateValue(new Date())} />
                    <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="field-control">
                      {TIME_OPTIONS.map((option) => (
                        <option key={`pickup-time-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">Drop date and time</label>
                  <div className="grid w-full grid-cols-1 gap-2 rounded-lg border border-[color:var(--color-line)] bg-white p-2.5 sm:grid-cols-[1fr_138px]">
                    <CalendarDatePicker value={dropDate} onChange={setDropDate} minDate={pickupDate} />
                    <select value={dropTime} onChange={(e) => setDropTime(e.target.value)} className="field-control">
                      {TIME_OPTIONS.map((option) => (
                        <option key={`drop-time-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-bold text-[color:var(--color-muted)]">Pickup location</label>
                <select value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="field-control">
                  {LOCATIONS.map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
              </div>

              <p className="mb-3 text-xs text-[color:var(--color-copy)]">
                {formatDateTimeLabel(pickupDate, pickupTime)} to {formatDateTimeLabel(dropDate, dropTime)}
              </p>

              <Link href={searchHref} className="btn-primary w-full py-3.5 text-base">
                Search Available Bikes
              </Link>

              <p className="mt-3 text-center text-[10px] font-semibold text-[color:var(--color-muted)]">
                Secure checkout - policy-first pricing - online booking updates
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-paper)] py-16 sm:py-20 lg:py-24">
        <div className="section-shell">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold text-[color:var(--color-accent-strong)]">Fleet preview</p>
              <h2 className="section-title">Popular rides in Bengaluru</h2>
            </div>
            <Link href="/browse" className="btn-primary self-start whitespace-nowrap sm:self-auto">
              View All Bikes
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VEHICLES.map((vehicle) => (
              <VehicleCard key={vehicle.id} v={vehicle} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[color:var(--color-line)] bg-white py-16 sm:py-20 lg:py-24">
        <div className="section-shell">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <h2 className="section-title">A rental flow that stays out of the way.</h2>
            <p className="section-copy max-w-2xl">
              The public experience is short and practical, while the platform keeps KYC, payment confirmation, and booking state changes explicit behind the scenes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((step) => (
              <div key={step.title} className="rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-6">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-ink)]">
                  <Icon name={step.icon} className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold text-[color:var(--color-ink)]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[color:var(--color-copy)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-paper-2)] py-16 sm:py-20 lg:py-24">
        <div className="section-shell">
          <div className="mb-10">
            <p className="mb-3 text-sm font-semibold text-[color:var(--color-accent-strong)]">Rental plans</p>
            <h2 className="section-title">Choose by duration, not by guesswork.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {RENTAL_PLANS.map((plan) => (
              <div key={plan.name} className="rounded-lg border border-[color:var(--color-line)] bg-white p-5">
                <div className="mb-3 text-sm font-bold text-[color:var(--color-ink)]">{plan.name}</div>
                <div className="mb-2 text-xl font-black text-[color:var(--color-ink)]">{plan.value}</div>
                <p className="text-sm leading-relaxed text-[color:var(--color-copy)]">{plan.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-ink)] py-16 text-white sm:py-20 lg:py-24">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="mb-3 text-sm font-semibold text-[color:var(--color-accent)]">Trust signals</p>
              <h2 className="mb-6 text-[clamp(2.2rem,5vw,4.75rem)] font-black leading-none text-white">
                Built for policy-first rentals.
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-white/62">
                The product is not just a glossy storefront. It accounts for quotes, KYC, payments, booking changes, fleet operations, and admin review.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {TRUST_FACTS.map((fact) => (
                <div key={fact.title} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[color:var(--color-accent)]">
                    <Icon name={fact.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-white">{fact.title}</h3>
                  <p className="text-sm leading-relaxed text-white/62">{fact.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="section-shell">
          <div className="mb-10 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <h2 className="section-title">Pickup hubs across Bengaluru</h2>
            <p className="section-copy">
              Choose a convenient pickup zone during booking and confirm availability in the flow.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {LOCATIONS.map((location) => (
              <div key={location} className="chip justify-center gap-1.5 text-center text-xs">
                <Icon name="location" className="h-3.5 w-3.5" />
                {location}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-paper)] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold text-[color:var(--color-accent-strong)]">FAQ</p>
            <h2 className="section-title">Common questions</h2>
          </div>

          <div className="rounded-lg border border-[color:var(--color-line)] bg-white px-4 py-2 sm:px-8">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-paper)] py-16 sm:py-20 lg:py-24">
        <div className="section-shell text-center">
          <h2 className="mx-auto mb-5 max-w-3xl text-[clamp(2.4rem,6vw,5.5rem)] font-black leading-none text-[color:var(--color-ink)]">
            Ready to book the ride?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-[color:var(--color-copy)]">
            Complete KYC once and book available bikes with transparent pricing.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/browse" className="btn-primary px-10 py-3.5 text-base">
              Browse Bikes
            </Link>
            <Link href="/kyc" className="btn-secondary px-10 py-3.5 text-base">
              Start KYC
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
