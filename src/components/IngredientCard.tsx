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

interface IngredientCardProps {
    ingredient: Ingredient;
}

const dosageTimeLabels: Record<Ingredient["dosage_time"], string> = {
    before_meal: "식전",
    after_meal: "식후",
    any_time: "상시",
    morning: "아침",
    evening: "저녁",
};

// 속성 아이콘 맵핑
const getAttributeIcon = (name: string) => {
    if (name.includes("비타민") || name.includes("활성")) return <Zap size={10} className="text-yellow-400" />;
    if (name.includes("오메가") || name.includes("지방")) return <Waves size={10} className="text-cyan-400" />;
    if (name.includes("콜라겐") || name.includes("피부")) return <Heart size={10} className="text-rose-400" />;
    return <Shield size={10} className="text-emerald-400" />;
};

export default function IngredientCard({ ingredient }: IngredientCardProps) {
    const hasMounted = useHasMounted();
    const { isSelected, toggleIngredient } = useBasketStore();
    const selected = hasMounted ? isSelected(ingredient.id) : false;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.button
                    whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleIngredient(ingredient)}
                    className={cn(
                        "group relative w-full text-left rounded-[1.5rem] p-5 transition-all duration-500",
                        "font-sans border-2 perspective-1000", // overflow-hidden 제거
                        selected
                            ? "border-amber-400 bg-slate-900 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                            : "border-slate-100 bg-white hover:border-emerald-300 shadow-sm hover:shadow-xl"
                    )}
                >
                    {/* --- 유희왕 카드 스타일 배경 효과 --- */}
                    {selected && (
                        <>
                            {/* 홀로그램 글린트 (모서리 곡률을 위해 내부 레이어에 배치) */}
                            <div className="absolute inset-0 rounded-[1.4rem] overflow-hidden pointer-events-none">
                                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.1)_40%,transparent_60%)] bg-[length:200%_100%] animate-hologram" />
                            </div>
                            {/* 하이테크 레이저 라인 */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none rounded-[1.4rem] overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                            </div>
                        </>
                    )}

                    {/* 속성 구슬 (Attribute Orb) */}
                    <div className={cn(
                        "absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 border-white/20 z-20",
                        selected ? "bg-slate-800 shadow-inner" : "bg-slate-50"
                    )}>
                        {getAttributeIcon(ingredient.name)}
                    </div>

                    {/* 인기 배지 - 카드 태그 스타일 (z-index를 높여서 위로 부상) */}
                    {ingredient.is_popular && (
                        <div className="absolute top-0 left-6 -translate-y-2 z-30 group-hover:-translate-y-3 transition-transform">
                            <div className="bg-gradient-to-r from-red-600 to-rose-500 text-[9px] font-[1000] px-3 py-1.5 rounded-b-lg shadow-xl text-white tracking-widest uppercase italic border-x border-b border-white/20">
                                LIMITED
                            </div>
                        </div>
                    )}

                    {/* 메인 비주얼 박스 (몬스터 이미지 영역 느낌) */}
                    <div
                        className={cn(
                            "relative w-full aspect-square rounded-xl flex items-center justify-center text-4xl mb-5 transition-all duration-500 overflow-hidden",
                            selected 
                                ? "bg-gradient-to-b from-slate-800 to-slate-950 border border-white/10 shadow-inner" 
                                : "bg-slate-50 border border-slate-100 group-hover:bg-emerald-50"
                        )}
                    >
                        {/* 선택 시 파티클 효과 */}
                        {selected && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.15),transparent_70%)]"
                            />
                        )}
                        <span className={cn(
                            "relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-125",
                            selected ? "animate-float" : ""
                        )}>
                            {ingredient.icon_emoji}
                        </span>
                    </div>

                    {/* 정보 영역 */}
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                            <h3 className={cn(
                                "font-black text-lg transition-colors tracking-tighter uppercase italic",
                                selected ? "text-amber-400" : "text-slate-900"
                            )}>
                                {ingredient.name}
                            </h3>
                            {selected && <Sparkles size={14} className="text-amber-400 animate-pulse" />}
                        </div>

                        <p className={cn(
                            "text-[10px] leading-relaxed font-bold line-clamp-2 min-h-[30px]",
                            selected ? "text-slate-400" : "text-slate-500"
                        )}>
                            {ingredient.short_description}
                        </p>
                    </div>

                    {/* 하단 패러미터 (ATK/DEF 느낌) */}
                    <div className={cn(
                        "mt-4 flex items-center justify-between pt-3 border-t transition-colors",
                        selected ? "border-slate-800" : "border-slate-100"
                    )}>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-tighter",
                                selected 
                                    ? "bg-amber-400/10 border-amber-400/30 text-amber-400" 
                                    : "bg-slate-100 border-slate-200 text-slate-500"
                            )}>
                                <Clock size={10} strokeWidth={3} />
                                {dosageTimeLabels[ingredient.dosage_time]}
                            </div>
                        </div>

                        {/* 선택됨 표시 - 레어리티 인디케이터 느낌 */}
                        <AnimatePresence>
                            {selected && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center gap-1 text-[10px] font-black text-emerald-400"
                                >
                                    <Check size={12} strokeWidth={4} />
                                    선택됨
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {!selected && <HelpCircle size={14} className="text-slate-200 group-hover:text-emerald-400 transition-colors" />}
                    </div>

                    {/* 테두리 오라 효과 (카드 희귀도 효과) */}
                    {selected && (
                        <div className="absolute inset-0 border-2 border-amber-400/50 rounded-[1.5rem] pointer-events-none animate-pulse-slow shadow-[inset_0_0_20px_rgba(251,191,36,0.1)]" />
                    )}
                </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] p-4 rounded-2xl bg-slate-900 text-white border-slate-800 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                        <span className="text-lg">{ingredient.icon_emoji}</span>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">분석 프로토콜</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-bold text-slate-300">{ingredient.description}</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
