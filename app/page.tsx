import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="text-center py-28 px-6 border-b">
        <h1 className="text-5xl font-bold mb-6">Scaffold</h1>

        <p className="text-xl max-w-2xl mx-auto mb-10 text-gray-700 leading-relaxed">
          Add AI features to your app with zero OpenAI API keys.
          <br />
          Simple drop-in forms. 60-second setup.
          <br />
          <span className="font-semibold text-black">Always free for your users.</span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          <Link
            href="/login?mode=signup"
            className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl text-center"
          >
            Get Started (FREE)
          </Link>

          <Link
            href="/how-it-works"
            className="w-full sm:w-auto px-8 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all text-center"
          >
            How it works
          </Link>

          <Link
            href="/pricing"
            className="text-sm font-semibold text-gray-500 hover:text-black transition-colors"
          >
            PRO (Coming Soon)
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
          Simple. Powerful. Free.
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="p-8 border border-gray-100 rounded-2xl shadow-sm bg-white hover:border-gray-200 transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
            </div>
            <h3 className="font-bold text-xl mb-2">No API Keys</h3>
            <p className="text-gray-600">
              Users run prompts through their own ChatGPT sessions. No overhead or token costs for you.
            </p>
          </div>

          <div className="p-8 border border-gray-100 rounded-2xl shadow-sm bg-white hover:border-gray-200 transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="font-bold text-xl mb-2">Easy Setup</h3>
            <p className="text-gray-600">
              Copy-paste a single iframe. Works with React, Vue, Webflow, or plain HTML.
            </p>
          </div>

          <div className="p-8 border border-gray-100 rounded-2xl shadow-sm bg-white hover:border-gray-200 transition-colors">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
            </div>
            <h3 className="font-bold text-xl mb-2">Custom Logic</h3>
            <p className="text-gray-600">
              Define variables, fields, and complex prompt templates in our intuitive builder.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-32 border-t bg-gray-50/50">
        <h2 className="text-4xl font-bold mb-8 tracking-tight">
          Ready to supercharge your app?
        </h2>

        <Link
          href="/login?mode=signup"
          className="px-10 py-5 bg-black text-white rounded-2xl font-extrabold text-lg hover:bg-gray-800 transition-all shadow-2xl hover:shadow-black/20"
        >
          Start Building
        </Link>
        <p className="mt-6 text-gray-500 font-medium italic">Setup takes less than 2 minutes.</p>
      </section>
    </main>
  );
}
