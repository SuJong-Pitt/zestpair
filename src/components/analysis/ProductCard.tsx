"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, TrendingUp, Star, Truck, ShoppingCart } from "lucide-react";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import type { CoupangProduct } from "@/types/database";

interface ProductCardProps {
    product: CoupangProduct;
    index: number;
    sourceIngredient?: string;
}

/** 
 * 프리미엄 상품 카드 - 퍼스널 큐레이션 버전 
 * React.memo를 적용하고 이미지 로딩 시 레이아웃 이동(CLS) 방지를 위해 고정 높이 영역 유지.
 */
const ProductCard = memo(function ProductCard({ product, index, sourceIngredient }: ProductCardProps) {
    const { language } = useBasketStore();
    const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['ko'];

    const configs = [
        { label: t.products.bestAi, color: "text-blue-600", bg: "bg-blue-500/5", border: "border-blue-100/50", gradient: "from-blue-600 to-indigo-600", glow: "shadow-blue-500/20", icon: <Sparkles size={10} className="text-blue-400" /> },
        { label: t.products.maxSynergy, color: "text-emerald-600", bg: "bg-emerald-500/5", border: "border-emerald-100/50", gradient: "from-emerald-600 to-teal-600", glow: "shadow-emerald-500/20", icon: <Zap size={10} className="text-emerald-400" /> },
        { label: t.products.bestValue, color: "text-amber-600", bg: "bg-amber-500/5", border: "border-orange-100/50", gradient: "from-orange-500 to-amber-600", glow: "shadow-orange-500/20", icon: <TrendingUp size={10} className="text-orange-400" /> },
    ];
    const config = configs[index % configs.length];

    return (
        <Card className="group relative h-full flex flex-col overflow-hidden border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] transition-all duration-700 rounded-[2.2rem] bg-white">
            {/* 상단 비주얼 영역 - 한층 더 콤팩트하게 */}
            <div className="relative h-[140px] md:h-[160px] bg-gradient-to-b from-slate-50/80 to-white flex items-center justify-center p-5 overflow-hidden">
                <div className="absolute top-4 left-5 z-20">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Rank</span>
                        <span className="text-[14px] font-[1000] italic text-slate-800">0{index + 1}</span>
                    </div>
                </div>

                <div className="absolute top-4 right-5 z-20">
                    <div className={cn("px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-black/5 bg-white border border-slate-100 transition-all duration-500 group-hover:-translate-y-1")}>
                        {config.icon}
                        <span className={cn("text-[9px] font-black uppercase tracking-tight", config.color)}>{config.label}</span>
                    </div>
                </div>

                {/* 상품 이미지 - 강제 가로세로 비율 유지로 CLS 해결 */}
                <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                    {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            className="max-h-[120px] max-w-full object-contain drop-shadow-2xl"
                        />
                    ) : (
                        <div className="relative">
                            <div className="text-6xl drop-shadow-2xl group-hover:scale-110 transition-all duration-500">
                                {index % 4 === 0 ? "💊" : index % 4 === 1 ? "🧬" : index % 4 === 2 ? "🧪" : "🧴"}
                            </div>
                            <div className={cn("absolute inset-0 blur-2xl opacity-20 rounded-full animate-pulse", config.bg)} />
                        </div>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
            </div>

            <CardContent className="px-5 pb-6 pt-2 flex flex-col flex-1 bg-white">
                <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="flex h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-[0.15em] truncate">
                        {sourceIngredient ? t.products.relatedTo.replace("{ingredient}", sourceIngredient) : t.products.curationTitle}
                    </p>
                </div>

                <h4 className="font-extrabold text-[14px] sm:text-[15px] text-slate-900 leading-[1.3] mb-3 line-clamp-2 min-h-[36px] tracking-tight group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h4>

                <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                        <Star size={10} fill="#F59E0B" className="text-amber-500" />
                        <span className="text-[11px] font-black text-slate-700 pt-0.5">{typeof product.rating === 'number' ? product.rating.toFixed(1) : "4.8"}</span>
                    </div>
                    {product.is_rocket ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-sky-500">
                            <Truck size={10} strokeWidth={2.5} />
                            <span className="text-[9px] font-black uppercase italic">Rocket</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-100 text-orange-600">
                            <ShoppingCart size={10} />
                            <span className="text-[9px] font-black uppercase tracking-tighter">Prime</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto border-t border-slate-50 pt-4 flex items-end justify-between">
                    <div className="flex flex-col">
                        {product.discount_rate && (
                            <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-rose-500 text-[10px] font-black italic">{product.discount_rate}% OFF</span>
                                {product.original_price && (
                                    <span className="text-[9px] text-slate-300 line-through font-bold">
                                        {language === 'ko' ? `₩${Math.floor(product.original_price).toLocaleString()}` : `$${product.original_price.toFixed(2)}`}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-[10px] font-black text-slate-400">{language === 'ko' ? '₩' : '$'}</span>
                            <span className="text-xl md:text-2xl font-[1000] text-slate-900 tracking-tighter">
                                {product.price > 0
                                    ? (language === 'ko' ? Math.floor(product.price).toLocaleString() : product.price.toFixed(2))
                                    : t.products.outOfStock}
                            </span>
                        </div>
                    </div>

                    <Button
                        className={cn(
                            "group/btn relative overflow-hidden rounded-[1.2rem] px-4 h-10 transition-all duration-500 shadow-lg hover:shadow-xl active:scale-95 border border-white/10 bg-gradient-to-r",
                            config.gradient,
                            config.glow
                        )}
                        asChild
                    >
                        <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                            <ShoppingCart size={10} className="text-white/90" />
                            <span className="text-[9px] font-black tracking-tight text-white whitespace-nowrap">
                                {language === 'ko' ? t.common.shoppingCoupang : 
                                 language === 'ja' ? t.common.shoppingRakuten : 
                                 language === 'zh' ? t.common.shoppingTmall : 
                                 t.common.shoppingAmazon}
                            </span>
                        </a>
                    </Button>
                </div>
            </CardContent>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '99%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={cn("h-full bg-gradient-to-r opacity-40", config.gradient)}
                />
            </div>
        </Card>
    );
});

export default ProductCard;
