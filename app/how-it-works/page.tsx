"use client";

import Link from "next/link";

export default function HowItWorks() {
    return (
        <div className="min-h-screen bg-white py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="font-graffiti text-5xl mb-8 tracking-tight text-gray-900 text-center uppercase">How it Works</h1>
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4 leading-tight">We give your app all the power and convenience of AI, but for FREE</h2>

                <div className="prose prose-lg text-gray-700 mx-auto">
                    <p className="text-xl mb-12 text-center text-gray-600 leading-relaxed">
                        Scaffold lets you embed AI prompt forms into your app. Users fill forms, get ChatGPT-ready prompts. <span className="text-black font-semibold underline decoration-gray-300">No API keys needed.</span>
                    </p>

                    <div className="space-y-12 mt-16">
                        <div className="flex gap-6 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-black text-white flex-shrink-0 flex items-center justify-center font-bold text-xl shadow-lg">1</div>
                            <div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900 border-b pb-2">Create an App</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Go to the dashboard and create a new project. Define your prompt template using variables like <code className="bg-gray-100 px-1.5 py-0.5 rounded text-black font-mono text-sm">{"{{topic}}"}</code>.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-black text-white flex-shrink-0 flex items-center justify-center font-bold text-xl shadow-lg">2</div>
                            <div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900 border-b pb-2">Embed the Form</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Copy the one-line iframe code and paste it into your website or application. The form will automatically render with the fields you defined.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-black text-white flex-shrink-0 flex items-center justify-center font-bold text-xl shadow-lg">3</div>
                            <div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900 border-b pb-2">Zero Costs</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    When users submit the form, we generate the final prompt. Users then copy-paste it into their own ChatGPT session or open it directly in a new tab. No OpenAI bills for you.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 text-center p-12 bg-gray-50 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
                        <Link href="/login?mode=signup" className="inline-block px-8 py-4 bg-scaffold-brand text-black rounded-xl font-graffiti text-lg hover:bg-scaffold-brandHover transition-all shadow-xl hover:shadow-2xl">
                            Build your first app
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

