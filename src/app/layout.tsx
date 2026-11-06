import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ToastProvider } from "@/admin/core/ui/toast";
import "./base.css";
import "./globals.css";
import "./tokens.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LONEX | Power for What's Next.",
    template: "%s | LONEX",
  },
  description:
    "LONEX connects solar energy, intelligent storage and electric mobility through carefully selected solutions.",
  applicationName: "LONEX",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "400x400" }],
  },
  openGraph: {
    type: "website",
    siteName: "LONEX",
    title: "LONEX | Power for What's Next.",
    description:
      "LONEX connects solar energy, intelligent storage and electric mobility through carefully selected solutions.",
    url: siteUrl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /*
     * Browser extensions (translation, recorder, colour picker, password
     * managers) add attributes such as `cz-shortcut-listen` or
     * `data-scribe-recorder-ready` to <html>/<body> before React hydrates.
     * `suppressHydrationWarning` limits the warning to these two elements;
     * mismatches inside the app tree are still reported.
     */
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-white"
        suppressHydrationWarning
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
