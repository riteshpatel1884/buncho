import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NavProgress from "@/components/NavProgress";
import PointerGlow from "@/components/PointerGlow";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const sans = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata = {
  title: "Buncho: get help from people who've already done it",
  description: "Book verified seniors and professionals for resume reviews, mock interviews, career guidance and project reviews.",
};
export const viewport = { themeColor: "#050505" };

// Applies the saved theme before the page paints, so there is no flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="dark" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="flex min-h-screen flex-col">
          <Suspense fallback={null}>
            <NavProgress />
          </Suspense>
          <PointerGlow />
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
