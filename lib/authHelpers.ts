import { NextRequest } from "next/server";
import { getSupabaseServer } from "./supabaseServer";

/**
 * Get the current authenticated user from the request
 * Uses the Authorization header to extract the session
 */
export async function getCurrentUser(req: NextRequest) {
  try {
    const supabaseServer = getSupabaseServer();
    
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return null;
    }

    // For client-side requests, we need to use the session from the client
    // The safest way is to verify the token from the Authorization header
    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      return null;
    }

    // Get the user from the JWT token
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("[Scaffold] Error getting current user:", error);
    return null;
  }
}

/**
 * Get current user from auth cookies (for authenticated requests from the client)
 * This uses Supabase's session management
 */
export async function getCurrentUserFromSession(req: NextRequest) {
  try {
    const supabaseServer = getSupabaseServer();
    
    // Try to get session from cookies
    const { data: { session }, error } = await supabaseServer.auth.getSession();
    
    if (error || !session || !session.user) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("[Scaffold] Error getting user from session:", error);
    return null;
  }
}
