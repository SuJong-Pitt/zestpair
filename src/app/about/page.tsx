import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "서비스 소개 | ZestPair - AI 영양제 궁합 분석",
  description: "ZestPair의 미션과 전문적인 AI 영양제 분석 기술에 대해 알아보세요. 안전한 영양제 섭취를 위한 데이터 기반 가이드를 제공합니다.",
  alternates: {
    canonical: "https://zestpair.com/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
