"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Pages where nav links should be visible
  const publicPages = ["/", "/how-it-works", "/faq", "/pricing", "/contact"];
  const showNavLinks = publicPages.includes(pathname || "");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setDropdownOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Check if we are on an embed page
  if (pathname?.startsWith("/embed")) {
    return null;
  }

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-graffiti text-2xl text-black">scaffold</span>
        </Link>

        {/* Center: Links (Desktop) - Only show on public marketing pages */}
        {showNavLinks && (
          <div className="hidden md:flex items-center gap-8 text-lg font-normal font-graffiti text-gray-600">
            <Link href="/how-it-works" className="hover:text-black transition-colors">How It Works</Link>
            <Link href="/faq" className="hover:text-black transition-colors">FAQ</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing(it&apos;s free)</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {showNavLinks && (
            <button
              className="md:hidden p-2 text-gray-600 hover:text-black focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              )}
            </button>
          )}
          {!user ? (
            <Link
              href="/login?mode=signup"
              className="px-4 py-2 text-sm bg-scaffold-brand text-black rounded-lg font-graffiti hover:bg-scaffold-brandHover transition-colors"
            >
              Sign In
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">
                  {(user.user_metadata?.username || user.email || "U")[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm text-gray-700 font-medium pr-1">
                  {user.user_metadata?.username || user.email?.split('@')[0]}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    {user.user_metadata?.username && (
                      <p className="text-sm font-medium text-gray-900 truncate">{user.user_metadata.username}</p>
                    )}
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/builder"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (window.location.pathname !== '/builder') {
                        router.push('/builder');
                      }
                      // Dispatch with a small delay to allow nav to complete or just general safety
                      setTimeout(() => window.dispatchEvent(new CustomEvent('scaffold-restart-tutorial')), 200);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Restart Tutorial
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay - Only show on public marketing pages */}
      {mobileMenuOpen && showNavLinks && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top duration-200">
          <div className="flex flex-col p-6 gap-4 text-xl font-graffiti text-gray-600">
            <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">How It Works</Link>
            <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">FAQ</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Pricing</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Contact</Link>
            {!user && (
              <Link
                href="/login?mode=signup"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 px-6 py-3 bg-scaffold-brand text-black rounded-xl text-center font-bold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

