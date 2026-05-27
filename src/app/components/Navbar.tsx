"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/browse", label: "Browse Bikes" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/my-bookings", label: "My Bookings" },
  { href: "/kyc", label: "KYC" },
  { href: "/login", label: "Login / Register" }
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/#how-it-works") {
    return pathname === "/";
  }
  return pathname === href;
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (!open) {
      return;
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-line)] bg-[color:var(--color-paper)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-container items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="nav-focus select-none text-xl font-black tracking-normal text-[color:var(--color-ink)]">
            RBA<span className="text-[color:var(--color-accent-strong)]">.</span>
          </Link>
          <p className="hidden lg:block text-[11px] font-semibold uppercase text-[color:var(--color-muted)]">
            Bengaluru Bike Rentals
          </p>
        </div>

        <nav className="hidden md:flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-white/70 p-1">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-focus rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-[color:var(--color-ink)] text-white" : "text-[color:var(--color-copy)] hover:bg-[color:var(--color-paper-2)] hover:text-[color:var(--color-ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/browse"
            className="btn-primary hidden sm:inline-flex whitespace-nowrap"
          >
            Book a Bike
          </Link>

          <button
            type="button"
            className="nav-focus inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-white text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-paper-2)] md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-4 py-4 md:hidden">
          <nav className="mx-auto flex max-w-container flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-focus rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[color:var(--color-ink)] text-white"
                      : "text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-2)]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/browse"
              className="btn-primary mt-2 text-center sm:hidden"
              onClick={() => setOpen(false)}
            >
              Book a Bike
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
