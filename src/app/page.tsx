import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "영양제 궁합 분석 & 추천 | ZestPair: AI Supplement Synergy & Interaction Checker",
  description: "AI로 분석하는 내 영양제 궁합과 비타민 상호작용. 제스트페어에서 최적의 조합을 영양제 시너지 가이드와 함께 확인하세요.",
  alternates: {
    canonical: "https://zestpair.com",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ZestPair",
            "url": "https://zestpair.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://zestpair.com/analysis?v={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }),
        }}
      />
      <HomeClient />
    </>
  );
}
