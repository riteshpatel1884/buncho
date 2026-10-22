import Link from "next/link";
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";

// Shared metadata so canonical, Open Graph and Twitter stay consistent.
export function legalMetadata({ title, description, path }) {
  return {
    title, // layout template adds "| Buncho"
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [
        { url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default function LegalPage({
  title,
  description,
  path,
  updated, // ISO date, e.g. "2026-10-22"
  children,
}) {
  const url = `${SITE_URL}${path}`;
  const displayDate = new Date(updated).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${title} | ${SITE_NAME}`,
        description,
        dateModified: updated,
        inLanguage: "en",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      },
    ],
  };

  return (
    <article className="wrap py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {title}
            </li>
          </ol>
        </nav>

        <header>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Last updated: <time dateTime={updated}>{displayDate}</time>
          </p>
        </header>

        <div className="panel mt-8 p-6 sm:p-8">
          <div className="prose-buncho">{children}</div>
        </div>
      </div>
    </article>
  );
}