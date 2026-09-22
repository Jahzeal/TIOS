import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

const ACCOUNTS_FILE = path.join(process.cwd(), "src", "lib", "accounts.json");

function getStoredAccounts(): Record<string, { username?: string; accountType: "SALES" | "VOICE" | "BOTH"; password?: string }> {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read accounts.json:", err);
  }
  return {
    "olawoagbotomori@gmail.com": {
      username: "Olawo Agbotomori",
      accountType: "SALES",
    },
  };
}

function saveStoredAccount(email: string, details: { username?: string; accountType: "SALES" | "VOICE" | "BOTH"; password?: string }) {
  try {
    const accounts = getStoredAccounts();
    accounts[email.toLowerCase()] = {
      ...accounts[email.toLowerCase()],
      ...details,
    };
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save to accounts.json:", err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: routePath } = await params;
    const subpath = routePath ? routePath.join("/") : "";
    const body = await request.json().catch(() => ({}));

    // 1. POST /api/auth/login
    if (subpath === "login" || subpath.endsWith("/login")) {
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";

      if (!email) {
        return NextResponse.json(
          { error: "Email address is required" },
          { status: 400 }
        );
      }

      // Check stored accounts first
      const stored = getStoredAccounts();
      let accountType: "SALES" | "VOICE" | "BOTH" = "VOICE";

      if (stored[email]?.accountType) {
        accountType = stored[email].accountType;
      } else if (email.includes("sales") || email.includes("lead") || email.includes("aios") || email.includes("olawoagbotomori")) {
        accountType = "SALES";
      } else {
        try {
          const tenant = await db.tenant.findFirst({
            where: { name: { contains: email.split("@")[0], mode: "insensitive" } },
          });
          if (tenant) {
            accountType = "VOICE";
          }
        } catch {}
      }

      const token = `sess_${Buffer.from(`${email}:${Date.now()}`).toString("base64")}`;
      const userId = `usr_${Math.random().toString(36).substring(2, 9)}`;

      return NextResponse.json({
        success: true,
        token,
        email,
        accountType,
        userId,
        message: "Logged in successfully.",
      });
    }

    // 2. POST /api/auth/register
    if (subpath === "register" || subpath.endsWith("/register")) {
      const email = (body.email || "").trim().toLowerCase();
      const username = body.username || email.split("@")[0] || "User";
      const accountType: "SALES" | "VOICE" | "BOTH" =
        body.accountType === "SALES" ? "SALES" : body.accountType === "BOTH" ? "BOTH" : "VOICE";

      if (!email) {
        return NextResponse.json(
          { error: "Email address is required" },
          { status: 400 }
        );
      }

      saveStoredAccount(email, {
        username,
        accountType,
        password: body.password,
      });

      const token = `sess_${Buffer.from(`${email}:${Date.now()}`).toString("base64")}`;
      const userId = `usr_${Math.random().toString(36).substring(2, 9)}`;

      return NextResponse.json({
        success: true,
        token,
        email,
        accountType,
        userId,
        message: "Registered successfully.",
      });
    }

    // 3. POST /api/auth/send-code
    if (subpath === "send-code" || subpath.endsWith("/send-code")) {
      const email = body.email || "user@example.com";
      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${email}`,
        codeSent: true,
      });
    }

    // 4. POST /api/auth/google/login || /api/auth/google
    if (subpath.includes("google")) {
      const credential = body.credential;
      let email = "google_user@gmail.com";
      
      if (credential) {
        try {
          const parts = credential.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
            if (payload.email) email = payload.email.toLowerCase();
          }
        } catch {}
      }

      const stored = getStoredAccounts();
      const accountType: "SALES" | "VOICE" | "BOTH" =
        stored[email]?.accountType || (email.includes("sales") || email.includes("olawoagbotomori") ? "SALES" : "VOICE");
      const token = `google_sess_${Buffer.from(`${email}:${Date.now()}`).toString("base64")}`;

      return NextResponse.json({
        success: true,
        token,
        email,
        accountType,
        userId: `usr_g_${Math.random().toString(36).substring(2, 9)}`,
      });
    }

    // 5. POST /api/auth/forgot-password
    if (subpath === "forgot-password" || subpath.endsWith("/forgot-password")) {
      return NextResponse.json({
        success: true,
        message: "Password reset code dispatched successfully.",
      });
    }

    // 6. POST /api/auth/reset-password
    if (subpath === "reset-password" || subpath.endsWith("/reset-password")) {
      const email = (body.email || "").trim().toLowerCase();
      const token = `sess_${Buffer.from(`${email}:${Date.now()}`).toString("base64")}`;

      return NextResponse.json({
        success: true,
        token,
        email,
        accountType: "VOICE",
        message: "Password reset successfully.",
      });
    }

    return NextResponse.json(
      { error: `Auth endpoint ${subpath} not found` },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: routePath } = await params;
    const subpath = routePath ? routePath.join("/") : "";

    if (subpath.includes("client-id")) {
      return NextResponse.json({
        clientId:
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
          process.env.GOOGLE_CLIENT_ID ||
          "380893447009-2qdlor8t4lmhmrv4nn56mespdu637is4.apps.googleusercontent.com",
      });
    }

    return NextResponse.json({
      status: "ok",
      service: "TIOS Auth Service",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
