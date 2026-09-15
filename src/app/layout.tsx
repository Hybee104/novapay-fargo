import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "NovaPAY Bank — Demo Banking Platform",
    template: "%s | NovaPAY Bank — Demo",
  },
  description: "NovaPAY Bank — a fictional banking demonstration. No real money is sent or received.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "NovaPAY Bank — Demo Banking Platform",
    description: "NovaPAY Bank — a fictional banking demonstration. No real money is sent or received.",
    type: "website",
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