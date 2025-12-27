import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Store emails in a JSON file (works on both Vercel and Netlify)
// For production, consider using a database like Vercel KV, Supabase, or similar
const DATA_FILE = path.join(process.cwd(), "data", "presskit-emails.json");

interface EmailEntry {
  email: string;
  timestamp: string;
  userAgent?: string;
}

async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function getEmails(): Promise<EmailEntry[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveEmail(entry: EmailEntry): Promise<void> {
  await ensureDataDir();
  const emails = await getEmails();
  emails.push(entry);
  await fs.writeFile(DATA_FILE, JSON.stringify(emails, null, 2));
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Save the email
    await saveEmail({
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ 
      success: true,
      downloadUrl: "/uploads/PressKit.zip"
    });
  } catch (error) {
    console.error("Error saving email:", error);
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
