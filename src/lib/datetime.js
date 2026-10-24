/* India has no daylight saving, so IST is a fixed +05:30 offset. */
const IST = 'Asia/Kolkata';

const toDate = (d) => (d instanceof Date ? d : new Date(d));

/** "23 Oct 2026" */
export function formatDateIST(d) {
  if (!d) return '';
  return toDate(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: IST });
}

/** "23 Oct 2026, 9:05 pm IST" */
export function formatDateTimeIST(d) {
  if (!d) return '';
  const date = toDate(d);
  const day = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: IST });
  const time = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: IST });
  return `${day}, ${time} IST`;
}

/** "9:05 pm IST" */
export function formatTimeIST(d) {
  return `${toDate(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: IST })} IST`;
}

/** Value for <input type="datetime-local"> showing the given instant in IST. */
export function toISTInputValue(d) {
  if (!d) return '';
  const shifted = new Date(toDate(d).getTime() + 5.5 * 3600 * 1000);
  return shifted.toISOString().slice(0, 16);
}

/** Reads a datetime-local value as IST wall-clock time and returns the matching Date (UTC instant). */
export function fromISTInputValue(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00+05:30`);
  return Number.isNaN(d.getTime()) ? null : d;
}
