import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const sans = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata = {
  title: "buncho: discover products built in India",
  description: "Discover, upvote and launch products built by Indian indie hackers and SaaS founders.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${display.variable} ${sans.variable}`}>
        <body className="flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
