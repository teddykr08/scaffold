import { createClient } from "@supabase/supabase-js";

/**
 * Make an authenticated fetch request with the user's auth token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit & { isPublic?: boolean } = {}
) {
  const { isPublic = false, ...fetchOptions } = options;

  if (!isPublic) {
    // Get the session token from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  }

  return fetch(url, fetchOptions);
}
