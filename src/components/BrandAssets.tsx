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
                "relative flex items-center justify-center rounded-full bg-[#0C1821] border border-white/5 shadow-xl shrink-0 overflow-hidden group",
                className
            )}
            style={{ width: size, height: size }}
        >
            <div className="relative w-[75%] h-[75%] transition-transform duration-500 group-hover:scale-110">
                <Image
                    src="/logo.svg"
                    alt="ZestPair Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                    priority
                />
            </div>
            
            {/* 세련된 광택 가니시 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
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
