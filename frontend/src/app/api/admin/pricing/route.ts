import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const plans = await db.platformPlan.findMany({
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
          twoAgentsDiscountPercent: bundleRule?.twoAgentsPercent ?? 0,
          threeAgentsDiscountPercent: bundleRule?.threeAgentsPercent ?? 0,
          annualDiscountPercent: bundleRule?.annualPrepayPercent ?? 0,
          trialDays: bundleRule?.trialDays ?? 0,
        },
        telecom: {
          twilioNumberMonthlyCost: 1.15,
          twilioVoiceCostPerMinute: 0.014,
          twilioSmsCost: 0.0079,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query database pricing" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agents, bundles } = body;

    if (!Array.isArray(agents)) {
      return NextResponse.json({ success: false, error: "Invalid agents pricing payload" }, { status: 400 });
    }

    // Persist each plan directly to PostgreSQL table
    for (const agent of agents) {
      await db.platformPlan.upsert({
        where: { slug: agent.id },
        update: {
          name: agent.name,
          role: agent.role,
          description: agent.description,
          monthlyPrice: Number(agent.monthlyPrice),
          yearlyPrice: Number(agent.yearlyPrice),
          includedMinutes: Number(agent.includedMinutes),
          overagePerMinute: Number(agent.overagePerMinute),
          badge: agent.badge || null,
          features: Array.isArray(agent.features) ? agent.features : [],
          isActive: agent.isActive !== false,
          stripePriceId: agent.stripePriceId || null,
        },
        create: {
          slug: agent.id,
          name: agent.name,
          role: agent.role,
          description: agent.description,
          monthlyPrice: Number(agent.monthlyPrice),
          yearlyPrice: Number(agent.yearlyPrice),
          includedMinutes: Number(agent.includedMinutes),
          overagePerMinute: Number(agent.overagePerMinute),
          badge: agent.badge || null,
          features: Array.isArray(agent.features) ? agent.features : [],
          isActive: agent.isActive !== false,
          stripePriceId: agent.stripePriceId || null,
        },
      });
    }

    // Persist bundle discount rules directly to PostgreSQL table
    if (bundles) {
      const existingRule = await db.bundleDiscountRule.findFirst();
      if (existingRule) {
        await db.bundleDiscountRule.update({
          where: { id: existingRule.id },
          data: {
            twoAgentsPercent: Number(bundles.twoAgentsDiscountPercent || 0),
            threeAgentsPercent: Number(bundles.threeAgentsDiscountPercent || 0),
            annualPrepayPercent: Number(bundles.annualDiscountPercent || 0),
            trialDays: Number(bundles.trialDays || 0),
          },
        });
      } else {
        await db.bundleDiscountRule.create({
          data: {
            twoAgentsPercent: Number(bundles.twoAgentsDiscountPercent || 0),
            threeAgentsPercent: Number(bundles.threeAgentsDiscountPercent || 0),
            annualPrepayPercent: Number(bundles.annualDiscountPercent || 0),
            trialDays: Number(bundles.trialDays || 0),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Platform pricing updated in database successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to persist pricing to database" },
      { status: 500 }
    );
  }
}
