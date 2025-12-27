import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";

// Initialize Resend - will be undefined if API key not set
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Initialize Redis - will be undefined if not configured
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

// Email configuration
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

interface EmailEntry {
  email: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  referer?: string;
  language?: string;
  country?: string;
  city?: string;
}

async function saveToRedis(entry: EmailEntry): Promise<void> {
  if (!redis) {
    console.log("Redis storage skipped - not configured");
    return;
  }

  try {
    // Store in a sorted set with timestamp as score for easy retrieval
    await redis.zadd("presskit:emails", {
      score: Date.now(),
      member: JSON.stringify(entry),
    });
  } catch (error) {
    console.error("Failed to save to Redis:", error);
  }
}

async function sendNotificationEmail(entry: EmailEntry): Promise<void> {
  if (!resend || !NOTIFICATION_EMAIL) {
    console.log("Email notification skipped - Resend not configured");
    return;
  }

  try {
    const locationParts = [entry.city, entry.country].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(", ") : "Unknown";

    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      subject: "Press Kit Downloaded",
      html: `
        <h2>New Press Kit Download</h2>
        <table style="border-collapse: collapse; font-family: sans-serif;">
          <tr>
            <td style="padding: 8px 16px 8px 0; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0;">${entry.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px 8px 0; font-weight: bold;">Time:</td>
            <td style="padding: 8px 0;">${new Date(entry.timestamp).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px 8px 0; font-weight: bold;">Location:</td>
            <td style="padding: 8px 0;">${location}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px 8px 0; font-weight: bold;">IP Address:</td>
            <td style="padding: 8px 0;">${entry.ip || "Unknown"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px 8px 0; font-weight: bold;">Referrer:</td>
            <td style="padding: 8px 0;">${entry.referer || "Direct"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px 8px 0; font-weight: bold;">Language:</td>
            <td style="padding: 8px 0;">${entry.language || "Unknown"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 16px 8px 0; font-weight: bold;">User Agent:</td>
            <td style="padding: 8px 0; font-size: 12px; color: #666;">${entry.userAgent || "Unknown"}</td>
          </tr>
        </table>
      `,
    });
  } catch (error) {
    // Log but don't fail the request if email fails
    console.error("Failed to send notification email:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation - using a simple, non-backtracking pattern
    // Limit length to prevent ReDoS attacks
    if (email.length > 254 || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const entry: EmailEntry = {
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || undefined,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
        || request.headers.get("x-real-ip") 
        || undefined,
      referer: request.headers.get("referer") || undefined,
      language: request.headers.get("accept-language")?.split(",")[0] || undefined,
      // Vercel provides geo headers
      country: request.headers.get("x-vercel-ip-country") || undefined,
      city: request.headers.get("x-vercel-ip-city") || undefined,
    };

    // Save to Redis and send notification in parallel
    await Promise.all([
      saveToRedis(entry),
      sendNotificationEmail(entry),
    ]);

    return NextResponse.json({ 
      success: true,
      downloadUrl: "/uploads/PressKit.zip"
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Optional: endpoint to check if API is working
  return NextResponse.json({ status: "ok" });
}
