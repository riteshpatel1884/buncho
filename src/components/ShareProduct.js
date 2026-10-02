"use client";
import { useEffect, useState } from "react";

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

// "Share your launch": a ready-made social card plus one-tap sharing.
export default function ShareProduct({ name, tagline, slug, upvotes, views, featured, base, title = "Share this launch" }) {
  const [origin, setOrigin] = useState(base);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare(typeof navigator.share === "function");
  }, []);

  const link = (src) => `${origin}/products/${slug}?ref=${src}`;
  const image = `/products/${slug}/opengraph-image`;
  const text = [
    `🚀 I just launched ${name} on Buncho`,
    tagline.length > 90 ? `${tagline.slice(0, 89)}…` : tagline,
    featured ? "🔥 Featured on Buncho" : null,
    `${fmt(upvotes)} upvotes · ${fmt(views)} views`,
  ].filter(Boolean).join("\n");
  const enc = encodeURIComponent;

  const targets = [
    ["X", `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(link("x"))}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${enc(link("linkedin"))}`],
    ["WhatsApp", `https://wa.me/?text=${enc(`${text}\n${link("whatsapp")}`)}`],
    ["Telegram", `https://t.me/share/url?url=${enc(link("telegram"))}&text=${enc(text)}`],
  ];

  async function copy(kind, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted">
          Post this card on X, LinkedIn, WhatsApp, Telegram or Discord. Everyone you bring can discover other Indian-built products too.
        </p>
      </div>

      <img
        src={image}
        alt={`Social card for ${name}`}
        loading="lazy"
        className="w-full rounded-xl border border-line bg-surface-2"
        style={{ aspectRatio: "1200 / 630" }}
      />

      <pre className="whitespace-pre-wrap rounded-xl bg-surface-2 p-3 font-sans text-sm text-muted">{text}</pre>

      <div className="flex flex-wrap gap-2">
        {targets.map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="btn-outline !px-4 !py-2">
            {label}
          </a>
        ))}
        <button type="button" onClick={() => copy("discord", `${text}\n${link("discord")}`)} className="btn-outline !px-4 !py-2">
          {copied === "discord" ? "Copied for Discord" : "Discord"}
        </button>
        <button type="button" onClick={() => copy("link", link("link"))} className="btn-outline !px-4 !py-2">
          {copied === "link" ? "Link copied" : "Copy link"}
        </button>
        <a href={image} download={`${slug}-buncho.png`} className="btn-outline !px-4 !py-2">Download card</a>
        {canShare && (
          <button
            type="button"
            onClick={() => navigator.share({ title: `${name} on Buncho`, text, url: link("share") }).catch(() => {})}
            className="btn-primary !px-4 !py-2"
          >
            Share…
          </button>
        )}
      </div>
    </div>
  );
}