"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
    Sparkles, 
    Zap, 
    ShieldCheck, 
    TrendingUp, 
    AlertTriangle, 
    XCircle, 
    Share2, 
    RefreshCcw,
    Download,
    Loader2
} from "lucide-react";
import type { InteractionResult } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";

const cardTypeConfig = {
    SYNERGY: {
        theme: "from-emerald-600 via-teal-500 to-emerald-400",
        label: "S-RANK SYNERGY",
        icon: TrendingUp,
        subLabel: "POWER BOOST",
        footer: "PERFECT MATCH FOUND",
        intensity: "high"
    },
    CAUTION: {
        theme: "from-amber-500 via-orange-400 to-amber-300",
        label: "A-RANK CAUTION",
        icon: AlertTriangle,
        subLabel: "CAREFUL MIX",
        footer: "TIMING MATTERS",
        intensity: "medium"
    },
    CONFLICT: {
        theme: "from-red-600 via-rose-500 to-red-400",
        label: "X-RANK CONFLICT",
        icon: XCircle,
        subLabel: "AVOID MIXING",
        footer: "HIGH INTERFERENCE",
        intensity: "critical"
    }
} as const;

const SynergyCard = memo(function SynergyCard({ 
    result, 
    index 
}: { 
    result: InteractionResult; 
    index: number;
}) {
    const { language } = useBasketStore();
    const t = UI_TRANSLATIONS[language];
    
    if (!result.interaction) return null;
    
    const [isFlipped, setIsFlipped] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isFlipped) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePos({ x, y });
    };
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const frontCardRef = useRef<HTMLDivElement>(null);
    const backCardRef = useRef<HTMLDivElement>(null);
    const combinedRef = useRef<HTMLDivElement>(null);
    
    const config = cardTypeConfig[result.interaction.type];
    const Icon = config.icon;

    const displayTitle = language === "ko" ? result.interaction.title : (result.interaction.title_en || result.interaction.title);
    const displayReason = language === "ko" ? result.interaction.reason : (result.interaction.reason_en || result.interaction.reason);
    const displayRec = language === "ko" ? result.interaction.recommendation : (result.interaction.recommendation_en || result.interaction.recommendation);
    const nameA = language === "ko" ? result.pair[0].name : result.pair[0].name_en;
    const nameB = language === "ko" ? result.pair[1].name : result.pair[1].name_en;

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSharing(true);
        const shareData = {
            title: `ZestPair - ${displayTitle}`,
            text: `${nameA} & ${nameB} ${language === 'ko' ? '궁합 분석 결과' : 'Interaction Analysis'}: ${displayTitle}\n${displayReason}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n\n결과 보기: ${shareData.url}`);
                alert(t.common.shareText);
            }
        } catch (err) {
            console.error("Error sharing:", err);
        } finally {
            setTimeout(() => setIsSharing(false), 1000);
        }
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // 통합 이미지 캡처를 위해 숨겨진 combinedRef 사용
        const targetElement = combinedRef.current;
        if (!targetElement) return;
        
        setIsDownloading(true);
        try {
            const dataUrl = await toPng(targetElement, {
                cacheBust: true,
                backgroundColor: '#0f172a', // 프리미엄 다크 배경
                pixelRatio: 2, // 고해상도 출력
            });
            
            const link = document.createElement('a');
            link.download = `ZestPair-Full-Report-${result.interaction?.title || 'Result'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Error downloading card:", err);
            alert(t.common.errorDownload);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
                duration: 0.5,
                delay: index * 0.05
            }}
            inherit={false}
            className="relative w-full max-w-[280px] xs:max-w-[320px] md:max-w-[340px] aspect-[2/3] mx-auto cursor-pointer"
            style={{ perspective: "1200px" }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                ref={cardRef}
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setMousePos({ x: 0.5, y: 0.5 })}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* --- 카드 앞면 --- */}
                <div 
                    ref={frontCardRef}
                    className={cn(
                        "absolute inset-0 w-full h-full rounded-[2.5rem] p-1.5 shadow-2xl overflow-hidden transition-all duration-300 pointer-events-none",
                        "bg-gradient-to-br", config.theme,
                        isFlipped ? "opacity-0" : "opacity-100 z-10 pointer-events-auto"
                    )}
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div className="w-full h-full rounded-[2.2rem] bg-[#0F172A] overflow-hidden relative border border-white/20">
                        {/* 카드 배경 텍스처 */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_70%)]" />
                        
                        {/* 홀로그램 포일 효과 (Foil Shine) */}
                        <div 
                            className="absolute inset-0 opacity-[0.15] mix-blend-color-dodge pointer-events-none transition-opacity duration-500 group-hover:opacity-40"
                            style={{
                                background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.8) 0%, transparent 50%), 
                                             linear-gradient(${mousePos.x * 360}deg, rgba(255,0,0,0.1) 0%, rgba(0,255,0,0.1) 50%, rgba(0,0,255,0.1) 100%)`
                            }}
                        />

                        <div className="relative z-10 p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white/50 tracking-[0.4em] uppercase mb-1">MIXY PREMIUM FOIL</span>
                                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-black px-3 py-0.5 rounded-full text-[9px] bg-emerald-500/5 backdrop-blur-md">
                                        LIMITED EDITION #{index + 1}
                                    </Badge>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                                    <Sparkles size={16} className="text-white animate-pulse" />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center relative mb-4">
                                {/* 후광 오라 */}
                                <div className={cn(
                                    "absolute w-40 h-40 blur-[90px] rounded-full opacity-40 animate-pulse",
                                    "bg-gradient-to-tr", config.theme
                                )} />
                                
                                <div className="relative flex items-center justify-center gap-6 mb-5">
                                    <motion.div 
                                        animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">{result.pair[0].icon_emoji}</div>
                                        <span className="text-[10px] font-black text-white/60 tracking-tighter uppercase">{nameA}</span>
                                    </motion.div>
                                    <Zap className="text-yellow-400 animate-bounce mb-6" size={28} strokeWidth={3} />
                                    <motion.div 
                                        animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">{result.pair[1].icon_emoji}</div>
                                        <span className="text-[10px] font-black text-white/60 tracking-tighter uppercase">{nameB}</span>
                                    </motion.div>
                                </div>

                                <div className="flex flex-col items-center space-y-3">
                                    <h4 className="text-2xl md:text-3xl font-[1000] text-white tracking-tighter leading-tight drop-shadow-lg text-center px-2">
                                        {displayTitle}
                                    </h4>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full font-black text-[10px] tracking-[0.2em] text-white border border-white/20 uppercase backdrop-blur-xl shadow-lg",
                                        config.theme.split(' ')[0].replace('from-', 'bg-')
                                    )}>
                                        {result.interaction.type === 'SYNERGY' ? t.results.typeSynergy : result.interaction.type === 'CAUTION' ? t.results.typeCaution : t.results.typeConflict}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col items-center gap-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                    <span className="text-[9px] font-black tracking-widest uppercase">{language === 'ko' ? '클릭하여 상세 정보 보기' : 'Click to see details'}</span>
                                    <RefreshCcw size={12} className="animate-spin-slow" />
                                </div>
                                <div className="w-full flex justify-between items-center text-[9px] font-black text-white/20 tracking-[0.2em] uppercase">
                                    <span>{nameA}</span>
                                    <span>VS</span>
                                    <span>{nameB}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 카드 뒷면 (상세 정보) --- */}
                <div 
                    ref={backCardRef}
                    className={cn(
                        "absolute inset-0 w-full h-full rounded-[2.5rem] p-1.5 shadow-2xl overflow-hidden transition-all duration-300 pointer-events-none",
                        "bg-gradient-to-br", config.theme,
                        isFlipped ? "opacity-100 z-20 pointer-events-auto" : "opacity-0"
                    )}
                    style={{ 
                        WebkitBackfaceVisibility: "hidden",
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                    }}
                >
                    <div className="w-full h-full rounded-[2.2rem] bg-slate-50 border border-white/20 relative overflow-hidden">
                        {/* 뒷면 내용 */}
                        <div className="p-5 flex flex-col h-full bg-white/95 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">Detailed Analysis</span>
                                    <span className="text-[11px] font-black text-slate-900 tracking-tighter">PROTOCOL-X-{index + 1}</span>
                                </div>
                                <div className={cn(
                                    "p-2 rounded-xl text-white shadow-lg",
                                    config.theme.split(' ')[0].replace('from-', 'bg-')
                                )}>
                                    <Icon size={16} />
                                </div>
                            </div>

                            {/* 스크롤 영역: 클릭 이벤트 전파를 중단하여 스크롤 시 카드가 뒤집히지 않도록 함 */}
                            <div className="flex-1 min-h-0 overflow-hidden relative group/scroll" 
                                 onClick={(e) => e.stopPropagation()}
                                 style={{ touchAction: "pan-y" }}>
                                <ScrollArea className="h-full pr-3">
                                    <div className="space-y-5 pt-2 pb-10"> {/* 상하단 여백 최적화 */}
                                        <div className="space-y-2 text-left">
                                            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-slate-100 rounded-md">
                                                <span className="text-slate-600 font-black text-[9px] uppercase">{language === 'ko' ? '궁합 이유' : 'Interaction Logic'}</span>
                                            </div>
                                            <p className="text-[14px] md:text-[15px] text-slate-700 font-bold leading-snug tracking-tight break-words">
                                                {displayReason}
                                            </p>
                                        </div>

                                        {displayRec && (
                                            <div className="space-y-2 pt-3 border-t border-slate-100 text-left">
                                                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-50 rounded-md">
                                                    <span className="text-emerald-600 font-black text-[9px] uppercase">{t.common.expertProtocol}</span>
                                                </div>
                                                <p className="text-[13px] text-slate-600 font-semibold leading-normal tracking-tight break-words">
                                                    {displayRec}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                                {/* 하단 페이드 효과: 스크롤 영역 하단에 더 많은 내용이 있음을 시각적으로 보호 */}
                                <div className="absolute bottom-0 left-0 right-2 w-full h-10 bg-gradient-to-t from-white/95 via-white/40 to-transparent pointer-events-none z-10" />
                            </div>

                            <div className="mt-2 flex flex-col items-center gap-2 flex-shrink-0 border-t border-slate-100 pt-3" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    onClick={() => setIsFlipped(false)}
                                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-full border border-slate-100/50 transition-colors"
                                >
                                    <span className="text-[8px] font-black tracking-widest uppercase">{language === 'ko' ? '클릭하여 돌아가기' : 'Click to go back'}</span>
                                    <RefreshCcw size={10} className="rotate-180" />
                                </button>
                                <div className="w-full flex gap-1.5">
                                    <button 
                                        onClick={handleShare}
                                        disabled={isSharing}
                                        className={cn(
                                            "flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between border border-slate-100 cursor-pointer transition-all active:scale-95",
                                            isSharing && "opacity-50"
                                        )}
                                    >
                                        <span className="text-[9px] font-black text-slate-400">{isSharing ? "SHARING..." : "SHARE"}</span>
                                        <Share2 size={12} className={cn("text-slate-500", isSharing && "animate-bounce")} />
                                    </button>
                                    <button 
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="w-9 h-9 bg-slate-900 hover:bg-black text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                                    >
                                        {isDownloading ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <Download size={12} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            {/* 하단 배경 랭크 텍스트 */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none -z-10">
                <span className="text-[70px] font-black text-indigo-500/5 select-none tracking-tighter italic uppercase">
                    {config.intensity}
                </span>
            </div>

            {/* --- 이미지 저장 전용 숨겨진 레이아웃 (앞/뒤 동시 렌더링) --- */}
            <div className="fixed -left-[9999px] top-0">
                <div 
                    ref={combinedRef}
                    className="p-10 flex gap-8 bg-[#0F172A] items-center"
                    style={{ width: '800px' }}
                >
                    {/* 앞면 복제본 */}
                    <div className="w-[340px] aspect-[2/3] shrink-0">
                        <div className={cn("w-full h-full rounded-[2.5rem] p-1.5 bg-gradient-to-br", config.theme)}>
                            <div className="w-full h-full rounded-[2.2rem] bg-[#0F172A] overflow-hidden relative border border-white/20">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                <div className="p-6 flex flex-col h-full relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">ZestPair TRADING CARD</span>
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                                            <Sparkles size={14} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center mb-8">
                                        <div className="flex items-center justify-center gap-6 mb-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="text-6xl">{result.pair[0].icon_emoji}</div>
                                                <span className="text-[10px] font-black text-white/40 tracking-tighter">{nameA}</span>
                                            </div>
                                            <Zap className="text-yellow-400 mb-6" size={24} />
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="text-6xl">{result.pair[1].icon_emoji}</div>
                                                <span className="text-[10px] font-black text-white/40 tracking-tighter">{nameB}</span>
                                            </div>
                                        </div>
                                        <h4 className="text-2xl font-[1000] text-white tracking-tighter text-center leading-tight mb-4">
                                            {displayTitle}
                                        </h4>
                                        <div className={cn("px-4 py-1.5 rounded-full font-black text-[10px] tracking-[0.2em] text-white border border-white/20", config.theme.split(' ')[0].replace('from-', 'bg-'))}>
                                            {result.interaction.type === 'SYNERGY' ? t.results.typeSynergy : result.interaction.type === 'CAUTION' ? t.results.typeCaution : t.results.typeConflict}
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-white/10 flex justify-between text-[8px] font-black text-white/30 tracking-widest">
                                        <span>{nameA}</span>
                                        <span>VS</span>
                                        <span>{nameB}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 뒷면 복제본 */}
                    <div className="w-[340px] aspect-[2/3] shrink-0 text-left">
                        <div className={cn("w-full h-full rounded-[2.5rem] p-1.5 bg-gradient-to-br", config.theme)}>
                            <div className="w-full h-full rounded-[2.2rem] bg-white overflow-hidden relative border border-white/20 p-6 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 tracking-[0.2em] uppercase">ANALYSIS REPORT</span>
                                        <span className="text-[10px] font-black text-slate-900">PROTOCOL-X-{index + 1}</span>
                                    </div>
                                    <div className={cn("p-2 rounded-xl text-white", config.theme.split(' ')[0].replace('from-', 'bg-'))}>
                                        <Icon size={14} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-500 mb-2 uppercase tracking-tighter">{language === 'ko' ? '궁합 이유' : 'Interaction Logic'}</span>
                                        <p className="text-[13px] text-slate-800 font-bold leading-snug break-words">
                                            {displayReason}
                                        </p>
                                    </div>
                                    {displayRec && (
                                        <div>
                                            <span className="inline-block px-2 py-0.5 bg-emerald-50 rounded text-[8px] font-black text-emerald-600 mb-2 uppercase tracking-tighter">{t.common.expertProtocol}</span>
                                            <p className="text-[12px] text-slate-600 font-semibold leading-relaxed break-words">
                                                {displayRec}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto pt-6 flex justify-center opacity-30">
                                    <span className="text-[9px] font-black text-slate-400 tracking-[0.5em] uppercase">ZestPair AI SYSTEM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default SynergyCard;
