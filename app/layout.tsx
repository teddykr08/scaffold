import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Scaffold",
  description: "Embed AI prompts into your app with zero API keys",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
