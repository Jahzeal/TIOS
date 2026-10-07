import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const plans = await db.platformPlan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const bundleRule = await db.bundleDiscountRule.findFirst();

    return NextResponse.json({
      success: true,
      pricing: {
        agents: plans.map((p) => ({
          id: p.slug,
          name: p.name,
          role: p.role,
          monthlyPrice: p.monthlyPrice,
          yearlyPrice: p.yearlyPrice,
          includedMinutes: p.includedMinutes,
          overagePerMinute: p.overagePerMinute,
          badge: p.badge || "",
          description: p.description,
          features: Array.isArray(p.features) ? p.features : [],
          isActive: p.isActive,
          stripePriceId: p.stripePriceId || "",
        })),
        bundles: {
          twoAgentsDiscountPercent: bundleRule?.twoAgentsPercent ?? 10,
          threeAgentsDiscountPercent: bundleRule?.threeAgentsPercent ?? 15,
          annualDiscountPercent: bundleRule?.annualPrepayPercent ?? 20,
          trialDays: bundleRule?.trialDays ?? 14,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch active pricing from database" },
      { status: 500 }
    );
  }
}
