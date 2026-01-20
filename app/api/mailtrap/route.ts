export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN;
const MAILTRAP_API_URL = "https://send.api.mailtrap.io/api/send";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      from = { email: "no-reply@yourdomain.com" },
      to = [{ email: "support@yourdomain.com" }],
      subject = "Hello from Vercel + Mailtrap",
      text = "This is a test email sent via Mailtrap API."
    } = body;

    const res = await fetch(MAILTRAP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MAILTRAP_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to, subject, text })
    });

    const result = await res.json();
    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
