import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="text-center py-28 px-6 border-b relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <span className="font-graffiti text-7xl sm:text-8xl text-black">scaffold</span>
        </div>

        <p className="text-xl max-w-2xl mx-auto mb-10 text-gray-700 leading-relaxed tracking-wider font-medium">
          AI Prompts Made Simple
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 relative z-10">
          <Link
            href="/login?mode=signup"
            className="w-full sm:w-auto px-8 py-4 bg-scaffold-brand text-black rounded-xl font-graffiti text-lg hover:bg-scaffold-brandHover transition-all shadow-lg hover:shadow-xl text-center"
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

      {/* Features with Background Image */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background Image with Blur */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[2px] opacity-30 scale-110"
          style={{ backgroundImage: 'url("/scaffold-bg.jpg")' }}
        />
        {/* Overlay to ensure readability */}
        <div className="absolute inset-0 z-0 bg-white/20" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-[4rem] p-12 md:p-20 shadow-2xl border border-white/40">
            <h2 className="font-graffiti text-5xl text-center mb-16 tracking-tight text-black">
              Simple. Powerful. Free.
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-10 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 bg-scaffold-brand rounded-2xl flex items-center justify-center mb-6 text-black shadow-lg">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-black">No API Keys</h3>
                <p className="text-black leading-relaxed font-medium">
                  Users run prompts through their own ChatGPT sessions. No overhead or token costs for you.
                </p>
              </div>

              <div className="p-10 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 bg-scaffold-brand rounded-2xl flex items-center justify-center mb-6 text-black shadow-lg">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-black">Easy Setup</h3>
                <p className="text-black leading-relaxed font-medium">
                  Copy-paste a single iframe. Works with React, Vue, Webflow, or plain HTML.
                </p>
              </div>

              <div className="p-10 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 bg-scaffold-brand rounded-2xl flex items-center justify-center mb-6 text-black shadow-lg">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
                </div>
                <h3 className="font-bold text-2xl mb-3 text-black">Custom Logic</h3>
                <p className="text-black leading-relaxed font-medium">
                  Define variables, fields, and complex prompt templates in our intuitive builder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-32 border-t bg-gray-50/50">
        <h2 className="font-graffiti text-5xl mb-8 tracking-tight text-black">
          Ready to supercharge your app?
        </h2>

        <Link
          href="/login?mode=signup"
          className="px-10 py-5 bg-scaffold-brand text-black rounded-2xl font-graffiti text-xl hover:bg-scaffold-brandHover transition-all shadow-2xl hover:shadow-scaffold-brand/20"
        >
          Start Building
        </Link>
        <p className="mt-6 text-gray-500 font-medium italic">Setup takes less than 2 minutes.</p>
      </section>
    </main>
  );
}

