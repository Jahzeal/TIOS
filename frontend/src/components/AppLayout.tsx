"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("agent-1");
  const [searchQuery, setSearchQuery] = useState("");

  // Bypass internal dashboard layout for public marketing pages
  if (pathname === "/" || pathname === "/features" || pathname === "/receptionists" || pathname === "/how-it-works") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          selectedAgentId={selectedAgentId}
          setSelectedAgentId={setSelectedAgentId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
