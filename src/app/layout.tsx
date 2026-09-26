import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "NovaPAY Bank — Fictional Banking Demonstration",
    template: "%s | NovaPAY Bank — Fictional Banking Demonstration",
  },
  description:
    "NovaPAY Bank is a fictional banking demonstration. No real banking services, accounts, or money are provided.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "NovaPAY Bank — Fictional Banking Demonstration",
    description:
      "NovaPAY BANK is a fictional banking demonstration. No real banking services, accounts, or money are provided.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}