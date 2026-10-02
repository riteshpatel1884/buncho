import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const alt = "A product on Buncho";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

// Fetches the product logo and inlines it. Only public https hosts, small PNG/JPEG/GIF files.
async function logoDataUri(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    if (/^(localhost|127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[)/i.test(u.hostname) || !u.hostname.includes(".")) return null;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(url, { signal: ctrl.signal, redirect: "error" });
    clearTimeout(t);
    const type = (res.headers.get("content-type") || "").split(";")[0];
    if (!res.ok || !/^image\/(png|jpe?g|gif)$/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 1_000_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function Stat({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>{value}</div>
      <div style={{ display: "flex", fontSize: 24, color: "#8a9a90" }}>{label}</div>
    </div>
  );
}

export default async function Image({ params }) {
  const { slug } = await params;
  const host = (() => {
    try { return new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").host; } catch { return "buncho"; }
  })();

  const product = await prisma.product.findFirst({
    where: { slug, status: "APPROVED" },
    include: { category: true, _count: { select: { votes: true } } },
  });

  const shell = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 64,
    background: "#050505",
    backgroundImage: "radial-gradient(circle at 88% 0%, rgba(52,214,123,0.38), rgba(5,5,5,0) 55%)",
    color: "#ecf3ee",
  };

  const brand = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: "#34d67b", color: "#04140a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, marginRight: 14 }}>b</div>
      <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
        buncho<span style={{ color: "#34d67b" }}>.</span>
      </div>
    </div>
  );

  if (!product) {
    return new ImageResponse(
      (
        <div style={shell}>
          {brand}
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>Discover what India is building.</div>
          <div style={{ display: "flex", fontSize: 28, color: "#8a9a90" }}>{host}</div>
        </div>
      ),
      size
    );
  }

  const [views, pick, logo] = await Promise.all([
    prisma.productEvent.count({ where: { productId: product.id, type: "VIEW" } }),
    prisma.dailyPick.findFirst({ where: { productId: product.id }, select: { id: true } }),
    logoDataUri(product.logoUrl),
  ]);
  const featured = !!pick;
  const name = clip(product.name, 40);

  return new ImageResponse(
    (
      <div style={shell}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {brand}
          <div style={{ display: "flex", alignItems: "center", padding: "10px 22px", borderRadius: 999, background: "#34d67b", color: "#04140a", fontSize: 26, fontWeight: 700 }}>
            {featured && (
              <svg width="26" height="26" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17l-5.9 3.2 1.2-6.6L2.5 9l6.6-.9z" fill="#04140a" />
              </svg>
            )}
            {featured ? "Featured on Buncho" : "Launched on Buncho"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {logo ? (
            <img src={logo} width={168} height={168} style={{ borderRadius: 32, marginRight: 40, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 168, height: 168, borderRadius: 32, marginRight: 40, background: "#10291b", color: "#6ee7a8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 88, fontWeight: 700 }}>
              {product.name[0].toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", fontSize: name.length > 24 ? 54 : 74, fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
              {product.verified && (
                <svg width="48" height="48" viewBox="0 0 24 24" style={{ marginLeft: 16 }}>
                  <circle cx="12" cy="12" r="11" fill="#2f9bff" />
                  <path d="M7.4 12.4l3.2 3.2 6-6.4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 34, color: "#a9b8ae", lineHeight: 1.25 }}>{clip(product.tagline, 90)}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", marginRight: 64 }}><Stat value={fmt(product._count.votes)} label="upvotes" /></div>
            <Stat value={fmt(views)} label="views" />
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#8a9a90" }}>{host}</div>
        </div>
      </div>
    ),
    size
  );
}