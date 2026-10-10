import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Schibsted_Grotesk, Onest } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NavProgress from "@/components/NavProgress";
import MobileTabBar from "@/components/MobileTabBar";
import "./globals.css";

const display = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" });
const sans = Onest({ subsets: ["latin"], variable: "--font-onest" });

export const metadata = {
  title: "Buncho",
  description: "Book verified seniors and professionals for resume reviews, mock interviews, career guidance and project reviews.",
};
export const viewport = { themeColor: "#f6f8fb" };

// Applies the saved theme before the page paints, so there is no flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="light" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="flex min-h-screen flex-col">
          <Suspense fallback={null}>
            <NavProgress />
          </Suspense>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-6 sm:px-6 md:py-12">{children}</main>
          <Footer />
          <MobileTabBar />
        </body>
      </html>
    </ClerkProvider>
  );
}