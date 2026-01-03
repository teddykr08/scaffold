"use client";

import { useEffect } from "react";

export default function DemoPage() {
    const DEMO_APP_ID = process.env.NEXT_PUBLIC_DEMO_APP_ID || "eee1a61f-c5d8-463b-a143-5f8a05dfe2a5";
    const DEMO_TASK_NAME = "show_demo";

    useEffect(() => {
        console.log("[Demo Page] DEMO_APP_ID:", DEMO_APP_ID);
        console.log("[Demo Page] DEMO_TASK_NAME:", DEMO_TASK_NAME);
        const embedUrl = `/embed/form?app_id=${DEMO_APP_ID}&task_name=${DEMO_TASK_NAME}&color=%23fdcd13&font=Montserrat`;
        console.log("[Demo Page] Embed URL:", embedUrl);
    }, [DEMO_APP_ID]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-black mb-4" style={{ fontFamily: 'var(--font-graffiti)' }}>
                        🎨 Try Scaffold
                    </h1>
                    <p className="text-gray-900 text-lg">
                        Answer a few questions to see how Scaffold works!
                    </p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                    <iframe
                        src={`/embed/form?app_id=${DEMO_APP_ID}&task_name=${DEMO_TASK_NAME}&color=%23fdcd13&font=Montserrat`}
                        className="w-full h-[600px] border-0"
                        title="Scaffold Demo"
                    />
                </div>

                <div className="text-center mt-8">
                    <a
                        href="/builder"
                        className="inline-block px-8 py-4 bg-[#CFFC4E] text-black font-bold rounded-xl hover:bg-[#b8e03a] transition-all transform hover:scale-105"
                    >
                        Build Your Own App
                    </a>
                </div>
            </div>
        </div>
    );
}
