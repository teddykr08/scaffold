import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAILTRAP_API_URL = "https://send.api.mailtrap.io/api/send";
const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username } = body;
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing email or password" }, { status: 400 });
    }

    // Register user with Supabase
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (signUpError) {
      return NextResponse.json({ success: false, error: signUpError.message }, { status: 400 });
    }

    // Send confirmation email via Mailtrap
    try {
      const mailRes = await fetch(MAILTRAP_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MAILTRAP_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: { email: "no-reply@yourdomain.com" },
          to: [{ email }],
          subject: "Confirm your account",
          text: `Welcome! Please confirm your account by clicking the link in the Supabase email or logging in.`
        })
      });
      const mailResult = await mailRes.json();
      if (!mailRes.ok) {
        return NextResponse.json({ success: false, error: mailResult.error || "Mailtrap error" }, { status: 500 });
      }
    } catch (mailError) {
      return NextResponse.json({ success: false, error: `Mailtrap send error: ${mailError}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
