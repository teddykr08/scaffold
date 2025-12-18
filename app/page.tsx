import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="text-center py-28 px-6 border-b">
        <h1 className="text-5xl font-bold mb-6">Scaffold</h1>

        <p className="text-xl max-w-2xl mx-auto mb-10 text-gray-700">
          Add AI features to your app with zero OpenAI API keys.
          <br />
          Embed a form. We generate the ChatGPT prompt.
        </p>

        <div className="flex justify-center gap-6">
          <Link
            href="/docs/free"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Get Started (FREE)
          </Link>

          <Link
            href="/docs/pro"
            className="px-6 py-3 border rounded-lg hover:bg-gray-100"
          >
            PRO (Coming Soon)
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Built for Embedding
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold mb-2">No API Keys</h3>
            <p className="text-gray-700">
              Uses your users’ own ChatGPT session. No model costs.
            </p>
          </div>

          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold mb-2">Drop-in Forms</h3>
            <p className="text-gray-700">
              Embed with an iframe. Looks like Stripe or Google Forms.
            </p>
          </div>

          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold mb-2">App-Specific Prompts</h3>
            <p className="text-gray-700">
              Each app defines its own tasks, fields, and prompts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-24 border-t">
        <h2 className="text-3xl font-semibold mb-8">
          Ready to embed AI into your app?
        </h2>

        <Link
          href="/docs/free"
          className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Read FREE Docs
        </Link>
      </section>
    </main>
  );
}
