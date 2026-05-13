import { describe, expect, it } from "vitest";
import { approveBooking } from "@/lib/admin/service";
import { createBooking } from "@/lib/bookings/service";

describe("admin gated booking flow", () => {
  it("creates verified-user bookings in admin review and opens payment after approval", async () => {
    const baseTime = Date.now();
    const start = new Date(baseTime + 10 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date(baseTime + 11 * 24 * 60 * 60 * 1000).toISOString();

    const booking = await createBooking(
      {
        user_id: "cust_001",
        vehicle_id: "veh_003",
        city: "bengaluru",
        pickup_at: start,
        drop_at: end,
        pickup_zone: "Indiranagar",
        duration_bucket: "day",
        duration_value: 1,
        km_limit_bucket: "day",
        km_limit_value: 120,
        customer_profile: {
          legal_name: "Rahul Customer",
          email: "rahul@example.com",
          mobile: "+919876543210",
          pan_number: "ABCDE1234F",
          date_of_birth: "1996-01-15",
          cibil_consent: true
        }
      },
      { userId: "cust_001", role: "customer" }
    );

    expect(booking.status).toBe("admin_review");
    expect(booking.payment_order).toBeNull();

    const approved = await approveBooking(
      booking.id,
      { note: "test approval" },
      { userId: "admin_001", role: "admin" }
    );

    expect(approved.status).toBe("payment_pending");
  });
});
