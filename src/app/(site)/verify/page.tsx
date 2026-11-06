import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";

import { Container } from "@/components/public/container";
import { Eyebrow } from "@/components/public/eyebrow";
import { SectionHeading } from "@/components/public/section-heading";
import { createPageMetadata } from "@/lib/public/seo";
import { loadPublicSettings } from "@/lib/public/settings";
import { VerifyForm } from "./verify-form";

const STEPS = [
  {
    title: "Find the code",
    copy: "The verification code is printed on the product label or supplied with the documentation.",
  },
  {
    title: "Enter the code",
    copy: "Submit the code exactly as printed. The check is rate limited to prevent enumeration.",
  },
  {
    title: "Read the result",
    copy: "A match confirms the model is registered with LONEX. It does not authenticate a physical unit.",
  },
] as const;

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

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/10 bg-white">
        <div
          aria-hidden="true"
          className="lux-grid-bg pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block"
        />
        <Container className="relative grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
          <div className="space-y-7">
            <nav
              aria-label="Breadcrumb"
              className="type-eyebrow flex flex-wrap items-center gap-2 text-black/55"
            >
              <Link href="/" className="transition-colors hover:text-[#CF0A0A]">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-black/60">Verify</span>
            </nav>

            <div className="intro intro-1">
              <Eyebrow>Model verification</Eyebrow>
            </div>

            <h1 className="intro intro-2 type-hero text-black">
              Check a LONEX
              <br />
              model code<span className="text-[#CF0A0A]">.</span>
            </h1>

            <p className="intro intro-3 type-lead max-w-xl text-black/60">
              Enter the verification code supplied with a LONEX product model
              and confirm that it is registered in the LONEX model registry.
            </p>
          </div>

          <div className="reveal border border-black/10 bg-[#F5EDED] p-6 sm:p-8">
            <p className="type-eyebrow text-black/55">How it works</p>
            <ol className="mt-6 space-y-6">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="type-eyebrow mt-0.5 shrink-0 text-[#CF0A0A]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-black/55">
                      {step.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="space-y-12">
          <SectionHeading
            index="01"
            eyebrow="Registry check"
            title="Enter a code."
            description="Codes are matched against the LONEX model registry only. Unknown, inactive and malformed codes return the same message."
          />

          <div className="grid gap-10 lg:grid-cols-[0.62fr_0.38fr] lg:gap-16">
            <div className="reveal border border-black/10 bg-white p-6 sm:p-8">
              <VerifyForm />
            </div>

            <div className="space-y-6">
              <div className="reveal border border-black/10 p-6">
                <p className="type-eyebrow text-[#CF0A0A]">What it confirms</p>
                <p className="mt-3 text-sm leading-7 text-black/60">
                  That a model code exists in the LONEX registry and is linked to
                  a published product model.
                </p>
              </div>
              <div className="reveal border border-black/10 p-6">
                <p className="type-eyebrow text-black/55">What it does not</p>
                <p className="mt-3 text-sm leading-7 text-black/60">
                  It does not authenticate an individual physical unit, its
                  condition, its history or its seller.
                </p>
              </div>
              <div className="reveal border border-black/10 bg-black p-6 text-white">
                <p className="type-eyebrow text-white/55">Need help?</p>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  Contact LONEX with the model name and the code you were
                  supplied.
                </p>
                <Link
                  href="/contact"
                  className="type-eyebrow mt-5 inline-flex items-center gap-2 text-white transition-colors hover:text-[#CF0A0A]"
                >
                  Contact LONEX
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-black/10 bg-[#F5EDED] py-16 sm:py-20">
        <Container className="max-w-3xl space-y-6">
          <Eyebrow>Questions</Eyebrow>
          <div className="divide-y divide-black/10 border-y border-black/10">
            {[
              {
                q: "Where do I find the verification code?",
                a: "The code is printed on the product label or included with the documentation supplied by LONEX.",
              },
              {
                q: "Why do different invalid codes return the same message?",
                a: "Uniform responses prevent the registry from being used to enumerate valid model codes.",
              },
              {
                q: "Is a match a guarantee of authenticity?",
                a: "No. A match confirms model registration only. It does not verify an individual physical unit.",
              },
            ].map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-semibold text-black">
                    {item.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-lg leading-none text-[#CF0A0A] transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-4 text-sm leading-7 text-black/55">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

export const instant = false;
