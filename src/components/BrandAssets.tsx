"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * ZestPair 브랜드 로고 아이콘 (스크린샷 1 반영 🎨)
 * - 원형 다크 배경 (#0C1821)
 * - Z 형상 피약 그래픽 포함
 */
export function BrandLogo({ className, size = 36 }: { className?: string; size?: number }) {
    return (
        <div 
            className={cn(
                "relative flex items-center justify-center rounded-full bg-[#030704] shrink-0 group overflow-visible",
                size === 28 ? "w-7 h-7" : size === 24 ? "w-6 h-6" : "w-10 h-10 md:w-12 md:h-12",
                className
            )}
        >
            {/* 프리즘 회전 아우라 */}
            <div className="absolute inset-[-4px] rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none overflow-hidden sm:block hidden">
                <div 
                    className="absolute inset-[-100%] animate-spin-slow"
                    style={{
                        background: "conic-gradient(from 0deg, transparent 0deg, #10b981 90deg, #34d399 180deg, #60a5fa 270deg, transparent 360deg)",
                        animationDuration: "8s"
                    }}
                />
            </div>

            {/* 핵심 광채 (Main Glow) */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse pointer-events-none" />
            
            <div 
                className={cn(
                    "relative z-10 w-full h-full flex items-center justify-center rounded-full bg-[#0d1a15] border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:border-emerald-400 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]",
                )}
            >
                <div className="relative w-[70%] h-[70%] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[5deg]">
                    <Image
                        src="/logo.svg"
                        alt="ZestPair Logo"
                        width={40}
                        height={40}
                        className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                        priority
                    />
                </div>
                
                {/* 세련된 광택 가니시 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none overflow-hidden" />
            </div>

            {/* 하단 그림자 강화 */}
            <div className="absolute -bottom-2 inset-x-2 h-4 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
}

/**
 * ZestPair 브랜드 사명 텍스트 (스크린샷 2 반영 🎨)
 * - Zest (White) / Pair (Emerald)
 * - Black Weight + Italic
 */
export function BrandName({ className, size = "text-xl" }: { className?: string; size?: string }) {
    return (
        <span className={cn(
            "font-[1000] tracking-tighter italic select-none", 
            size,
            className
        )}>
            <span className="text-white">Zest</span>
            <span className="text-emerald-500">Pair</span>
        </span>
    );
}
