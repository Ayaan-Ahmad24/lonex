import Link from "next/link";

import "../home.css";

const LINKS = [
  { href: "/", label: "Explore the range" },
  { href: "/verify", label: "Verify a model" },
  { href: "/authorized-sellers", label: "Authorized sellers" },
  { href: "/blog", label: "Journal" },
] as const;

export default function NotFound() {
  return (
    <div className="lx-page">
      <section className="lx-section">
        <div className="lx-wrap">
          <p className="lx-crumbs" style={{ paddingTop: 0 }}>
            Error 404
          </p>

          <div className="lx-page-hero__grid">
            <h1 className="lx-page-hero__title">
              This page has moved beyond the map.
            </h1>

            <div className="lx-page-hero__aside">
              <p className="lx-body">
                This page does not exist or has moved. Every model, article and
                seller listing is available from the pages below.
              </p>

              <div className="lx-actions lx-page-hero__actions">
                <Link href="/" className="lx-btn">
                  Back to home
                </Link>
                <Link href="/contact" className="lx-link">
                  Contact LONEX
                </Link>
              </div>
            </div>
          </div>

          <nav aria-label="Helpful links" style={{ marginTop: 56 }}>
            <div className="lx-model-list">
              {LINKS.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="lx-model-row"
                >
                  <div className="lx-model-row__main">
                    <span className="lx-model-row__index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="lx-model-row__name">{link.label}</h2>
                  </div>
                  <span className="lx-model-row__price" aria-hidden="true">
                    Go →
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
}
