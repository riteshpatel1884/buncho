import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Buncho <onboarding@resend.dev>";
const APP = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "bunch.live";
const SUPPORT = process.env.SUPPORT_EMAIL || "";
const REPLY_BCC = process.env.REPLY_BCC || "bunchohq@gmail.com";
const ADMIN_NOTIFY = process.env.ADMIN_NOTIFY_EMAIL || REPLY_BCC;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const money = (n) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

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
      ...(opts.bcc ? { bcc: opts.bcc } : {}),
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
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0b1b33">
  <p style="font-size:20px;font-weight:700;margin:0 0 16px">buncho<span style="color:#2347f5">.</span></p>
  <h1 style="font-size:20px;margin:0 0 12px">${esc(heading)}</h1>
  ${lines.map((l) => `<p style="margin:0 0 10px;font-size:15px;line-height:1.5">${l}</p>`).join("")}
  <p style="margin:20px 0 0"><a href="${APP}${cta.path}" style="background:#2347f5;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600">${esc(cta.label)}</a></p>
</div>`;
}

// "Ritesh <ritesh-ab12@bunch.live>", built from the expert's unique profile slug.
export function expertAddress({ name, slug }) {
  const display = String(name || "Expert").replace(/[<>",\r\n]/g, "").trim() || "Expert";
  const local = String(slug || "expert").toLowerCase().replace(/[^a-z0-9-]/g, "") || "expert";
  return `${display} <${local}@${EMAIL_DOMAIN}>`;
}

export function emailNewRequest({ to, studentName, title, note }) {
  return send(
    to,
    `New request: ${title}`,
    wrap(
      "You have a new request",
      [
        `<b>${esc(studentName || "A student")}</b> asked for <b>${esc(title)}</b>.`,
        ...(note ? [`Their question: ${esc(note).replace(/\n/g, "<br>")}`] : []),
        "Accept or decline it from your dashboard.",
      ],
      { label: "Open dashboard", path: "/dashboard" }
    )
  );
}

export function emailConfirmed({ to, expertName, title }) {
  return send(
    to,
    `Accepted: ${title}`,
    wrap(
      "Your request was accepted",
      [
        `<b>${esc(expertName || "Your expert")}</b> accepted <b>${esc(title)}</b>.`,
        "You'll get the expert's reply by email once Buncho has checked it. It will also show on your dashboard.",
      ],
      { label: "View request", path: "/dashboard" }
    )
  );
}

export function emailDeclined({ to, expertName, title, refunded = false }) {
  return send(
    to,
    `Update on your request: ${title}`,
    wrap(
      "Your request was declined",
      [
        `<b>${esc(expertName || "The expert")}</b> couldn't take <b>${esc(title)}</b>.`,
        ...(refunded ? ["Your payment is being refunded in full."] : []),
        "You can look at other experts.",
      ],
      { label: "Find experts", path: "/experts" }
    )
  );
}

export function emailCancelled({ to, byName, title, refunded = false }) {
  return send(
    to,
    `Cancelled: ${title}`,
    wrap(
      "A request was cancelled",
      [
        `<b>${esc(byName || "The other person")}</b> cancelled <b>${esc(title)}</b>.`,
        ...(refunded ? ["Your payment is being refunded in full."] : []),
      ],
      { label: "Open dashboard", path: "/dashboard" }
    )
  );
}

// The checked reply, sent as the expert. A copy goes to REPLY_BCC so you can see every one that was sent.
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
    { from: expertAddress(expert), replyTo: SUPPORT, bcc: REPLY_BCC }
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

export function emailFollowUp({ to, studentName, title, note }) {
  return send(
    to,
    `Follow-up needed: ${title}`,
    wrap(
      "The student needs a bit more",
      [
        `<b>${esc(studentName || "The student")}</b> read your reply for <b>${esc(title)}</b> and still needs help.`,
        `They wrote: ${esc(note).replace(/\n/g, "<br>")}`,
        "This follow-up is free for the student. Send a new reply from your dashboard.",
      ],
      { label: "Open dashboard", path: "/dashboard" }
    )
  );
}

