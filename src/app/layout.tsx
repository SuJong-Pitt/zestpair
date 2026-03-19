import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  metadataBase: new URL("https://zestpair.com"),
  title: {
    default: "영양제 궁합 분석 & 추천 | ZestPair: AI Supplement Synergy & Interaction Checker",
    template: "%s | ZestPair (AI Supplement Synergy)",
  },
  description:
    "AI-powered supplement synergy & vitamin interaction checker. 영양제 궁합과 비타민 상호작용을 AI로 분석하고 최적의 조합을 추천받으세요. Analyze your supplements for safety and effectiveness.",
  keywords: [
    "영양제 궁합",
    "비타민 궁합",
    "영양제 조합",
    "AI 영양제 분석",
    "비타민 상호작용",
    "제스트페어",
    "ZestPair",
    "Supplement Synergy Checker",
    "Vitamin Interaction AI",
    "Supplement Compatibility Check",
    "AI Personalized Nutrition",
    "Vitamin Synergy Guide",
  ],
  authors: [{ name: "ZestPair AI" }],
  creator: "ZestPair Team",
  publisher: "ZestPair AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "ko-KR": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "ZestPair",
    title: "ZestPair | AI Supplement Synergy & Interaction Checker",
    description: "Analyze your supplements for synergy and safety with ZestPair AI. 영양제 궁합과 비타민 상호작용을 전문적으로 분석하세요.",
    images: [
      {
        url: "/hero-illustration.png",
        width: 1200,
        height: 630,
        alt: "ZestPair AI Supplement Synergy & Synergy Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZestPair | AI Supplement Synergy & Interaction Checker",
    description: "Analyze your vitamins for safety and effectiveness with ZestPair AI.",
    images: ["/hero-illustration.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "GOOGLE_VERIFICATION_CODE",
    other: {
      "naver-site-verification": "bf108112d1ae89d195b1f8fa7853a5ab9cecf95d",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10b981",
};

import ScrollToTop from "@/components/ScrollToTop";
import LanguageDetector from "@/components/LanguageDetector";
import GlobalFooter from "@/components/GlobalFooter";

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

          <GlobalFooter />

        </TooltipProvider>
      </body>
    </html>
  );
}
