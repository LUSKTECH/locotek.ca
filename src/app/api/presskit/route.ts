import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend - will be undefined if API key not set
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email to receive notifications
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "";

interface EmailEntry {
  email: string;
  timestamp: string;
  userAgent?: string;
}

async function sendNotificationEmail(entry: EmailEntry): Promise<void> {
  if (!resend || !NOTIFICATION_EMAIL) {
    console.log("Email notification skipped - Resend not configured");
    return;
  }

  try {
    await resend.emails.send({
      from: "LOCOTEK <noreply@locotek.ca>",
      to: NOTIFICATION_EMAIL,
      subject: "Press Kit Downloaded",
      html: `
        <h2>New Press Kit Download</h2>
        <p><strong>Email:</strong> ${entry.email}</p>
        <p><strong>Time:</strong> ${new Date(entry.timestamp).toLocaleString()}</p>
        <p><strong>User Agent:</strong> ${entry.userAgent || "Unknown"}</p>
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
    };

    // Send notification email (non-blocking, won't fail request)
    await sendNotificationEmail(entry);

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
