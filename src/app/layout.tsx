import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { AppDataProvider } from "@/components/providers/app-data-provider";
import { buildDemoSnapshot, listDemoPersonas } from "@/lib/demo/seed";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mental Wellness Intelligence Platform",
  description:
    "AI-powered mental wellness intelligence for students preparing for high-stakes examinations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSnapshot = buildDemoSnapshot();
  const demoPersonas = listDemoPersonas();

  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppDataProvider
          demoPersonas={demoPersonas}
          initialSnapshot={initialSnapshot}
        >
          <AppShell>{children}</AppShell>
        </AppDataProvider>
      </body>
    </html>
  );
}
