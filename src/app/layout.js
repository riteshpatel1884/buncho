import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeProvider from "@/components/theme-provider";
import Navbar from "@/components/navbar";

export const metadata = {
  title: { default: "Buncho", template: "%s · Buncho" },
  description: "Predict, participate, and prove yourself right.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-bg text-fg antialiased">
          <ThemeProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}