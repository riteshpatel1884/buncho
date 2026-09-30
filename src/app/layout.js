import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "Desi Launch: products built by Indian founders",
  description: "Discover, upvote and launch products built by Indian indie hackers and SaaS founders.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={display.variable}>
        <body className="min-h-screen">
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted">
            Built in India, for people who build in India.
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
