import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const tenants = await db.tenant.findMany({
      include: {
        agents: true,
        calls: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        appointments: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = tenants.map((t) => ({
      id: t.id,
      name: t.name,
      twilioPhone: t.twilioPhone,
      forwardPhone: t.forwardPhone,
      agentsCount: t.agents.length,
      agents: t.agents.map((a) => ({ id: a.id, name: a.name })),
      totalCalls: t.calls.length,
      totalAppointments: t.appointments.length,
      totalPayments: t.payments.length,
      createdAt: t.createdAt,
    }));

    return NextResponse.json({
      success: true,
      businesses: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}
