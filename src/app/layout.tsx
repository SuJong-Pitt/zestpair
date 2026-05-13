import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = (searchParams?.lang as string) || "ko";
  
  const translations = {
    ko: {
      title: "영양제 궁합 분석 & 추천 | ZestPair: AI Supplement Synergy & Interaction Checker",
      description: "AI-powered supplement synergy & vitamin interaction checker. 영양제 궁합과 비타민 상호작용을 AI로 분석하고 최적의 조합을 추천받으세요.",
      ogTitle: "ZestPair | AI 영양제 궁합 분석 & 추천 가이드",
      ogDescription: "AI로 분석하는 내 영양제 궁합과 비타민 상호작용. 제스트페어에서 최적의 조합을 확인하세요.",
    },
    en: {
      title: "Supplement Synergy & Interaction Checker | ZestPair",
      description: "Analyze supplement compatibility and vitamin interactions with AI. Get personalized supplement combination recommendations.",
      ogTitle: "ZestPair | AI Supplement Synergy & Interaction Guide",
      ogDescription: "AI-powered analysis for your supplements. Find the perfect combinations on ZestPair.",
    },
    ja: {
      title: "サプリメントの飲み合わせ分析 & おすすめ | ZestPair: AI Interaction Checker",
      description: "AIによるサプリメントの飲み合わせとビタミンの相互作用分析。あなたに最適な組み合わせをAIが提案します。",
      ogTitle: "ZestPair | AIサプリメント飲み合わせ・相乗効果ガイド",
      ogDescription: "AIで分析するサプリメントの相性と相互作用。ZestPairで最適な組み合わせを確認しましょう。",
    },
    zh: {
      title: "营养剂搭配分析 & 推荐 | ZestPair: AI Interaction Checker",
      description: "利用AI分析营养剂的搭配和维生素的相互作用。为您推荐最适合的营养组合。",
      ogTitle: "ZestPair | AI营养剂搭配与相互作用指南",
      ogDescription: "通过AI分析您的营养剂相容性。在ZestPair上找到完美的搭配方案。",
    }
  };

  const t = translations[lang as keyof typeof translations] || translations.ko;

  return {
    metadataBase: new URL("https://zestpair.com"),
    title: {
      default: t.title,
      template: "%s | ZestPair",
    },
    description: t.description,
    keywords: [
      "영양제 궁합", "비타민 궁합", "영양제 조합", "AI 영양제 분석", "비타민 상호작용", "ZestPair",
      "サプリメント 飲み合わせ", "ビタミン 相乗効果", "营养剂 搭配", "维生素 相互作用"
    ],
    alternates: {
      canonical: lang === "ko" ? "https://zestpair.com" : `https://zestpair.com/?lang=${lang}`,
      languages: {
        "x-default": "/",
        "ko-KR": "/",
        "en-US": "/?lang=en",
        "ja-JP": "/?lang=ja",
        "zh-CN": "/?lang=zh",
      },
    },
    openGraph: {
      type: "website",
      locale: lang === "ko" ? "ko_KR" : lang === "ja" ? "ja_JP" : lang === "zh" ? "zh_CN" : "en_US",
      siteName: "ZestPair",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [
        { url: "/hero-illustration-v3.webp", width: 1200, height: 630 },
        { url: "/hero-illustration-v6.webp", width: 1200, height: 630 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
      images: ["/hero-illustration-v6.webp"],
    },
    icons: {
      icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
      shortcut: "/logo.svg",
      apple: "/logo.svg",
    },
    manifest: "/manifest.json",
    verification: {
      google: "GOOGLE_VERIFICATION_CODE",
      other: {
        "naver-site-verification": "bf108112d1ae89d195b1f8fa7853a5ab9cecf95d",
      },
    },
  };
}

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
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  // layout.tsx (서버 컴포넌트)에서 searchParams를 직접 쓰기 위해서는 
  // Next.js 15+ 규격에 맞춰야 하므로, 여기서는 children을 그대로 둡니다.
  // 실제 html lang은 클라이언트 사이드 LanguageDetector가 hydration 시 보정하거나,
  // 혹은 middleware에서 lang을 주입하는 방식으로 처리됩니다.
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Performance: DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://t1.kakaocdn.net" />
        
        {/* SEO: Google Knowledge Panel / Search Logo & Thumbnail */}
        <meta name="NaverBot" content="All" />
        <meta name="NaverBot" content="index,follow" />
        <meta name="Yeti" content="All" />
        <meta name="Yeti" content="index,follow" />
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
              "name": "ZestPair",
              "alternateName": ["제스트페어", "ZestPair AI", "ゼストペア"],
              "url": "https://zestpair.com",
              "logo": "https://zestpair.com/hero-illustration-v3.webp",
              "sameAs": [
                "https://www.instagram.com/zestpair",
              ],
              "image": [
                "https://zestpair.com/hero-illustration-v3.webp",
                "https://zestpair.com/hero-illustration-v4.webp",
                "https://zestpair.com/hero-illustration-v5.webp",
                "https://zestpair.com/hero-illustration-v6.webp",
              ]
            }),
          }}
        />
        {/* Google Fonts: Noto Sans JP & SC for improved CJK typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />

        {/* Pretendard: modern, premium Korean/English optimized font */}
        {/* preload: render-blocking 방지 */}
        <link
          rel="preload"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <link
          rel="stylesheet"
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
        
        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZKMGFGYT2E"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-ZKMGFGYT2E', {
              'language': new URLSearchParams(window.location.search).get('lang') || 'ko',
              'page_title': document.title
            });
          `}
        </Script>

        {/* Kakao SDK (afterInteractive: 인터랙션 후 로드) */}
        <Script 
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
