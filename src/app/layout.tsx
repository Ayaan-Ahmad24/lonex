import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ToastProvider } from "@/admin/core/ui/toast";
import "./globals.css";

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
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
