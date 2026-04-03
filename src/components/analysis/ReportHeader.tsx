"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Share2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBasketStore } from "@/store/basketStore";
import { BrandLogo, BrandName } from "@/components/BrandAssets";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useState, useEffect } from "react";
import Toast from "@/components/ui/Toast";
import { encodeShareParams } from "@/lib/utils";

declare global {
  interface Window {
    Kakao: any;
  }
}

/**
 * 분석 리포트 전용 헤더 (AI 디자인실장 영자 스타일 🎨)
 * 
 * - 로고 클릭 시 홈으로 이동 (데이터 유지 / 수정 모드)
 * - 수정하기 버튼 클릭 시 홈으로 이동 (데이터 유지)
 * - 글래스모피즘 & 플로팅 내비게이션
 */
export default function ReportHeader() {
    const router = useRouter();
    const { language, selectedIngredients, analysisResult } = useBasketStore();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [toast, setToast] = useState({ show: false, message: "" });
    
    // 카카오 SDK 초기화
    useEffect(() => {
        if (typeof window !== "undefined" && window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init("27a049c799662857ed882c2639461392");
            }
        }
    }, []);

    const handleShare = async () => {
        const slugs = selectedIngredients.map(ing => ing.slug);
        const encoded = encodeShareParams(slugs);
        const shareUrl = `${window.location.origin}/analysis?v=${encoded}`;
        const score = analysisResult?.score ?? 0;

        // 점수별 타겟 이미지 매핑 (미리 public/images/share 폴더에 세팅함)
        let imageFileName = "pori-0.png";
        if (score === 100) imageFileName = "pori-100.png";
        else if (score >= 90) imageFileName = "pori-90.png";
        else if (score >= 70) imageFileName = "pori-70.png";
        else if (score >= 50) imageFileName = "pori-50.png";

        const targetImageUrl = `${window.location.origin}/images/share/${imageFileName}`;

        // 찰진 마케팅 워딩 조합
        const title = language === 'ko' 
            ? `🚨 내 약통 점수는 ${score}점! (치명적 충돌 주의)` 
            : `🚨 Supplement Match Score: ${score}pts!`;
        const description = language === 'ko'
            ? "비싼 소변을 만들고 계시지는 않나요? Pori AI에게 영양제 궁합을 채점받아보세요."
            : "Check your active supplement interactions instantly!";

        // 카카오톡 공유 기능이 로드되었는지 확인
        if (typeof window !== "undefined" && window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init("27a049c799662857ed882c2639461392");
            }
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: title,
                    description: description,
                    imageUrl: targetImageUrl,
                    imageWidth: 800,
                    imageHeight: 800,
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl,
                    },
                },
                buttons: [
                    {
                        title: language === 'ko' ? '내 약통 점수 확인하기' : 'Check my score',
                        link: {
                            mobileWebUrl: shareUrl,
                            webUrl: shareUrl,
                        },
                    },
                ],
            });
            return; // 카카오 공유 성공 시 일반 시스템 루틴 종료
        }

        // 카카오 미지원 환경 (해외 등) 폴백: Web Share API 또는 클립보드 복사
        const shareData = {
            title: "ZestPair | 영양제 궁합 분석 결과",
            text: title,
            url: shareUrl
        };

        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) {}
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setToast({ 
                    show: true, 
                    message: language === 'ko' ? "링크가 복사되었습니다!" : "Link copied to clipboard!" 
                });
                setTimeout(() => setToast({ show: false, message: "" }), 3000);
            } catch (err) {}
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 md:py-4 transition-all duration-300 bg-slate-950/40 backdrop-blur-md border-b border-white/5">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 md:gap-4">
                
                {/* 🎨 1. 브랜드 로고 (Home 이동) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2.5 cursor-pointer group"
                    onClick={() => router.push("/")}
                >
                    <div className="relative flex items-center gap-3 px-3.5 md:px-5 py-2.5 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                        <BrandLogo />
                        <BrandName size="text-[15px] md:text-[20px]" />
                        <div className="hidden md:block w-px h-4 bg-white/20 mx-1" />
                        <Link
                            href="/about"
                            className="hidden md:flex text-[9px] font-black uppercase tracking-widest text-[#6ee7b7]/80 items-center gap-1.5 hover:text-[#6ee7b7] transition-all group/core"
                        >
                            <div className="flex items-center gap-1">
                                <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"
                                />
                                <span>AI Core v2.5</span>
                            </div>
                            <Info size={10} className="text-[#6ee7b7]/40 group-hover/core:text-[#6ee7b7] transition-colors" />
                        </Link>
                    </div>
                </motion.div>

                {/* 🎨 2. 리포트 내비게이션 액션 */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* 선택 수정하기 버튼 (대표님 제안 요건: 뒤로 가기 탈출구!) */}
                    <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group"
                    >
                        <ArrowLeft size={16} className="text-slate-400 group-hover:text-emerald-400 group-hover:-translate-x-0.5 transition-all" />
                        <span className="hidden sm:inline-block text-[11px] md:text-xs font-black text-slate-300 group-hover:text-white uppercase tracking-widest whitespace-nowrap">
                            {language === 'ko' ? '선택 수정하기' : 'Edit Selection'}
                        </span>
                        <span className="sm:hidden text-[10px] font-black text-slate-300 group-hover:text-white uppercase tracking-widest whitespace-nowrap">
                            {language === 'ko' ? '수정' : 'Edit'}
                        </span>
                    </motion.button>

                    {/* 공유하기 간편 버튼 */}
                    <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-2 md:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-2xl hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all active:scale-95 group"
                        title={language === 'ko' ? '공유하기' : 'Share'}
                        onClick={handleShare}
                    >
                        <Share2 size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    </motion.button>
                </div>

            </div>

            {/* 하단 세련된 디바이더 라인 */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            {/* 세련된 알림 토스트 (영자 실장 픽 ✨) */}
            <Toast 
                show={toast.show} 
                message={toast.message} 
                onClose={() => setToast({ ...toast, show: false })} 
            />
        </header>
    );
}
