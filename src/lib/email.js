import { Resend } from "resend";
import { fmtDateTime } from "@/lib/constants";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Buncho <onboarding@resend.dev>";
const APP = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const when = (d) => `${fmtDateTime(d)} IST`;

async function send(to, subject, html) {
  if (!resend || !to || to.endsWith("@no-email.local")) return;
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("[email] not sent:", error);
  } catch (e) {
    console.error("[email] failed:", e?.message);
  }
}

function wrap(heading, lines, cta) {
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0d1b14">
  <p style="font-size:20px;font-weight:700;margin:0 0 16px">buncho<span style="color:#15803d">.</span></p>
  <h1 style="font-size:20px;margin:0 0 12px">${esc(heading)}</h1>
  ${lines.map((l) => `<p style="margin:0 0 10px;font-size:15px;line-height:1.5">${l}</p>`).join("")}
  <p style="margin:20px 0 0"><a href="${APP}${cta.path}" style="background:#15803d;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;font-weight:600">${esc(cta.label)}</a></p>
</div>`;
}

export function emailNewRequest({ to, studentName, title, startsAt, note }) {
  return send(
    to,
    `New booking request: ${title}`,
    wrap(
      "You have a new booking request",
      [
        `<b>${esc(studentName || "A student")}</b> asked to book <b>${esc(title)}</b>.`,
        `Time: ${esc(when(startsAt))}`,
        ...(note ? [`Note: ${esc(note)}`] : []),
        "Confirm or decline it from your dashboard.",
      ],
      { label: "Open dashboard", path: "/dashboard" }
    )
  );
}

export function emailConfirmed({ to, expertName, title, startsAt, meetingUrl }) {
  return send(
    to,
    `Confirmed: ${title}`,
    wrap(
      "Your session is confirmed",
      [
        `<b>${esc(expertName || "Your expert")}</b> confirmed <b>${esc(title)}</b>.`,
        `Time: ${esc(when(startsAt))}`,
        meetingUrl
          ? `Meeting link: <a href="${esc(meetingUrl)}">${esc(meetingUrl)}</a>`
          : "The expert will share a meeting link on your dashboard.",
      ],
      { label: "View booking", path: "/dashboard" }
    )
  );
}

export function emailDeclined({ to, expertName, title, startsAt }) {
  return send(
    to,
    `Update on your request: ${title}`,
    wrap(
      "Your request was declined",
      [
        `<b>${esc(expertName || "The expert")}</b> couldn't take <b>${esc(title)}</b> on ${esc(when(startsAt))}.`,
        "You can pick another time or look at other experts.",
      ],
      { label: "Find experts", path: "/experts" }
    )
  );
}

export function emailCancelled({ to, byName, title, startsAt }) {
  return send(
    to,
    `Cancelled: ${title}`,
    wrap(
      "A session was cancelled",
      [`<b>${esc(byName || "The other person")}</b> cancelled <b>${esc(title)}</b> on ${esc(when(startsAt))}.`],
      { label: "Open dashboard", path: "/dashboard" }
    )
  );
}