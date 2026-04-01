"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface ToastProps {
    show: boolean;
    message: string;
    onClose: () => void;
}

export default function Toast({ show, message, onClose }: ToastProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000]"
                >
                    <div className="flex items-center gap-3 px-6 py-3.5 rounded-[1.5rem] bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.1)]">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                            <Check size={14} className="text-emerald-400" />
                        </div>
                        <span className="text-sm font-black tracking-tight whitespace-nowrap">
                            {message}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
