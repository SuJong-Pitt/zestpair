"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // 400px 이상 스크롤 시 버튼 표시
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className={cn(
                        "fixed bottom-32 left-6 z-40 md:left-10 md:right-auto md:bottom-12",
                        "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center overflow-hidden",
                        "bg-slate-900/40 backdrop-blur-2xl border border-white/10",
                        "shadow-[0_15px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]",
                        "text-emerald-400 transition-all group"
                    )}
                    aria-label="Scroll to top"
                >
                    {/* 오로라 배경 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* 스캐닝 라인 애니메이션 */}
                    <motion.div 
                        animate={{ y: ["-100%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-px bg-white/20 blur-[1px] opacity-20"
                    />

                    <ArrowUp size={24} strokeWidth={3} className="relative z-10 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    
                    {/* 하단 점 포인트 */}
                    <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-400 group-hover:scale-150 transition-transform" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
