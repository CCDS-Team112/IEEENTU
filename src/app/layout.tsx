import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/features/auth/application/getSession";
import { Navbar } from "@/shared/ui/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Access Starter",
  description: "Accessibility-first Next.js skeleton",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[color:var(--bg)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[color:var(--fg)] focus:shadow focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[color:var(--focus)]"
        >
          Skip to content
        </a>

        <Navbar session={session} />

        <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>

        <footer className="mx-auto max-w-5xl px-4 pb-10 text-sm text-[color:var(--fg)]/80">
          Built for fast demos. Optimized for accessibility.
        </footer>
      </body>
    </html>
  );
}
