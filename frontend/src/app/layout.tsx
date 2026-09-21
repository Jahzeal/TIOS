import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Fluture | 24/7 AI Workforce & Voice Receptionist Platform",
  description: "Enterprise AI workforce for high-converting phone calls, appointment booking, lead qualification, and customer support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased dark">
      <body suppressHydrationWarning className="h-full bg-slate-950 text-slate-100">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
