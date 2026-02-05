import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getSession } from "@/features/auth/application/getSession";
import { Navbar } from "@/shared/ui/Navbar";

const clinicSans = Plus_Jakarta_Sans({
  variable: "--font-clinic-sans",
  subsets: ["latin"],
});

const clinicMono = JetBrains_Mono({
  variable: "--font-clinic-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Careline Portal",
  description: "Modern, accessibility-first health dashboard",
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
        className={`${clinicSans.variable} ${clinicMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ring"
        >
          Skip to content
        </a>

        <Navbar session={session} />

        <main id="main-content" className="mx-auto max-w-6xl px-4 py-10">
          {children}
        </main>

        <footer className="mx-auto max-w-6xl px-4 pb-10 text-sm text-muted-foreground">
          Built for fast demos. Optimized for accessibility.
        </footer>
      </body>
    </html>
  );
}
