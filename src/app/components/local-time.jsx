"use client";

export default function LocalTime({ date }) {
  const d = new Date(date);
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
    </time>
  );
}