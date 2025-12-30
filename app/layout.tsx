import { Sedgwick_Ave, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

const graffiti = Sedgwick_Ave({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-graffiti'
})

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
    <html lang="en" className={`${graffiti.variable}`}>
      <body className={`${inter.className} bg-white text-gray-900`}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
