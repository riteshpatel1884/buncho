import { IST } from "./constants";
import { fmtMinutes } from "./constants";

const DAY = 24 * 60 * 60 * 1000;
const STEP_MIN = 30;

export const ymdIST = (d) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

// Open booking slots for the next `days` days (India time).
//  availability: [{ weekday, startMin, endMin }]
//  busy: [{ startsAt, endsAt }] pending or confirmed bookings
export function buildSlots({ availability, busy, durationMin, days = 14, now = new Date(), leadHours = 3 }) {
  const earliest = now.getTime() + leadHours * 60 * 60 * 1000;
  const result = [];

  for (let i = 0; i < days; i++) {
    const ymd = ymdIST(new Date(now.getTime() + i * DAY));
    const midnight = new Date(`${ymd}T00:00:00+05:30`).getTime();
    const weekday = new Date(`${ymd}T12:00:00+05:30`).getUTCDay();
    const slots = [];

    for (const w of availability.filter((a) => a.weekday === weekday)) {
      for (let start = w.startMin; start + durationMin <= w.endMin; start += STEP_MIN) {
        const startMs = midnight + start * 60000;
        const endMs = startMs + durationMin * 60000;
        if (startMs < earliest) continue;
        const clash = busy.some((b) => new Date(b.startsAt).getTime() < endMs && new Date(b.endsAt).getTime() > startMs);
        if (clash) continue;
        slots.push({ iso: new Date(startMs).toISOString(), label: fmtMinutes(start), startMin: start });
      }
    }

    if (slots.length) {
      slots.sort((a, b) => a.startMin - b.startMin);
      const label = new Intl.DateTimeFormat("en-IN", { timeZone: IST, weekday: "short", day: "numeric", month: "short" }).format(new Date(midnight + 12 * 3600000));
      result.push({ ymd, label, slots: slots.map(({ iso, label }) => ({ iso, label })) });
    }
  }
  return result;
}
