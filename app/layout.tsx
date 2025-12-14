import { ThemeSwitcher } from "@/components/theme-switcher";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { LoadingProvider } from "@/app/components/providers/loading-provider";
import { ToastProvider } from "@/app/components/ui/toast";
import { LoadingOverlay } from "@/app/components/ui/loading-overlay";
import { FeedbackProvider } from "@/app/components/providers/feedback-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "NexusDoc - Intelligent Document OS",
  description: "The intelligent operating system for managing digital agreements and workflows.",
};

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
});

import { AnimatedBackground } from "@/app/components/ui/animated-background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.className} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <AnimatedBackground />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <LoadingProvider>
            <ToastProvider>
              <FeedbackProvider>
                {children}
                <LoadingOverlay />
              </FeedbackProvider>
            </ToastProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
