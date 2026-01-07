import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmedTutorialRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Mark tutorial as not completed so it will auto-start
    if (typeof window !== "undefined") {
      localStorage.removeItem('hasSeenTutorial');
      localStorage.removeItem('scaffoldTutorialState');
    }
    // Redirect to builder after a short delay
    setTimeout(() => {
      router.replace("/builder");
    }, 300);
  }, [router]);
  return (
    <main className="min-h-screen flex items-center justify-center text-lg">Redirecting to your builder and starting the tutorial...</main>
  );
}
