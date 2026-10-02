import ProductLogo from "./ProductLogo";

export const PARTNER_NOTE =
  "Buncho Partners are sponsored placements or affiliate links. They never affect ranking, the Buncho Score or the Daily Pick. If you buy through an affiliate link, Buncho may earn a commission at no extra cost to you.";

export default function PartnerCard({ partner }) {
  const sponsored = partner.kind === "SPONSOR";
  return (
    <li className="card card-hover glow relative flex flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <ProductLogo product={partner} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold leading-tight">{partner.name}</p>
          <p className="text-xs text-muted">{partner.category}</p>
        </div>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
          {sponsored ? "Sponsored" : "Affiliate"}
        </span>
      </div>
      <p className="text-sm text-muted">{partner.tagline}</p>
      {partner.offer && (
        <p className="rounded-xl bg-brand-soft px-3 py-2 text-sm font-medium text-brand">{partner.offer}</p>
      )}
      <a
        href={`/p/${partner.slug}`}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="btn-primary mt-auto"
      >
        {partner.offer ? "Get the offer" : "Visit"}
      </a>
    </li>
  );
}