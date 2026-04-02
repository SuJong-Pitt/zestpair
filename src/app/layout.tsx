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
    title: "ZestPair | AI 영양제 궁합 분석 & 추천 가이드",
    description: "AI로 분석하는 내 영양제 궁합과 비타민 상호작용. 제스트페어에서 최적의 조합을 영양제 시너지 가이드와 함께 확인하세요.",
    images: [
      {
        url: "/hero-illustration-v3.webp",
        width: 1200,
        height: 630,
        alt: "제스트페어 AI 영양제 궁합 & 비타민 조합 가이드 (v3)",
      },
      {
        url: "/hero-illustration-v4.webp",
        width: 1200,
        height: 630,
        alt: "제스트페어 AI 영양제 궁합 & 비타민 조합 가이드 (v4)",
      },
      {
        url: "/hero-illustration-v5.webp",
        width: 1200,
        height: 630,
        alt: "제스트페어 AI 영양제 궁합 & 비타민 조합 가이드 (v5)",
      },
      {
        url: "/hero-illustration-v6.webp",
        width: 1200,
        height: 630,
        alt: "제스트페어 AI 영양제 궁합 & 비타민 조합 가이드 (v6)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZestPair | AI 영양제 궁합 분석 & 추천 가이드",
    description: "AI로 분석하는 내 영양제 궁합과 비타민 상호작용. 제스트페어에서 나에게 딱 맞는 영양제 조합을 확인하세요.",
    images: [
      "/hero-illustration-v3.webp",
      "/hero-illustration-v4.webp",
      "/hero-illustration-v5.webp",
      "/hero-illustration-v6.webp",
    ],
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo.svg",
    apple: "/logo.svg",
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
        {/* SEO: Google Knowledge Panel / Search Logo & Thumbnail */}
        <meta name="thumbnail" content="https://zestpair.com/hero-illustration-v3.webp" />
        <meta name="thumbnail" content="https://zestpair.com/hero-illustration-v4.webp" />
        <meta name="thumbnail" content="https://zestpair.com/hero-illustration-v5.webp" />
        <meta name="thumbnail" content="https://zestpair.com/hero-illustration-v6.webp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              url: "https://zestpair.com",
              logo: "https://zestpair.com/hero-illustration-v3.webp",
              image: [
                "https://zestpair.com/hero-illustration-v3.webp",
                "https://zestpair.com/hero-illustration-v4.webp",
                "https://zestpair.com/hero-illustration-v5.webp",
                "https://zestpair.com/hero-illustration-v6.webp",
              ]
            }),
          }}
        />
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
