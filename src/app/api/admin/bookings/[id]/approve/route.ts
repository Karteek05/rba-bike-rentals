import { requireActor } from "@/lib/auth/context";
import { approveBooking } from "@/lib/admin/service";
import type { ApproveBookingRequest } from "@/lib/types/contracts";
import { parseJson, ok, fromError } from "@/lib/utils/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor(request, ["admin"]);
    const body = await parseJson<ApproveBookingRequest>(request);
    const { id } = await context.params;
    const booking = await approveBooking(id, body, actor);
    return ok({ booking });
  } catch (error) {
    return fromError(error);
  }
}
