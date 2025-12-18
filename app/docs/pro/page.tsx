import Link from "next/link";

export default function ProDocsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Scaffold — PRO</h1>

      <p className="text-lg mb-8 text-gray-700">
        Scaffold PRO is for teams that want more control, customization,
        and scalability.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Planned PRO Features</h2>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>Saved user profiles</li>
        <li>Multiple tasks per app</li>
        <li>Advanced prompt validation</li>
        <li>Rate limiting & analytics</li>
        <li>Custom embed styling</li>
      </ul>

      <p className="text-gray-600 mb-10">
        PRO builds on the FREE system — no separate codebase required.
      </p>

      <Link
        href="/"
        className="inline-block text-blue-600 hover:underline"
      >
        ← Back to Home
      </Link>
    </main>
  );
}
