import Link from "next/link";
import EmbedScrollListener from "@/app/components/EmbedScrollListener";

const useCases = [
  { icon: '🍕', title: 'Restaurant Menu Bot', desc: 'Answers "What\'s vegan?" using your menu' },
  { icon: '✍️', title: 'Blog Title Generator', desc: 'Creates 10 title ideas from a topic' },
  { icon: '📧', title: 'Email Writer', desc: 'Drafts professional emails fast' },
  { icon: '🎓', title: 'Study Tutor', desc: 'Explains concepts from your course material' },
  { icon: '🛍️', title: 'Product Description Generator', desc: 'E-commerce product copy writer' },
  { icon: '💬', title: 'Customer Support Tickets', desc: 'Templates for common support issues' },
  { icon: '💻', title: 'Code Snippet Generator', desc: 'Creates code from requirements' },
  { icon: '❓', title: 'FAQ Bot', desc: 'Answers questions using your docs' },
];

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* SECTION 1: Hero */}
      <section className="text-center py-20 px-6 border-b">
        <div className="flex justify-center mb-6">
          <span className="font-graffiti text-7xl sm:text-8xl text-black">scaffold</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto">
          Add AI Features to Your Site. No Code, No API Keys.
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Build custom AI tools and chatbots, then embed them anywhere. Free forever.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/login?mode=signup"
            className="px-8 py-4 bg-scaffold-brand text-black rounded-xl font-bold text-lg hover:bg-scaffold-brandHover transition-all shadow-lg"
          >
            Get Started (FREE)
          </Link>
          <a
            href="#demos"
            className="px-8 py-4 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all cursor-pointer"
          >
            See Demos
          </a>
        </div>
      </section>

      {/* SECTION 2: Who This Is For */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-4xl font-bold text-center mb-12">Who Uses Scaffold?</h2>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">🛠️ Hobbyists & Indie Devs</h3>
            <p className="text-gray-700 mb-4">
              Building side projects without API costs. Prototype AI features fast.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Side projects with $0 budget</li>
              <li>• Portfolio projects</li>
              <li>• Learning AI integration</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">🏪 Small Businesses</h3>
            <p className="text-gray-700 mb-4">
              Add AI tools to your site without hiring developers. Restaurants, tutors, agencies.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Restaurant menu chatbots</li>
              <li>• FAQ automation</li>
              <li>• Customer support helpers</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">🚀 Validating Ideas</h3>
            <p className="text-gray-700 mb-4">
              Test if AI features work for your users before paying for API access.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• MVP prototypes</li>
              <li>• User testing</li>
              <li>• Proof of concept</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3: Two Demo Types */}
      <section id="demos" className="py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Two Ways to Use Scaffold</h2>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">AI Tools (Quick Generators)</h3>
            <p className="text-gray-700 mb-6">
              One input → One AI output. Perfect for content creation.
            </p>
            <div className="rounded-lg mb-4">
              <iframe
                id="embed-iframe-1"
                src="/embed/form?app_id=eee1a61f-c5d8-463b-a143-5f8a05dfe2a5&task_name=blog_title_generator&color=%23000000&font=Lato"
                className="w-full rounded-lg border-0"
                style={{ minHeight: '400px' }}
              />
            </div>
            <p className="text-sm text-gray-600">
              <strong>Use for:</strong> Blog titles, emails, descriptions, code snippets
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">Smart Agents (Contextual Chatbots)</h3>
            <p className="text-gray-700 mb-6">
              AI with your specific knowledge. Answers questions about YOUR stuff.
            </p>
            <div className="rounded-lg mb-4">
              <iframe
                id="embed-iframe-2"
                src="/embed/form?app_id=eee1a61f-c5d8-463b-a143-5f8a05dfe2a5&task_name=restaurant_menu_bot&color=%238f0f0f&font=Playfair%20Display"
                className="w-full rounded-lg border-0"
                style={{ minHeight: '400px' }}
              />
            </div>
            <p className="text-sm text-gray-600">
              <strong>Use for:</strong> Menu bots, FAQ bots, tutors, product finders
            </p>
          </div>
        </div>
      </section>

        <EmbedScrollListener />

      {/* SECTION 4: Use Case Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-4xl font-bold text-center mb-12">What You Can Build</h2>
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <span className="text-4xl mb-3 block">{useCase.icon}</span>
              <h4 className="font-bold text-lg mb-2">{useCase.title}</h4>
              <p className="text-gray-600 text-sm">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: How Is This Free? */}
      <section className="py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">How Is This Actually Free?</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <span className="inline-block w-12 h-12 bg-scaffold-brand rounded-full flex items-center justify-center font-bold text-xl mb-4">1</span>
              <p className="text-gray-700">You build a form with fields (topic, tone, etc.)</p>
            </div>
            <div className="text-center">
              <span className="inline-block w-12 h-12 bg-scaffold-brand rounded-full flex items-center justify-center font-bold text-xl mb-4">2</span>
              <p className="text-gray-700">You write a prompt template using those fields</p>
            </div>
            <div className="text-center">
              <span className="inline-block w-12 h-12 bg-scaffold-brand rounded-full flex items-center justify-center font-bold text-xl mb-4">3</span>
              <p className="text-gray-700">Scaffold generates an optimized ChatGPT prompt</p>
            </div>
            <div className="text-center">
              <span className="inline-block w-12 h-12 bg-scaffold-brand rounded-full flex items-center justify-center font-bold text-xl mb-4">4</span>
              <p className="text-gray-700">User sends it to ChatGPT (they control the AI interaction)</p>
            </div>
          </div>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
            <p className="text-lg font-bold mb-4">
              <strong>We don&apos;t call OpenAI&apos;s API</strong> → We don&apos;t pay per request → You don&apos;t pay per request
            </p>
            <p className="text-green-800 font-bold text-xl">
              ✅ Free tier (3 apps, 3 tasks each) stays free forever. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Free Alternative to AI API Keys */}
      <section className="py-20 px-6 bg-blue-50">
        <h2 className="text-4xl font-bold text-center mb-8">Free Alternative to AI API Keys (OpenAI, Anthropic, Google)</h2>
        <div className="max-w-4xl mx-auto mb-10">
          <div className="bg-white p-8 rounded-xl border-l-4 border-blue-500 mb-6">
            <h3 className="text-2xl font-bold mb-2">Problem</h3>
            <ul className="list-disc pl-6 text-gray-800 space-y-1">
              <li>API keys cost money and require a credit card</li>
              <li>Backend setup and server security needed</li>
              <li>Ongoing monitoring and usage limits</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-xl border-l-4 border-green-500 mb-6">
            <h3 className="text-2xl font-bold mb-2">Solution</h3>
            <p className="text-gray-800">Scaffold lets you add AI features to your site without managing API keys from OpenAI, Claude, Gemini, or any LLM provider. Scaffold generates prompts that users send to ChatGPT (or their preferred LLM) for free—no backend or billing required.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border-l-4 border-gray-400 mb-6">
            <h3 className="text-2xl font-bold mb-4">API Approach vs Scaffold</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">Feature</th>
                    <th className="py-2 px-4 border-b">API Approach</th>
                    <th className="py-2 px-4 border-b">Scaffold</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-b">Cost</td>
                    <td className="py-2 px-4 border-b">Pay per request</td>
                    <td className="py-2 px-4 border-b font-bold text-green-700">Free</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Setup</td>
                    <td className="py-2 px-4 border-b">Backend, API keys</td>
                    <td className="py-2 px-4 border-b">No backend, no keys</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Security</td>
                    <td className="py-2 px-4 border-b">Must secure keys</td>
                    <td className="py-2 px-4 border-b">No sensitive keys</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">User Experience</td>
                    <td className="py-2 px-4 border-b">Direct response in app</td>
                    <td className="py-2 px-4 border-b">Prompt opens in ChatGPT</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Best For</td>
                    <td className="py-2 px-4">Production, high volume</td>
                    <td className="py-2 px-4">Prototypes, side projects</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl border-l-4 border-blue-400 mb-6">
            <h3 className="text-2xl font-bold mb-2">Use Cases</h3>
            <ul className="list-disc pl-6 text-gray-800 space-y-1">
              <li>Freelancers and consultants</li>
              <li>Students and educators</li>
              <li>Indie developers and hobbyists</li>
              <li>Anyone prototyping AI features</li>
            </ul>
          </div>
          <div className="text-center mt-10">
            <Link href="/builder">
              <span className="inline-block px-10 py-4 bg-scaffold-brand text-black rounded-xl font-bold text-lg hover:bg-scaffold-brandHover transition-all shadow-lg">Try the Builder (Free)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7: Final CTA */}
      <section className="text-center py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <h2 className="text-5xl font-bold mb-6">Ready to Build?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Free forever. No credit card. 5 minute setup.
        </p>
        <Link
          href="/login?mode=signup"
          className="inline-block px-12 py-5 bg-scaffold-brand text-black rounded-xl font-bold text-xl hover:bg-scaffold-brandHover transition-all shadow-2xl"
        >
          Get Started
        </Link>
        <p className="mt-6 text-gray-500">3 apps included. Always free.</p>
      </section>
    </main>
  );
}

