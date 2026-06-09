import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "RBA Bike Rentals - Rent a Bike in Bengaluru",
  description:
    "Affordable scooter rentals in Bengaluru with weekly, 15-day, and monthly GST-inclusive packages.",
  keywords: "bike rental, bengaluru, scooter, two-wheeler, rbabikerentals"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-[color:var(--color-paper)] text-[color:var(--color-ink)] antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
