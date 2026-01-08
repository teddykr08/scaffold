

"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConfirmPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If this page is loaded after email confirmation, clear tutorial state
    if (typeof window !== "undefined") {
      localStorage.removeItem('hasSeenTutorial');
      localStorage.removeItem('scaffoldTutorialState');
    }
    // Optionally, you could verify the token here or just redirect
    setTimeout(() => {
      router.replace("/builder");
    }, 300);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-lg">Welcome! Redirecting to your builder and starting the tutorial...</main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmPageInner />
    </Suspense>
  );
}
