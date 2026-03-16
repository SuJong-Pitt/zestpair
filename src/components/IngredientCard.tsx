"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Ingredient } from "@/types/database";
import { useBasketStore } from "@/store/basketStore";
import { cn } from "@/lib/utils";
import { Check, Clock, HelpCircle, Sparkles, Shield, Heart, Zap, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHasMounted } from "@/hooks/useHasMounted";
import { UI_TRANSLATIONS } from "@/lib/i18n";

interface IngredientCardProps {
    ingredient: Ingredient;
    isFeatured?: boolean;
}

// 속성 아이콘 맵핑
const getAttributeIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("vitamin") || n.includes("비타민") || n.includes("활성")) return <Zap size={10} className="text-yellow-400" />;
    if (n.includes("omega") || n.includes("오메가") || n.includes("지방")) return <Waves size={10} className="text-cyan-400" />;
    if (n.includes("collagen") || n.includes("콜라겐") || n.includes("피부")) return <Heart size={10} className="text-rose-400" />;
    return <Shield size={10} className="text-emerald-400" />;
};

export default function IngredientCard({ ingredient, isFeatured = false }: IngredientCardProps) {
    const hasMounted = useHasMounted();
    const { isSelected, toggleIngredient, language } = useBasketStore();
    const selected = hasMounted ? isSelected(ingredient.id) : false;

    const t = UI_TRANSLATIONS[language];
    const name = language === "ko" ? ingredient.name : ingredient.name_en;
    const shortDesc = language === "ko" ? ingredient.short_description : (ingredient.short_description_en || ingredient.short_description);
    const desc = language === "ko" ? ingredient.description : (ingredient.description_en || ingredient.description);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.button
                    whileHover={{ 
                      scale: 1.04,
                      y: -4,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleIngredient(ingredient)}
                    className={cn(
                        "group relative w-full text-left rounded-[2rem] p-5 transition-all duration-300",
                        "font-sans border-0",
                        selected
                            ? "bg-[#0A1A16] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
                            : isFeatured
                                ? "bg-white border border-emerald-100 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.12)]"
                                : "bg-white border border-slate-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)]"
                    )}
                >
                    {/* --- 배경 디테일 (Silk Texture) --- */}
                    <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/pinstripe.png')]" />

                    {/* 홀로그램 글린트 (Selected) */}
                    {selected && (
                        <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(52,211,153,0.05)_40%,transparent_60%)] bg-[length:200%_100%] animate-hologram" />
                        </div>
                    )}

                    {/* 속성 구슬 (Attribute Orb) */}
                    <div className={cn(
                        "absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 border-white/20 z-20",
                        selected ? "bg-slate-800 shadow-inner" : "bg-slate-50"
                    )}>
                        {getAttributeIcon(ingredient.name)}
                    </div>

                    {/* 인기 배지 - Featured 모드 특화 */}
                    {(ingredient.is_popular || isFeatured) && (
                        <div className="absolute top-0 left-5 -translate-y-2 z-30 group-hover:-translate-y-2.5 transition-transform">
                            <div className={cn(
                                "text-[8px] font-[1000] px-2.5 py-1.5 rounded-b-xl shadow-lg text-white tracking-widest uppercase italic border-x border-b border-white/10",
                                isFeatured 
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 shadow-emerald-500/20" 
                                    : "bg-gradient-to-r from-red-600 to-rose-500 shadow-rose-500/20"
                            )}>
                                {isFeatured ? 'TRENDING' : 'LIMITED'}
                            </div>
                        </div>
                    )}

                    <div
                        className={cn(
                            "relative w-full h-28 md:h-36 rounded-2xl flex items-center justify-center text-4xl md:text-5xl mb-5 transition-all duration-700 overflow-hidden",
                            selected 
                                ? "bg-gradient-to-b from-slate-900/50 to-black/50 border border-white/5" 
                                : isFeatured
                                    ? "bg-gradient-to-br from-emerald-100/20 to-teal-50/10 border border-emerald-100/30"
                                    : "bg-slate-50/50 border border-slate-100/30 group-hover:bg-emerald-50/50"
                        )}
                    >
                        {/* 아이콘 아우라 */}
                        <div className={cn(
                            "absolute inset-0 transition-opacity duration-700",
                            selected ? "opacity-30 bg-emerald-500/10 blur-2xl" : isFeatured ? "opacity-20 bg-emerald-400/5 blur-xl" : "opacity-0"
                        )} />

                        <span className={cn(
                            "relative z-10 transition-all duration-1000 group-hover:scale-110 group-hover:-translate-y-1",
                            selected ? "animate-float drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]" : "drop-shadow-sm"
                        )}>
                            {ingredient.icon_emoji}
                        </span>
                        
                        {/* 프리미엄 광택 (Hover) */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
                        </div>
                    </div>

                    <div className="relative z-10 space-y-1.5 px-1">
                        <div className="flex items-center justify-between">
                            <h3 className={cn(
                                "font-black text-[15px] md:text-[17px] transition-colors tracking-tight line-clamp-1",
                                selected ? "text-emerald-400" : isFeatured ? "text-slate-900" : "text-slate-900"
                            )}>
                                {name}
                            </h3>
                            {selected && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />}
                        </div>

                        <p className={cn(
                            "text-[11px] leading-relaxed font-medium line-clamp-2 min-h-[3em]",
                            selected ? "text-slate-400" : isFeatured ? "text-slate-500" : "text-slate-500"
                        )}>
                            {shortDesc}
                        </p>
                    </div>

                    {/* 하단 패러미터 */}
                    <div className={cn(
                        "mt-3 flex items-center justify-between pt-2 border-t transition-colors",
                        selected ? "border-slate-800" : isFeatured ? "border-emerald-100" : "border-slate-100"
                    )}>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-tighter",
                                selected 
                                    ? "bg-amber-400/10 border-amber-400/30 text-amber-400" 
                                    : isFeatured
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                        : "bg-slate-100 border-slate-200 text-slate-400"
                            )}>
                                <Clock size={9} strokeWidth={3} />
                                {t.dosage[ingredient.dosage_time]}
                            </div>
                        </div>

                        <AnimatePresence>
                            {selected && (
                                <motion.div
                                    initial={{ opacity: 0, x: 5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 5 }}
                                    className="flex items-center gap-1 text-[9px] font-black text-emerald-400"
                                >
                                    <Check size={10} strokeWidth={4} />
                                    {t.common.selected}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {!selected && (
                          isFeatured 
                            ? <Zap size={12} className="text-emerald-400 animate-pulse" /> 
                            : <HelpCircle size={12} className="text-slate-200 group-hover:text-emerald-400 transition-colors" />
                        )}
                    </div>

                    {/* 테두리 오라 효과 */}
                    {selected && (
                        <div className="absolute inset-0 border-2 border-amber-400/50 rounded-[1.5rem] pointer-events-none animate-pulse-slow shadow-[inset_0_0_20px_rgba(251,191,36,0.1)]" />
                    )}
                    {isFeatured && !selected && (
                        <div className="absolute inset-0 border border-emerald-500/10 rounded-[1.5rem] pointer-events-none group-hover:border-emerald-500/30 transition-colors" />
                    )}
                </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] p-4 rounded-2xl bg-slate-900 text-white border-slate-800 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                        <span className="text-lg">{ingredient.icon_emoji}</span>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{t.common.analysisProtocol}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-bold text-slate-300">{desc}</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
