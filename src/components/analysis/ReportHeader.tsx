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
import { encodeShareParams, getKakaoShareDetails } from "@/lib/utils";

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
        const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
        const canonicalBase = isLocal ? window.location.origin : "https://zestpair.com";
        const shareUrl = `${canonicalBase}/analysis?v=${encoded}`;
        const score = analysisResult?.score ?? 0;

        const { imageFileName, title, description } = getKakaoShareDetails(score, language);
        const targetImageUrl = `${window.location.origin}/images/share/${imageFileName}`;

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
            try { await navigator.share(shareData); } catch (err) { }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setToast({
                    show: true,
                    message: language === 'ko' ? "링크가 복사되었습니다!" : "Link copied to clipboard!"
                });
                setTimeout(() => setToast({ show: false, message: "" }), 3000);
            } catch (err) { }
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
                    <div className="relative flex items-center gap-2.5 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                        <BrandLogo size={32} />
                        <div className="hidden sm:block">
                            <BrandName size="text-[18px] md:text-[26px]" />
                        </div>
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
                        className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:bg-white/10 transition-all active:scale-95 group"
                    >
                        <ArrowLeft size={16} className="text-slate-400 group-hover:text-emerald-400 transition-all" />
                        <span className="hidden md:inline-block text-[11px] md:text-xs font-black text-slate-300 group-hover:text-white uppercase tracking-widest ml-2 whitespace-nowrap">
                            {language === 'ko' ? '선택 수정하기' : 'Edit Selection'}
                        </span>
                    </motion.button>

                    {/* 공유하기 액션 (투-트랙) */}
                    <div className="flex items-center gap-1 md:gap-2">
                        {/* 1. 카카오톡 전용 아이콘 */}
                        <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:bg-white/10 transition-all active:scale-95 group"
                            title={language === 'ko' ? '카카오톡 공유' : 'Kakao Share'}
                            onClick={() => {
                                // AnalysisResults와 동일한 로직을 수행하기 위해 
                                // window.handleKakaoShare가 전역에 있으면 좋겠지만, 
                                // 일단 여기서 직접 태웁니다.
                                if (typeof window !== "undefined" && (window as any).Kakao) {
                                    const Kakao = (window as any).Kakao;
                                    try {
                                        if (!Kakao.isInitialized()) {
                                            Kakao.init("27a049c799662857ed882c2639461392");
                                        }

                                        const slugs = selectedIngredients.map(ing => ing.slug);
                                        const encoded = encodeShareParams(slugs);
                                        const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
                                        const canonicalBase = isLocal ? window.location.origin : "https://zestpair.com";
                                        const shareUrl = `${canonicalBase}/analysis?v=${encoded}`;
                                        const score = analysisResult?.score ?? 0;

                                        const { imageFileName, title, description } = getKakaoShareDetails(score, language);
                                        const imageBase = "https://zestpair.com";
                                        const targetImageUrl = `${imageBase}/images/share/${imageFileName}`;

                                        Kakao.Share.sendDefault({
                                            objectType: 'feed',
                                            content: {
                                                title: title,
                                                description: description,
                                                imageUrl: targetImageUrl,
                                                imageWidth: 800,
                                                imageHeight: 800,
                                                link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                                            },
                                            buttons: [{
                                                title: language === 'ko' ? '내 점수 확인하기' : 'Check my score',
                                                link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                                            }],
                                        });
                                    } catch (err) {
                                        console.error("Kakao Share Error:", err);
                                        alert("카카오톡 실행 오류: " + (err as Error).message);
                                    }
                                } else {
                                    alert("카카오톡 모듈이 로드되지 않았습니다. 잠시 후 상단 아이콘이나 다시 시도해 주세요!");
                                }
                            }}
                        >
                            <img src="/icons/kakao.svg" className="w-8 h-8 md:w-8.5 md:h-8.5" alt="Kakao" />
                        </motion.button>

                        {/* 2. 라인(LINE) 전용 아이콘 */}
                        <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18 }}
                            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:bg-white/10 transition-all active:scale-95 group"
                            title={language === 'ko' ? '라인 공유' : 'LINE Share'}
                            onClick={() => {
                                const slugs = selectedIngredients.map(ing => ing.slug);
                                const encoded = encodeShareParams(slugs);
                                const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
                                const canonicalBase = isLocal ? window.location.origin : "https://zestpair.com";
                                const shareUrl = `${canonicalBase}/analysis?v=${encoded}`;
                                const score = analysisResult?.score ?? 0;

                                const { title } = getKakaoShareDetails(score, language);

                                const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
                                window.open(lineUrl, '_blank');
                            }}
                        >
                            <img src="/icons/line.svg" className="w-8 h-8 md:w-8.5 md:h-8.5" alt="LINE" />
                        </motion.button>

                        {/* 3. 일반 공유 (링크 복사) 아이콘 */}
                        <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-2xl hover:bg-white/10 transition-all active:scale-95 group"
                            title={language === 'ko' ? '링크 복사' : 'Copy Link'}
                            onClick={handleShare}
                        >
                            <Share2 size={22} className="text-white/70 group-hover:text-white transition-colors" />
                        </motion.button>
                    </div>
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
