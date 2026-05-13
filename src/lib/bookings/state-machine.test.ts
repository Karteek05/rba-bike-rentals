import { describe, expect, it } from "vitest";
import { assertCanTransition } from "@/lib/bookings/state-machine";

describe("booking state machine", () => {
  it("allows confirmed to ongoing", () => {
    expect(() =>
      assertCanTransition("confirmed", "ongoing", "pickup_start")
    ).not.toThrow();
  });

  it("requires admin review before payment", () => {
    expect(() =>
      assertCanTransition("pending_kyc", "admin_review", "kyc_verified")
    ).not.toThrow();
    expect(() =>
      assertCanTransition("admin_review", "payment_pending", "admin_approve")
    ).not.toThrow();
    expect(() =>
      assertCanTransition("pending_kyc", "payment_pending", "skip_admin")
    ).toThrow();
  });

  it("blocks completed to ongoing", () => {
    expect(() =>
      assertCanTransition("completed", "ongoing", "invalid_reopen")
    ).toThrow();
  });
});

