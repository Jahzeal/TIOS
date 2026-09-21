export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const AIOS_API_BASE_URL = process.env.NEXT_PUBLIC_AIOS_CLIENT_API_URL || "";

// --- Generic API Request Helper ---
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = API_BASE_URL
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  // Route onboarding requests through internal Next.js API handler
  const targetBase = cleanEndpoint.startsWith("/onboarding") || cleanEndpoint.startsWith("/api/onboarding")
    ? ""
    : baseUrl;
  const targetEndpoint = cleanEndpoint.startsWith("/onboarding")
    ? `/api${cleanEndpoint}`
    : cleanEndpoint;
  const url = `${targetBase}${targetEndpoint}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = `API Error [${res.status}]`;
      try {
        const errJson = await res.json();
        errorMessage = errJson.message || errJson.error || errorMessage;
      } catch {
        const text = await res.text().catch(() => "");
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[apiRequest] Request to ${url} failed:`, err.message);
    throw err;
  }
}

// --- AIOS Authentication API Methods ---
export const authApi = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  getAccountType(): "SALES" | "VOICE" | "BOTH" {
    if (typeof window === "undefined") return "VOICE";
    return (localStorage.getItem("auth_account_type") as any) || "VOICE";
  },

  getUserEmail(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_user_email");
  },

  setSession(data: {
    token: string;
    email: string;
    accountType?: "SALES" | "VOICE" | "BOTH";
    userId?: string;
  }) {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user_email", data.email);
    if (data.accountType) {
      localStorage.setItem("auth_account_type", data.accountType);
    }
    if (data.userId) {
      localStorage.setItem("auth_user_id", data.userId);
    }
  },

  clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user_email");
    localStorage.removeItem("auth_account_type");
    localStorage.removeItem("auth_user_id");
  },

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string; email: string; accountType?: string }> {
    return apiRequest<{ token: string; email: string; accountType?: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
      AIOS_API_BASE_URL
    );
  },

  async sendVerificationCode(email: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
      "/api/auth/send-code",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      AIOS_API_BASE_URL
    );
  },

  async register(data: {
    username: string;
    email: string;
    password: string;
    code: string;
    accountType?: "SALES" | "VOICE" | "BOTH";
  }): Promise<{ token: string; email: string; accountType?: string }> {
    return apiRequest<{ token: string; email: string; accountType?: string }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      AIOS_API_BASE_URL
    );
  },

  async getGoogleClientId(): Promise<{ clientId: string | null }> {
    return apiRequest<{ clientId: string | null }>(
      "/api/auth/google/client-id",
      { method: "GET" },
      AIOS_API_BASE_URL
    );
  },

  async googleLogin(
    credential: string,
    accountType?: "SALES" | "VOICE" | "BOTH"
  ): Promise<{ token: string; email: string; accountType?: string }> {
    return apiRequest<{ token: string; email: string; accountType?: string }>(
      "/api/auth/google",
      {
        method: "POST",
        body: JSON.stringify({ credential, accountType }),
      },
      AIOS_API_BASE_URL
    );
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      AIOS_API_BASE_URL
    );
  },

  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ token: string; email: string; message: string }> {
    return apiRequest<{ token: string; email: string; message: string }>(
      "/api/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword }),
      },
      AIOS_API_BASE_URL
    );
  },

  async getMe(): Promise<{ email: string; userId: string; accountType?: string }> {
    return apiRequest<{ email: string; userId: string; accountType?: string }>(
      "/api/auth/me",
      { method: "GET" },
      AIOS_API_BASE_URL
    );
  },
};

