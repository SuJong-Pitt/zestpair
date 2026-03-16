"use client";

import { useBasketStore, MAX_BASKET_SIZE } from "@/store/basketStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlaskConical, X, Sparkles, ShoppingBasket, ChevronUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UI_TRANSLATIONS } from "@/lib/i18n";

interface FloatingBasketBarProps {
    onAnalyze: () => void;
}

export default function FloatingBasketBar({ onAnalyze }: FloatingBasketBarProps) {
    const { selectedIngredients, removeIngredient, clearBasket, isAnalyzing, language } = useBasketStore();
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const t = UI_TRANSLATIONS[language];
    const count = selectedIngredients.length;

    useEffect(() => {
        setIsVisible(count > 0);
        if (count === 0) setIsExpanded(false);
    }, [count]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
                >
                    {/* 배경 블러 오버레이 */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[-1] pointer-events-auto"
                                onClick={() => setIsExpanded(false)}
                            />
                        )}
                    </AnimatePresence>

                    <div className="mx-auto max-w-2xl px-4 pb-6 pointer-events-auto">
                        <motion.div
                            layout
                            className={cn(
                                "relative rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20",
                                "bg-[#0F172A]/80 backdrop-blur-2xl",
                                "transition-all duration-500"
                            )}
                        >
                            {/* 프리미엄 유체 배경 효과 - 히어로와 동일한 무드 */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15)_0%,transparent:50%)] animate-pulse-slow" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-teal-500/10" />
                            </div>

                            {/* 확장된 영양제 목록 (목록 보기 모드) */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-6 pt-8 pb-4 border-b border-white/10"
                                    >
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <span className="text-[10px] font-black text-white/60 tracking-widest uppercase italic">{t.basket.selectedList}</span>
                                            <button 
                                                onClick={clearBasket}
                                                className="flex items-center gap-1.5 text-[10px] font-black text-rose-200/80 hover:text-rose-100 transition-colors bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30"
                                            >
                                                <Trash2 size={10} />
                                                {t.basket.clearAll}
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2.5 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                                            {selectedIngredients.map((ingredient) => (
                                                <motion.div
                                                    layout
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    key={ingredient.id}
                                                    className="flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-2xl px-4 py-2.5 text-white/90 text-[13px] font-black border border-white/10 shadow-lg group hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="text-xl drop-shadow-md group-hover:scale-110 transition-transform">{ingredient.icon_emoji}</span>
                                                    <span className="tracking-tight">{language === 'ko' ? ingredient.name : ingredient.name_en}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeIngredient(ingredient.id);
                                                        }}
                                                        className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-rose-500/80 transition-all text-white/30 hover:text-white"
                                                    >
                                                        <X size={10} strokeWidth={4} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 메인 컨트롤 바 */}
                            <div className="flex items-center gap-2 md:gap-4 p-2.5 md:p-4">
                                {/* 바구니 요약 정보 */}
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="flex items-center gap-2 md:gap-4 flex-1 text-white text-left group/btn min-w-0"
                                >
                                    <div className="relative shrink-0 scale-90 md:scale-100">
                                        <motion.div 
                                            whileHover={{ rotate: 15 }}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner"
                                        >
                                            <ShoppingBasket size={20} className="text-white drop-shadow-md" />
                                        </motion.div>
                                        <AnimatePresence>
                                            <motion.div 
                                                key={count}
                                                initial={{ scale: 1.5, rotate: 20 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-400 text-slate-900 text-[10px] md:text-[11px] font-[1000] flex items-center justify-center border-2 border-[#0F172A] shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                            >
                                                {count}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex flex-col min-w-0 pr-1 md:pr-0">
                                        <h4 className="font-extrabold text-[13px] md:text-base tracking-tight flex items-center gap-1.5 uppercase italic text-white shadow-sm truncate">
                                            {t.basket.itemsSelected.replace('{count}', count.toString())}
                                            <ChevronUp size={14} className={cn("transition-transform duration-500", isExpanded ? "rotate-180" : "")} />
                                        </h4>
                                        <span className="text-[10px] md:text-xs font-bold text-white/70 tracking-tight truncate">
                                            {count < 2 ? t.basket.notEnough : t.basket.ready}
                                        </span>
                                    </div>
                                </button>

                                {/* 분석 가동 버튼 */}
                                <motion.div
                                    whileHover={count >= 2 ? { scale: 1.05 } : {}}
                                    whileTap={count >= 2 ? { scale: 0.95 } : {}}
                                    className="shrink-0"
                                >
                                    <Button
                                        onClick={onAnalyze}
                                        disabled={count < 2 || isAnalyzing}
                                        className={cn(
                                            "rounded-full font-[1000] text-[11px] md:text-base px-6 md:px-10 h-10 md:h-14 border-none transition-all duration-500",
                                            "bg-gradient-to-br from-emerald-300 via-teal-400 to-emerald-500 text-emerald-950 hover:brightness-110 shadow-[0_15px_40px_rgba(16,185,129,0.4)]",
                                            "disabled:opacity-20 disabled:scale-95 disabled:grayscale",
                                            count >= 2 && !isAnalyzing && "animate-pulse-glow"
                                        )}
                                    >
                                        {isAnalyzing ? (
                                            <span className="flex items-center gap-2">
                                                <FlaskConical size={16} className="animate-spin" />
                                                <span className="hidden sm:inline tracking-widest uppercase">{t.basket.analyzing}</span>
                                                <span className="sm:hidden">...</span>
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Sparkles size={16} className="animate-pulse" />
                                                <span className="tracking-widest uppercase">{language === 'ko' ? '분석' : 'ANALYZE'}</span>
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>

                            {/* 고급 프로그레스 바 (선택 충전도) */}
                            <div className="h-1.5 bg-black/10 w-full overflow-hidden flex">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count / MAX_BASKET_SIZE) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
