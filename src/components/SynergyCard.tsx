"use client";

import { useState } from "react";
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
    Download
} from "lucide-react";
import type { InteractionResult } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export default function SynergyCard({ 
    result, 
    index 
}: { 
    result: InteractionResult; 
    index: number;
}) {
    // 성분 상호작용 정보가 없으면 표시안함
    if (!result.interaction) return null;
    
    const [isFlipped, setIsFlipped] = useState(false);
    const config = cardTypeConfig[result.interaction.type];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
                duration: 0.5,
                delay: index * 0.05
            }}
            inherit={false}
            className="relative w-full max-w-[340px] aspect-[2/3] mx-auto cursor-pointer"
            style={{ perspective: "1200px" }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* --- 카드 앞면 --- */}
                <div 
                    className={cn(
                        "absolute inset-0 w-full h-full rounded-[2.5rem] p-1.5 shadow-2xl overflow-hidden",
                        "bg-gradient-to-br", config.theme
                    )}
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div className="w-full h-full rounded-[2.2rem] bg-[#0F172A] overflow-hidden relative border border-white/20">
                        {/* 카드 배경 텍스처 */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_70%)]" />

                        <div className="relative z-10 p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase mb-1">MIXY TRADING CARD</span>
                                    <Badge variant="outline" className="border-white/20 text-white font-black px-3 py-0.5 rounded-full text-[9px] bg-white/5 backdrop-blur-md">
                                        #{index + 1} MIX_ID
                                    </Badge>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                                    <Sparkles size={16} className="text-white animate-pulse" />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center relative mb-4">
                                {/* 후광 오라 */}
                                <div className={cn(
                                    "absolute w-40 h-40 blur-[80px] rounded-full opacity-30 animate-pulse",
                                    "bg-gradient-to-tr", config.theme
                                )} />
                                
                                <div className="relative flex items-center justify-center gap-4 mb-5">
                                    <div className="text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{result.pair[0].icon_emoji}</div>
                                    <Zap className="text-yellow-400 animate-bounce" size={32} strokeWidth={3} />
                                    <div className="text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{result.pair[1].icon_emoji}</div>
                                </div>

                                <div className="flex flex-col items-center space-y-3">
                                    <h4 className="text-2xl md:text-3xl font-[1000] text-white tracking-tighter leading-tight drop-shadow-lg text-center px-2">
                                        {result.interaction.title}
                                    </h4>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full font-black text-[10px] tracking-[0.2em] text-white border border-white/20 uppercase backdrop-blur-xl shadow-lg",
                                        config.theme.split(' ')[0].replace('from-', 'bg-')
                                    )}>
                                        {config.label}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col items-center gap-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                    <span className="text-[9px] font-black tracking-widest uppercase">클릭하여 상세 정보 보기</span>
                                    <RefreshCcw size={12} className="animate-spin-slow" />
                                </div>
                                <div className="w-full flex justify-between items-center text-[9px] font-black text-white/20 tracking-[0.2em] uppercase">
                                    <span>{result.pair[0].name}</span>
                                    <span>VS</span>
                                    <span>{result.pair[1].name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 카드 뒷면 (상세 정보) --- */}
                <div 
                    className={cn(
                        "absolute inset-0 w-full h-full rounded-[2.5rem] p-1.5 shadow-2xl overflow-hidden",
                        "bg-gradient-to-br", config.theme
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

                            {/* 스크롤 영역: min-h-0가 flex-1 장치에서 스크롤을 활성화하는 핵심입니다. */}
                            <div className="flex-1 min-h-0 overflow-hidden relative group/scroll">
                                <ScrollArea className="h-full pr-3">
                                    <div className="space-y-4 pt-1 pb-14"> {/* 하단 패딩을 대폭 늘려 페이드와 겹치지 않게 함 */}
                                        <div className="space-y-2 text-left">
                                            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-slate-100 rounded-md">
                                                <span className="text-slate-600 font-black text-[9px] uppercase">궁합 이유</span>
                                            </div>
                                            <p className="text-[14px] md:text-[15px] text-slate-700 font-bold leading-snug tracking-tight break-words">
                                                {result.interaction.reason}
                                            </p>
                                        </div>

                                        {result.interaction.recommendation && (
                                            <div className="space-y-2 pt-3 border-t border-slate-100 text-left">
                                                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-50 rounded-md">
                                                    <span className="text-emerald-600 font-black text-[9px] uppercase">전문가 권고</span>
                                                </div>
                                                <p className="text-[13px] text-slate-600 font-semibold leading-normal tracking-tight break-words">
                                                    {result.interaction.recommendation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                                {/* 하단 페이드 효과: 스크롤 영역 하단에 더 많은 내용이 있음을 시각적으로 보호 */}
                                <div className="absolute bottom-0 left-0 right-2 w-full h-10 bg-gradient-to-t from-white/95 via-white/40 to-transparent pointer-events-none z-10" />
                            </div>

                            <div className="mt-2 flex flex-col items-center gap-2 flex-shrink-0 border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100/50">
                                    <span className="text-[8px] font-black tracking-widest uppercase">클릭하여 돌아가기</span>
                                    <RefreshCcw size={10} className="rotate-180" />
                                </div>
                                <div className="w-full flex gap-1.5">
                                    <div className="flex-1 px-3 py-2 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400">SHARE</span>
                                        <Share2 size={12} className="text-slate-500" />
                                    </div>
                                    <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                                        <Download size={12} />
                                    </div>
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
        </motion.div>
    );
}
