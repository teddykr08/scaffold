"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          Scaffold
        </Link>

        <div className="flex gap-6">
          <Link href="/docs/free" className="hover:underline">
            FREE
          </Link>
          <Link href="/docs/pro" className="hover:underline">
            PRO
          </Link>
        </div>
      </nav>
    </header>
  );
}
