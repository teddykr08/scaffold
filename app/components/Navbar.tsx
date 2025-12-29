"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Left: Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
          Scaffold
        </Link>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/how-it-works" className="hover:text-black transition-colors">How It Works</Link>
          <Link href="/faq" className="hover:text-black transition-colors">FAQ</Link>
          <Link href="/pricing" className="hover:text-black transition-colors">Pricing(it&apos;s free)</Link>
          <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-4">
          {!user ? (
            <Link
              href="/login?mode=signup"
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm text-gray-700 font-medium pr-1">
                  {user.email?.split('@')[0]}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
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
                    onClick={toggleDarkMode}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark Mode
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${darkMode ? 'bg-black' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-4' : ''}`} />
                    </div>
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
    </header>
  );
}
