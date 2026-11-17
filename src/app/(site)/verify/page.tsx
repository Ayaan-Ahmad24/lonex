import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { PageMotion } from "@/components/public/page-motion";
import { formatPhone, whatsappHref } from "@/lib/public/contact";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import { VerifyForm } from "./verify-form";
import {
  NOT_FOUND_CHECKS,
  QUESTIONS,
  RESULT_FIELDS,
  STEPS,
  WHY_POINTS,
} from "./content";
import "../../home.css";
import "../../directory.css";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await loadPublicSettings();
  return createPageMetadata({
    settings,
    title: "Verify a model",
    description:
      "Confirm that a LONEX product model code is registered in the LONEX model registry.",
    path: "/verify",
  });
}

export default async function VerifyPage() {
  await connection();
  const settings = await loadPublicSettings();

  const whatsapp = settings.whatsapp
    ? whatsappHref(
        settings.whatsapp,
        "Hello LONEX, I need help checking a model verification code.",
      )
    : null;

  return (
    <div className="lx-page">
      <PageMotion>
        {/* Hero ------------------------------------------------------- */}
        <section className="lxv-hero" data-hero>
          <div aria-hidden="true" className="lxv-hero__field" />
          <div aria-hidden="true" className="lxv-hero__glow" />
          <div aria-hidden="true" className="lxv-hero__rules" />

          <div className="lx-wrap lxv-hero__inner">
            <nav aria-label="Breadcrumb" className="lxv-crumbs">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Verify</span>
            </nav>

            <div className="lxv-hero__grid">
              <div className="lxv-hero__copy">
                <p className="lxv-eyebrow lxv-eyebrow--light" data-hero-item>
                  Model verification
                </p>

                <h1 className="lxv-hero__title">
                  <span className="lxv-hero__line" data-hero-line>
                    Every Model
                  </span>{" "}
                  <span className="lxv-hero__line" data-hero-line>
                    Has an <em>Identity.</em>
                  </span>
                </h1>

                <p className="lxv-hero__intro" data-hero-item>
                  Registered LONEX models carry an identity in the model
                  registry. Enter the verification code supplied with the model
                  to confirm that the code is registered, and to see the record
                  the registry holds.
                </p>

                <div className="lxv-hero__actions" data-hero-item>
                  <Link href="#verify" className="lxv-btn lxv-btn--red">
                    Verify a model
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link href="#how" className="lxv-btn lxv-btn--ghost-light">
                    How it works
                  </Link>
                </div>

                <dl className="lxv-hero__facts" data-hero-item>
                  <div>
                    <dt>Check</dt>
                    <dd>Model registration</dd>
                  </div>
                  <div>
                    <dt>Scope</dt>
                    <dd>Model level only</dd>
                  </div>
                  <div>
                    <dt>Access</dt>
                    <dd>Rate limited</dd>
                  </div>
                </dl>
              </div>

              <div className="lxv-hero__panel" data-hero-item>
                <div aria-hidden="true" className="lxv-dial">
                  <svg viewBox="0 0 240 240" fill="none">
                    <circle
                      cx="120"
                      cy="120"
                      r="118"
                      stroke="currentColor"
                      strokeWidth="0.6"
                      strokeDasharray="1 7"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="0.6"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="52"
                      stroke="currentColor"
                      strokeWidth="0.6"
                      strokeDasharray="18 10"
                    />
                    <path
                      d="M120 2v38M120 200v38M2 120h38M200 120h38"
                      stroke="currentColor"
                      strokeWidth="0.8"
                    />
                  </svg>
                  <span className="lxv-dial__label">Registry field</span>
                </div>

                <VerifyForm />
              </div>
            </div>
          </div>
        </section>

        {/* Why -------------------------------------------------------- */}
        <section className="lxv-why lxv-section">
          <div className="lx-wrap lxv-why__grid" data-reveal-group>
            <div className="lxv-why__head" data-reveal>
              <p className="lxv-eyebrow" data-reveal>
                Why it matters
              </p>
              <h2 className="lxv-h2" data-reveal>
                A code is only
                <br />
                useful if it is read.
              </h2>
            </div>

            <div className="lxv-why__points" data-reveal>
              {WHY_POINTS.map((point, index) => (
                <article key={point.title} className="lxv-why__point" data-reveal>
                  <span className="lxv-why__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="lxv-why__title">{point.title}</h3>
                    <p className="lxv-why__copy">{point.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How -------------------------------------------------------- */}
        <section id="how" className="lxv-how lxv-section lxv-section--tight">
          <div className="lx-wrap">
            <div className="lxv-section-head" data-reveal-group>
              <div data-reveal>
                <p className="lxv-eyebrow" data-reveal>
                  How to verify
                </p>
                <h2 className="lxv-h2" data-reveal>
                  Three steps to a
                  <br />
                  confirmed model.
                </h2>
              </div>
              <p className="lxv-lede" data-reveal>
                The check is deliberately short. Everything it needs is on the
                product label, in the documentation, or in the field above.
              </p>
            </div>

            <ol className="lxv-steps" data-reveal-group>
              {STEPS.map((step) => (
                <li key={step.index} className="lxv-step" data-reveal>
                  <span className="lxv-step__index">{step.index}</span>
                  <h3 className="lxv-step__title">{step.title}</h3>
                  <p className="lxv-step__copy">{step.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Result anatomy -------------------------------------------- */}
        <section className="lxv-anatomy lxv-section">
          <div className="lx-wrap lxv-anatomy__grid" data-reveal-group>
            <div className="lxv-anatomy__copy" data-reveal>
              <p className="lxv-eyebrow lxv-eyebrow--light" data-reveal>
                Reading the result
              </p>
              <h2 className="lxv-h2 lxv-h2--light" data-reveal>
                What a match
                <br />
                actually tells you.
              </h2>
              <p className="lxv-anatomy__body" data-reveal>
                A successful check is a registry response, not a certificate.
                It returns the model record below. Everything else — the unit,
                its history, the seller — sits outside the registry and has to
                be checked separately.
              </p>
              <p className="lxv-anatomy__note" data-reveal>
                No serial number, condition grade or ownership record is
                returned, because the registry does not hold them.
              </p>
            </div>

            <div className="lxv-fields" data-reveal>
              <div className="lxv-fields__top">
                <span>Registry response</span>
                <span>Fields</span>
              </div>
              <dl>
                {RESULT_FIELDS.map((field) => (
                  <div key={field.label} className="lxv-fields__row">
                    <dt>{field.label}</dt>
                    <dd>{field.copy}</dd>
                  </div>
                ))}
              </dl>
              <p className="lxv-fields__foot">
                A registry match confirms that the model is registered with
                LONEX. It does not authenticate a physical unit.
              </p>
            </div>
          </div>
        </section>

        {/* Not found -------------------------------------------------- */}
        <section className="lxv-missing lxv-section">
          <div className="lx-wrap lxv-missing__grid" data-reveal-group>
            <div className="lxv-missing__copy" data-reveal>
              <p className="lxv-eyebrow" data-reveal>
                No match
              </p>
              <h2 className="lxv-h2" data-reveal>
                If a code cannot
                <br />
                be found.
              </h2>
              <p className="lxv-lede" data-reveal>
                The registry returns one message for unknown, inactive and
                malformed codes. That is intentional: it keeps the check from
                becoming a way to test codes in bulk.
              </p>

              <ul className="lxv-missing__checks" data-reveal>
                {NOT_FOUND_CHECKS.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true" className="lxv-missing__mark" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="lxv-help" aria-label="Contact LONEX" data-reveal>
              <p className="lxv-help__kicker">Still stuck?</p>
              <h3 className="lxv-help__title">
                Send the model name and what you can read.
              </h3>
              <p className="lxv-help__copy">
                The team can check the model with you and explain what the
                registry does and does not cover for that product.
              </p>

              <div className="lxv-help__actions">
                <Link href="/contact" className="lxv-btn lxv-btn--dark">
                  Contact LONEX
                </Link>
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lxv-btn lxv-btn--outline"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>

              {settings.contactPhone ? (
                <a
                  href={`tel:${settings.contactPhone.replace(/[^\d+]/g, "")}`}
                  className="lxv-help__phone"
                >
                  <span>Call</span>
                  {formatPhone(settings.contactPhone)}
                </a>
              ) : null}
            </aside>
          </div>
        </section>

        {/* Questions -------------------------------------------------- */}
        <section className="lxv-faq lxv-section lxv-section--tight">
          <div className="lx-wrap lxv-faq__grid" data-reveal-group>
            <div className="lxv-faq__head" data-reveal>
              <p className="lxv-eyebrow" data-reveal>
                Questions
              </p>
              <h2 className="lxv-h2" data-reveal>
                What the check
                <br />
                can and cannot do.
              </h2>
            </div>

            <div className="lxv-faq__list">
              {QUESTIONS.map((item) => (
                <details key={item.q} className="lxv-faq__item" data-reveal>
                  <summary>
                    <span>{item.q}</span>
                    <span aria-hidden="true" className="lxv-faq__mark" />
                  </summary>
                  <p className="lxv-faq__answer">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Close ------------------------------------------------------ */}
        <section className="lxv-close">
          <div className="lx-wrap lxv-close__grid" data-reveal-group>
            <div data-reveal>
              <p className="lxv-eyebrow lxv-eyebrow--light">Next step</p>
              <h2 className="lxv-close__title">
                Start with the model.
                <br />
                Then check the unit.
              </h2>
            </div>

            <div className="lxv-close__aside" data-reveal>
              <p>
                If the code matches, use the product page to review what LONEX
                publishes, then confirm the individual unit and the seller
                separately.
              </p>
              <div className="lxv-close__actions">
                <Link
                  href="/authorized-sellers"
                  className="lxv-btn lxv-btn--light"
                >
                  Authorized sellers
                </Link>
                <Link href="/contact" className="lxv-btn lxv-btn--ghost-light">
                  Contact LONEX
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PageMotion>
    </div>
  );
}

export const instant = false;