// A short notice to the Buncho team.
export function emailAdmin({ subject, lines, path = "/admin" }) {
  return send(ADMIN_NOTIFY, subject, wrap(subject, lines.map((l) => esc(l)), { label: "Open admin", path }));
}

export function emailRequestRejected({ to, title, note, refunded = false }) {
  return send(
    to,
    `Your request wasn't sent: ${title}`,
    wrap(
      "Buncho didn't send your request",
      [
        `Your request for <b>${esc(title)}</b> wasn't sent to the expert.`,
        `Reason: ${esc(note)}`,
        ...(refunded ? ["Your payment is being refunded in full."] : []),
        "You can send it again without phone numbers, emails, links or social handles.",
      ],
      { label: "Find experts", path: "/experts" }
    )
  );
}

export function emailReportResolved({ to, note }) {
  return send(
    to,
    "We looked into your report",
    wrap(
      "Thanks for your report",
      [
        "The Buncho team has reviewed it.",
        ...(note ? [`Our note: ${esc(note)}`] : []),
        "If something is still wrong, please send another report from your dashboard.",
      ],
      { label: "Open dashboard", path: "/dashboard" }
    )
  );
}

// ---------- Projects ----------
export function emailProjectApproved({ to, title, path }) {
  return send(to, `Your project is live: ${title}`, wrap("Your project is live", [`<b>${esc(title)}</b> was approved. Experts can now send you proposals.`, "Nothing is charged until you agree a price with an expert."], { label: "Open project", path }));
}

export function emailProjectRejected({ to, title, note }) {
  return send(to, `Your project wasn't published: ${title}`, wrap("Buncho didn't publish your project", [`<b>${esc(title)}</b> wasn't published.`, `Reason: ${esc(note)}`, "You can post it again without phone numbers, emails, links or social handles."], { label: "Post a project", path: "/projects/new" }));
}

// kind: MESSAGE | OFFER | DELIVERY. Sent as soon as the message is posted.
export function emailProjectMessage({ to, fromName, title, kind, priceInr, path }) {
  const what = kind === "OFFER" ? `sent an offer of <b>${money(priceInr)}</b>` : kind === "DELIVERY" ? "delivered their work" : "sent you a message";
  return send(to, `New activity on ${title}`, wrap("You have a new message", [`<b>${esc(fromName || "Someone")}</b> ${what} on <b>${esc(title)}</b>.`, "You can reply from the project page."], { label: "Open conversation", path }));
}

export function emailMessageRejected({ to, title, note, path }) {
  return send(to, `Your message wasn't sent: ${title}`, wrap("Buncho didn't send your message", [`Your message on <b>${esc(title)}</b> wasn't sent.`, `Reason: ${esc(note)}`, "Edit it and send it again."], { label: "Open conversation", path }));
}

export function emailProjectAgreed({ to, title, priceInr, toStudent, path }) {
  return send(to, `Price agreed: ${title}`, wrap("You agreed on a price", [`<b>${esc(title)}</b> is agreed at <b>${money(priceInr)}</b>.`, toStudent ? "Pay now to start the work. Nothing is charged before this." : "The student will pay next. You'll be told when you can start."], { label: toStudent ? "Pay now" : "Open conversation", path }));
}

export function emailProjectPaid({ to, title, path }) {
  return send(to, `Payment received: ${title}`, wrap("Payment received", [`The student paid for <b>${esc(title)}</b>. You can start work now.`], { label: "Open project", path }));
}

export function emailProjectCancelled({ to, byName, title, refunded = false, path }) {
  return send(to, `Cancelled: ${title}`, wrap("A project agreement was cancelled", [`<b>${esc(byName || "The other person")}</b> cancelled <b>${esc(title)}</b>.`, ...(refunded ? ["The payment is being refunded in full."] : [])], { label: "Open projects", path }));
}

export function emailProjectReopened({ to, title, note, path }) {
  return send(to, `Project reopened: ${title}`, wrap("Buncho reopened your project", [`<b>${esc(title)}</b> was reopened by the Buncho team.`, ...(note ? [`Reason: ${esc(note)}`] : []), "You can continue the conversation from the project page."], { label: "Open conversation", path }));
}