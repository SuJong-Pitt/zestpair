import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    default: "ZestPair | AI Supplement Analysis & Synergy (영양제 궁합 분석)",
    template: "%s | ZestPair",
  },
  description:
    "AI-Powered Supplement Synergy Analysis. Check conflicts and boost benefits of your daily vitamins with ZestPair. AI 기반 영양제 궁합 분석으로 최상의 시너지를 찾아보세요.",
  keywords: [
    "Supplement Synergy",
    "Vitamin Interaction",
    "AI Supplement Analysis",
    "Drug-Nutrient Interaction",
    "영양제 궁합",
    "비타민 조합",
    "ZestPair",
    "제스트페어",
  ],
  authors: [{ name: "ZestPair AI Core" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "ZestPair",
    title: "ZestPair | AI Supplement Synergy Core",
    description: "AI-Powered Supplement Synergy Analysis (영양제 궁합 분석)",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZestPair | AI Supplement Synergy Core",
    description: "AI-Powered Supplement Synergy Analysis Service",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // 모바일 확대 방지
  themeColor: "#10b981",
};

import ScrollToTop from "@/components/ScrollToTop";
import LanguageDetector from "@/components/LanguageDetector";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Pretendard: modern, premium Korean/English optimized font */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="antialiased font-sans bg-white" suppressHydrationWarning>
        <LanguageDetector />
        <TooltipProvider delayDuration={300}>

          <main className="relative">
            {children}
          </main>

        </TooltipProvider>
      </body>
    </html>
  );
}
