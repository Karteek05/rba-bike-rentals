import { requireActor } from "@/lib/auth/context";
import { approveBooking } from "@/lib/bookings/service";
import { ok, fromError } from "@/lib/utils/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const actor = await requireActor(request, ["admin"]);
    const { bookingId } = await context.params;
    
    const updated = await approveBooking(bookingId, actor);
    return ok({ booking: updated });
  } catch (error: any) {
    return fromError(error);
  }
}
