"use client";

export default function FAQPage() {
    const faqs = [
        {
            q: "What is Scaffold?",
            a: "Scaffold lets you add AI-powered forms and workflows to your site without needing your own API keys or backend. Users run prompts using their own ChatGPT or LLM accounts."
        },
        {
            q: "How do I add a form to my site?",
            a: "Use the builder to create a form, then copy the embed code to your website. No coding or server setup required."
        },
        {
            q: "Can I use different AI models?",
            a: "Yes! Scaffold works with any LLM your users have access to, including ChatGPT, Claude, Gemini, and more."
        },
        {
            q: "Is there a free plan?",
            a: "Yes, Scaffold offers a free tier for personal and small project use. Upgrade for advanced features and customization."
        }
    ];

    return (
        <div className="min-h-screen relative py-20 px-6 overflow-hidden">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[1px] opacity-20 scale-105"
                style={{ backgroundImage: 'url("/scaffold-bg.jpg")' }}
            />
            {/* Overlay to ensure readability */}
            <div className="absolute inset-0 z-0 bg-white/40" />

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/50">
                    <h1 className="font-graffiti text-5xl mb-4 text-center tracking-tight text-black uppercase">Frequently Asked Questions</h1>
                    <p className="text-gray-900 text-center mb-16 text-xl font-medium">Everything you need to know about Scaffold.</p>

                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white/90 rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold mb-4 text-black flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-scaffold-brand text-black flex items-center justify-center text-xs shrink-0 shadow-sm font-bold">Q</span>
                                    {faq.q}
                                </h3>
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs shrink-0 font-bold">A</span>
                                    <p className="text-black leading-relaxed text-lg font-medium">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

