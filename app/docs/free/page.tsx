import Link from "next/link";

export default function FreeDocs() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-6">Scaffold FREE</h1>

      <p className="mb-6 text-gray-700">
        Embed AI prompts into your app with zero API keys.
      </p>

      <pre className="bg-gray-100 p-4 rounded mb-6 text-sm overflow-x-auto">
        {`<iframe
  src="https://YOUR_SCAFFOLD_URL/embed/form?app_id=YOUR_APP_ID&task_name=write_email"
  width="100%"
  height="600"
></iframe>`}
      </pre>

      <Link href="/" className="text-blue-600 underline">
        ← Back to Home
      </Link>
    </main>
  );
}
