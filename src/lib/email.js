import { Resend } from "resend";
import { fmtDateTime } from "@/lib/constants";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Buncho <onboarding@resend.dev>";
const APP = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "buncho.live";
const SUPPORT = process.env.SUPPORT_EMAIL || "";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const when = (d) => `${fmtDateTime(d)} IST`;

// Returns true only if Resend accepted the email.
async function send(to, subject, html, opts = {}) {
  if (!resend || !to || to.endsWith("@no-email.local")) return false;
  try {
    const { error } = await resend.emails.send({
      from: opts.from || FROM,
      to,
      subject,
      html,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (error) {
      console.error("[email] not sent:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] failed:", e?.message);
    return false;
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

// "Ritesh <ritesh-ab12@bunch.live>", built from the expert's unique profile slug.
export function expertAddress({ name, slug }) {
  const display = String(name || "Expert").replace(/[<>",\r\n]/g, "").trim() || "Expert";
  const local = String(slug || "expert").toLowerCase().replace(/[^a-z0-9-]/g, "") || "expert";
  return `${display} <${local}@${EMAIL_DOMAIN}>`;
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
        "Accept or decline it from your dashboard.",
      ],
      { label: "Open dashboard", path: "/dashboard" }
    )
  );
}

export function emailConfirmed({ to, expertName, title, startsAt }) {
  return send(
    to,
    `Accepted: ${title}`,
    wrap(
      "Your request was accepted",
      [
        `<b>${esc(expertName || "Your expert")}</b> accepted <b>${esc(title)}</b>.`,
        `Time: ${esc(when(startsAt))}`,
        "You'll get the expert's reply by email once Buncho has checked it. It will also show on your dashboard.",
      ],
      { label: "View booking", path: "/dashboard" }
    )
  );
}

export function emailDeclined({ to, expertName, title, startsAt, refunded = false }) {
  return send(
    to,
    `Update on your request: ${title}`,
    wrap(
      "Your request was declined",
      [
        `<b>${esc(expertName || "The expert")}</b> couldn't take <b>${esc(title)}</b> on ${esc(when(startsAt))}.`,
        ...(refunded ? ["Your payment is being refunded in full."] : []),
        "You can pick another time or look at other experts.",
      ],
      { label: "Find experts", path: "/experts" }
    )
  );
}

export function emailCancelled({ to, byName, title, startsAt, refunded = false }) {
  return send(
    to,
    `Cancelled: ${title}`,
    wrap(
      "A session was cancelled",
      [
        `<b>${esc(byName || "The other person")}</b> cancelled <b>${esc(title)}</b> on ${esc(when(startsAt))}.`,
        ...(refunded ? ["Your payment is being refunded in full."] : []),
      ],
      { label: "Open dashboard", path: "/dashboard" }
    )
  );
}

// The checked reply, sent as the expert. expert = { name, slug }.
export function emailExpertReply({ to, expert, title, body }) {
  return send(
    to,
    `Reply from ${expert.name || "your expert"}: ${title}`,
    wrap(
      `${expert.name || "Your expert"} replied`,
      [
        `About: <b>${esc(title)}</b>`,
        esc(body).replace(/\n/g, "<br>"),
        "Buncho checked this reply before sending it. You can read it on your dashboard too.",
      ],
      { label: "Open dashboard", path: "/dashboard" }
    ),
    { from: expertAddress(expert), replyTo: SUPPORT }
  );
}

export function emailReplyRejected({ to, title, note }) {
  return send(
    to,
    `Your reply wasn't sent: ${title}`,
    wrap(
      "Buncho didn't send your reply",
      [`Your reply for <b>${esc(title)}</b> wasn't sent to the student.`, `Reason: ${esc(note)}`, "Edit it and send it again from your dashboard."],
      { label: "Open dashboard", path: "/dashboard" }
    )
  );
}