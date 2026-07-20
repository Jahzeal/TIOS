"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  PhoneCall,
  Users,
  Sliders,
  BookOpen,
  Cpu,
  CreditCard,
  MessageSquare,
  Building2,
  Sparkles,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
  { name: "Call History", href: "/calls", icon: PhoneCall },
  { name: "Leads Pipeline", href: "/leads", icon: Users },
  { name: "Agent Settings", href: "/settings", icon: Sliders },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { name: "Job Queue", href: "/job-queue", icon: Cpu },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "SMS & Reminders", href: "/messaging", icon: MessageSquare },
  { name: "Tenants", href: "/tenants", icon: Building2 },
];

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-64 p-4">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-lg">TIOS OS</h1>
            <p className="text-xs text-indigo-400 font-medium">AI Receptionist Gateway</p>
          </div>
        </div>
        {setMobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 mt-auto">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-200">Twilio & AI Online</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">v2.4.0 • NestJS Engine</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-shrink-0">{sidebarContent}</aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
