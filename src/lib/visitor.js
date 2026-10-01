import { headers } from "next/headers";
import crypto from "node:crypto";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python-requests|facebookexternalhit|monitor|uptime/i;

// Anonymous visitor id: a hash of IP + browser + day + secret salt. Nothing personal is stored,
// and the hash changes every day, so visitors cannot be tracked across days.
export async function getVisitor() {
  const h = await headers();
  const ua = h.get("user-agent") || "";
  const ip = (h.get("x-forwarded-for") || h.get("x-real-ip") || "").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.VISITOR_SALT || process.env.CLERK_SECRET_KEY || "buncho";
  const hash = crypto.createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 24);
  return { hash, isBot: !ua || BOT.test(ua) };
}