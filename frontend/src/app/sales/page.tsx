"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import Dashboard from "@/sales_engine/dashboard/Dashboard.jsx";
import { RefreshCw } from "lucide-react";

export default function SalesDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeToken = authApi.getToken();
    if (!activeToken) {
      router.push("/login");
      return;
    }
    setToken(activeToken);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    authApi.clearSession();
    router.push("/login");
  };

  if (loading || !token) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center text-slate-200">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Loading Autonomous Sales Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-200">
      <Dashboard token={token} onLogout={handleLogout} />
    </div>
  );
}
