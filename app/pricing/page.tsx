"use client";

import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="font-graffiti text-5xl text-gray-900 mb-4 tracking-tight">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-gray-600">Choose the plan that&apos;s right for your app.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* FREE PLAN */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <h2 className="text-2xl font-bold mb-2">FREE</h2>
                        <p className="text-gray-500 mb-6 font-medium">For hobbyists and side projects</p>
                        <div className="text-4xl font-bold mb-8">$0<span className="text-lg font-normal text-gray-500">/mo</span></div>

                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-700 font-medium">3 apps</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-700 font-medium">5 tasks per app</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-700 font-medium">&quot;Powered by Scaffold&quot; watermark (it&apos;s tiny dw)</span>
                            </li>
                        </ul>

                        <Link href="/login?mode=signup" className="block w-full text-center py-4 bg-scaffold-brand text-black rounded-xl font-graffiti hover:bg-scaffold-brandHover transition-colors">
                            Get Started
                        </Link>
                    </div>

                    {/* PRO PLAN */}
                    <div className="bg-black rounded-2xl border border-gray-800 p-8 shadow-2xl text-white relative overflow-hidden flex flex-col">
                        <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                            Coming Soon
                        </div>
                        <h2 className="text-2xl font-bold mb-2">PRO</h2>
                        <p className="text-gray-400 mb-6 font-medium">For professional applications</p>
                        <div className="text-4xl font-bold mb-8">$9.99<span className="text-lg font-normal text-gray-400">/mo</span></div>

                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-200 font-medium">Unlimited apps & tasks</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-200 font-medium">Remove watermark</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-200 font-medium">Analytics dashboard</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <span className="text-gray-200 font-medium">Priority support</span>
                            </li>
                        </ul>

                        <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSec7H4vX8_GH7sf7ObaYR2NPjrJAxQtDC_r6Yny2HRcw0ZHfg/viewform?usp=header"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-4 bg-white text-black text-center rounded-xl font-graffiti text-lg hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            Join Waitlist
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

