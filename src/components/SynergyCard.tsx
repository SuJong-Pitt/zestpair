"use client";

import { useState, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
    Sparkles, 
    Zap, 
    TrendingUp, 
    AlertTriangle, 
    XCircle, 
    Share2, 
    Download,
    Loader2,
    ChevronDown
} from "lucide-react";
import type { InteractionResult } from "@/types/database";
import { toPng } from "html-to-image";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";

const cardTypeConfig = {
    SYNERGY: {
        bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: TrendingUp,
        iconColor: "text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        gradient: "from-emerald-500/10 to-transparent",
        dot: "bg-emerald-400"
    },
    CAUTION: {
        bg: "bg-amber-500/5 hover:bg-amber-500/10",
        border: "border-amber-500/20",
        icon: AlertTriangle,
        iconColor: "text-amber-400",
        badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        gradient: "from-amber-500/10 to-transparent",
        dot: "bg-amber-400"
    },
    CONFLICT: {
        bg: "bg-rose-500/5 hover:bg-rose-500/10",
        border: "border-rose-500/20",
        icon: XCircle,
        iconColor: "text-rose-400",
        badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
        gradient: "from-rose-500/10 to-transparent",
        dot: "bg-rose-400"
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
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    
    const config = cardTypeConfig[result.interaction.type];
    const Icon = config.icon;

    const displayTitle = language === "ko" ? result.interaction.title : (result.interaction.title_en || result.interaction.title);
    const displayReason = language === "ko" ? result.interaction.reason : (result.interaction.reason_en || result.interaction.reason);
    const displayRec = language === "ko" ? result.interaction.recommendation : (result.interaction.recommendation_en || result.interaction.recommendation);
    const nameA = language === "ko" ? result.pair[0].name : result.pair[0].name_en;
    const nameB = language === "ko" ? result.pair[1].name : result.pair[1].name_en;
    
    const typeString = result.interaction.type === 'SYNERGY' ? t.results.typeSynergy : result.interaction.type === 'CAUTION' ? t.results.typeCaution : t.results.typeConflict;

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
        if (!reportRef.current) return;
        setIsDownloading(true);
        try {
            const dataUrl = await toPng(reportRef.current, {
                cacheBust: true,
                backgroundColor: '#0f172a',
                pixelRatio: 2,
            });
            const link = document.createElement('a');
            link.download = `ZestPair-Analysis-${result.interaction?.title || 'Result'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Error downloading image:", err);
            alert(t.common.errorDownload);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={cn(
                "w-full rounded-2xl border backdrop-blur-md overflow-hidden transition-all duration-300",
                config.bg, 
                config.border,
                isExpanded ? "shadow-lg" : "shadow-sm"
            )}
        >
            <div 
                ref={reportRef}
                className="w-full relative flex flex-col"
            >
                {/* --- Collapsed Header View --- */}
                <div 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 gap-3.5 sm:gap-4 cursor-pointer relative z-10 select-none overflow-hidden"
                >
                    {/* Background Subtle Gradient - Desktop orientation */}
                    <div className={cn("absolute inset-y-0 left-0 w-24 bg-gradient-to-r pointer-events-none opacity-30", config.gradient)} />

                    {/* Left/Top Row: Icons and mobile Badge */}
                    <div className="flex items-center justify-between w-full sm:w-auto shrink-0 relative z-10">
                        {/* Ingredient Icons */}
                        <div className="flex items-center shrink-0">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900 flex items-center justify-center text-lg sm:text-2xl border border-white/10 shadow-sm z-10">
                                {result.pair[0].icon_emoji}
                            </div>
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center -mx-1.5 sm:-mx-2 z-20 border-2 border-slate-900 text-slate-400">
                                <Zap size={8} className="sm:size-[10px]" />
                            </div>
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900 flex items-center justify-center text-lg sm:text-2xl border border-white/10 shadow-sm z-10">
                                {result.pair[1].icon_emoji}
                            </div>
                        </div>

                        {/* Mobile-only Badge Area */}
                        <div className="sm:hidden flex items-center gap-2">
                            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-tight", config.badge)}>
                                <span className={cn("w-1 h-1 rounded-full animate-pulse", config.dot)} />
                                <span>{typeString}</span>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-300", isExpanded && "rotate-180")} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Middle: Content Block (Title + Names) */}
                    <div className="flex-1 min-w-0 py-1 mt-2.5 sm:mt-0 px-0.5">
                        <div className="flex items-start gap-1.5 mb-1 sm:mb-1.5">
                            <Icon size={14} className={cn("shrink-0 mt-0.5", config.iconColor)} />
                            <h4 className="font-extrabold text-white text-[15px] sm:text-[15px] md:text-base leading-snug break-keep">
                                {displayTitle}
                            </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="truncate">{nameA}</span>
                            <span className="opacity-30 text-[8px] shrink-0 font-black">VS</span>
                            <span className="truncate">{nameB}</span>
                        </div>
                    </div>

                    {/* Right-only Badge Area (Desktop) */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest", config.badge)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dot)} />
                            <span>{typeString}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                            <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-300", isExpanded && "rotate-180")} />
                        </div>
                    </div>
                </div>

                {/* --- Expanded Detail View --- */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 pb-5 pt-2 border-t border-white/5 ml-0 sm:ml-16 relative z-10">
                                <div className="space-y-6">
                                    {/* Reason Block */}
                                    <div className="space-y-2 text-left">
                                        <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
                                            <span className="text-slate-400 font-black text-[9px] uppercase tracking-widest">{language === 'ko' ? '분석 내용' : 'Analysis Detail'}</span>
                                        </div>
                                        <p className="text-[13px] md:text-[14px] text-slate-300 font-medium leading-relaxed tracking-tight break-words">
                                            {displayReason}
                                        </p>
                                    </div>

                                    {/* Actionable Advice / Pori's Solution */}
                                    {displayRec && (
                                        <div className={cn(
                                            "relative text-left mt-4 p-4 md:p-5 rounded-2xl border shadow-inner",
                                            (result.interaction.type === "CAUTION" || result.interaction.type === "CONFLICT") 
                                                ? "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20" 
                                                : "bg-emerald-500/5 border-emerald-500/20"
                                        )}>
                                            {(result.interaction.type === "CAUTION" || result.interaction.type === "CONFLICT") && (
                                                <div className="absolute -top-6 -right-2 w-12 h-12 md:w-14 md:h-14 z-10 drop-shadow-xl select-none hidden sm:block">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src="/hero-pori.png" alt="Pori" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                            
                                            <div className="relative z-20">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 border border-white/10 rounded-md mb-3">
                                                    <Sparkles size={10} className={(result.interaction.type === "CAUTION" || result.interaction.type === "CONFLICT") ? "text-amber-400" : "text-emerald-400"} />
                                                    <span className={cn(
                                                        "font-black text-[9px] md:text-[10px] uppercase tracking-widest",
                                                        (result.interaction.type === "CAUTION" || result.interaction.type === "CONFLICT") ? "text-amber-300" : "text-emerald-300"
                                                    )}>
                                                        {language === 'ko' ? 'Pori의 해결책' : "Pori's Solution"}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] md:text-[14px] text-white/90 font-medium leading-relaxed tracking-tight break-words">
                                                    {language === 'ko' && (result.interaction.type === "CAUTION" || result.interaction.type === "CONFLICT") && (
                                                        <span className="text-amber-400 font-[1000] mr-1.5 block mb-1">괜찮아요! 🙌</span>
                                                    )}
                                                    {displayRec}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons (Share & Download) */}
                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <button 
                                            onClick={handleShare}
                                            disabled={isSharing}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center gap-2 border border-white/10 transition-colors active:scale-95"
                                        >
                                            {isSharing ? <Loader2 size={12} className="animate-spin" /> : <Share2 size={12} />}
                                            <span className="text-[9px] font-black tracking-widest uppercase">{language === 'ko' ? '공유' : 'Share'}</span>
                                        </button>
                                        <button 
                                            onClick={handleDownload}
                                            disabled={isDownloading}
                                            className={cn(
                                                "px-4 py-2 text-slate-900 rounded-xl flex items-center gap-2 transition-transform active:scale-95",
                                                config.badge.replace('text-', 'bg-').split(' ')[0], // Base color
                                                "bg-opacity-100 font-bold"
                                            )}
                                            style={{ backgroundColor: result.interaction.type === 'SYNERGY' ? '#34d399' : result.interaction.type === 'CAUTION' ? '#fbbf24' : '#fb7185' }}
                                        >
                                            {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                            <span className="text-[9px] font-black tracking-widest uppercase">{language === 'ko' ? '저장' : 'Save'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
});

export default SynergyCard;
