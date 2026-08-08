import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "TIOS | 24/7 AI Receptionist & Sales Agent Dashboard",
  description: "AI receptionist that answers calls, qualifies leads, schedules appointments, and runs outbound sales campaigns.",
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
