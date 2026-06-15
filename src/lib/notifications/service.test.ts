import { describe, expect, it } from "vitest";
import { buildUserEmail } from "@/lib/notifications/service";

describe("notification email templates", () => {
  it("builds a professional booking approval email with a payment link", () => {
    const email = buildUserEmail({
      templateKey: "booking_approved_pay_now",
      payload: {
        booking_id: "booking_123",
        vehicle_id: "veh_001",
        total_payable: 3200,
        payment_url: "https://rbabikerentals.vercel.app/my-bookings?pay=booking_123"
      }
    });

    expect(email?.subject).toBe("Your RBA booking is approved");
    expect(email?.text).toContain("Complete payment");
    expect(email?.text).toContain("https://rbabikerentals.vercel.app/my-bookings?pay=booking_123");
    expect(email?.html).toContain("Complete payment");
    expect(email?.html).toContain("https://rbabikerentals.vercel.app/my-bookings?pay=booking_123");
  });
});
