import { Metadata } from "next";
import AnalysisClient from "./AnalysisClient";

export const metadata: Metadata = {
  title: "영양제 궁합 분석 결과 | ZestPair AI",
  description: "선택하신 영양제 조합의 상세 분석 결과입니다. AI가 분석한 시너지 효과와 섭취 주의사항을 확인하세요.",
  alternates: {
    canonical: "https://zestpair.com/analysis",
  },
};

export default function AnalysisPage() {
  return <AnalysisClient />;
}
