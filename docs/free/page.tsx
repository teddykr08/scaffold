import Link from "next/link";

export default function FreeDocsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Scaffold — FREE</h1>

      <p className="text-lg mb-8 text-gray-700">
        Scaffold FREE lets you embed AI-powered forms into your app without
        OpenAI API keys or usage costs.
      </p>

      <h2 className="text-2xl font-semibold mb-4">What you get</h2>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>Embeddable forms via iframe</li>
        <li>Custom prompts per app & task</li>
        <li>Uses the user’s own ChatGPT session</li>
        <li>No authentication required</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Basic Embed</h2>
      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-8">
{`<iframe
  src="https://YOUR_Scaffold_URL/embed/form?app_id=YOUR_APP_ID&task_name=write_email"
  width="100%"
  height="600"
  frameborder="0">
</iframe>`}
      </pre>

      <Link
        href="/"
        className="inline-block mt-8 text-blue-600 hover:underline"
      >
        ← Back to Home
      </Link>
    </main>
  );
}

