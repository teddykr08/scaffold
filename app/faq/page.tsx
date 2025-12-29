"use client";

export default function FAQPage() {
    const faqs = [
        {
            q: "Do I need OpenAI API?",
            a: "No. Users use their own ChatGPT session to run the prompts you generate. This eliminates your API costs and allows users to use their preferred LLM."
        },
        {
            q: "How does embedding work?",
            a: "Simply copy the provided iframe code and paste it anywhere on your site. It works with React, Vue, Webflow, or plain HTML. We handle all the form logic and prompt generation."
        },
        {
            q: "Is it secure?",
            a: "Yes. Your prompt templates are stored securely on our servers and variables are injected on the fly. Users never see your raw system instructions if you choose to hide them."
        },
        {
            q: "Can I customize the form styling?",
            a: "The embedded form inherits a clean, neutral design that works well with most websites. Premium users will soon be able to customize colors and fonts."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-center tracking-tight text-gray-900">Frequently Asked Questions</h1>
                <p className="text-gray-600 text-center mb-16 text-xl">Everything you need to know about Scaffold.</p>

                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold mb-4 text-black flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs shrink-0">Q</span>
                                {faq.q}
                            </h3>
                            <div className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs shrink-0 font-bold">A</span>
                                <p className="text-gray-600 leading-relaxed text-lg">{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
