import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    default: "ZestPair | 영양제 궁합 분석 서비스",
    template: "%s | ZestPair",
  },
  description:
    "내가 먹는 영양제들, 같이 먹어도 괜찮을까? AI 기반 영양제 궁합 분석으로 최적의 조합을 찾아보세요. 비타민, 미네랄, 오메가-3 등 수십 종의 영양제 상호작용을 무료로 확인하세요.",
  keywords: [
    "영양제 궁합",
    "영양제 조합",
    "비타민 조합",
    "영양제 함께먹기",
    "영양제 상호작용",
    "ZestPair",
    "제스트페어",
  ],
  authors: [{ name: "ZestPair" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "ZestPair",
    title: "ZestPair | 영양제 궁합 분석 서비스",
    description: "내가 먹는 영양제들, 같이 먹어도 괜찮을까?",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZestPair | 영양제 궁합 분석",
    description: "AI 기반 영양제 궁합 분석 서비스",
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
        <TooltipProvider delayDuration={300}>

          <main className="relative">
            {children}
          </main>

        </TooltipProvider>
      </body>
    </html>
  );
}
