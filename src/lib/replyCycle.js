// How many free follow-up answers a student can ask for on one request.
export const MAX_FOLLOW_UPS = 2;

const OPEN = ["PENDING", "SENDING", "SEND_FAILED"];

// Where a request is in the reply cycle. `replies` can be in any order.
export function replyCycle(booking, replies = []) {
  const sorted = [...replies].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const open = sorted.some((r) => OPEN.includes(r.status));
  const lastSent = [...sorted].reverse().find((r) => r.status === "SENT") ?? null;
  const asked = booking.followUpAt ? new Date(booking.followUpAt) : null;

  // The student asked again and the expert's new reply has not been sent yet.
  const followUpPending = !!asked && (!lastSent || new Date(lastSent.sentAt) <= asked);
  // The student holds an expert reply and has not answered it yet.
  const delivered = !!lastSent && !open && !followUpPending;
  // The expert may write a reply: first time, or after the student asked for more.
  const canReply = booking.status === "CONFIRMED" && !open && !delivered;
  const canFollowUp = delivered && (booking.followUpCount ?? 0) < MAX_FOLLOW_UPS;

  return { open, lastSent, followUpPending, delivered, canReply, canFollowUp };
}