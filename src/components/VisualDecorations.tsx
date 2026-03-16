"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pill, Sparkles, Activity, ShieldCheck, HeartPulse } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function VisualDecorations() {
  const [hasMounted, setHasMounted] = useState(false);
  const [stats, setStats] = useState({ ingredients: 0, interactions: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    async function fetchStats() {
      try {
        const [{ count: ingCount }, { count: intCount }] = await Promise.all([
          supabase.from('ingredients').select('*', { count: 'exact', head: true }),
          supabase.from('interactions').select('*', { count: 'exact', head: true })
        ]);
        setStats({
          ingredients: ingCount || 0,
          interactions: intCount || 0
        });
      } catch (e) {
        console.error("Stats fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* 프리미엄 노이즈: 디지털 텍스처감 부여 */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* 데이터 통계 뱃지 - 실시간 데이터 연동 (더 선명하고 깊이감 있는 디자인) */}
      <div className="absolute top-20 left-12 z-20 hidden xl:flex flex-col gap-6">
        <motion.div
          initial={{ x: -40, opacity: 0, rotate: -3 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05, rotate: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="bg-slate-950/80 border border-white/20 p-4 rounded-[1.8rem] flex items-center gap-4 shadow-[0_35px_70px_-15px_rgba(0,0,0,0.7)] cursor-default ring-1 ring-white/10"
        >
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Analysis Library</span>
            <span className="text-xl font-[1000] text-white tracking-tighter">
              {isLoading ? "..." : stats.ingredients.toLocaleString()}+ 
              <span className="text-emerald-400/80 italic font-black ml-1">Ingredients</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: -40, opacity: 0, rotate: 2 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05, rotate: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="bg-slate-950/80 border border-white/20 p-4 rounded-[1.8rem] flex items-center gap-4 shadow-[0_35px_70px_-15px_rgba(0,0,0,0.7)] cursor-default ring-1 ring-white/10 ml-8"
        >
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Interaction DB</span>
            <span className="text-xl font-[1000] text-white tracking-tighter">
              {isLoading ? "..." : stats.interactions.toLocaleString()}+ 
              <span className="text-cyan-400/80 italic font-black ml-1">Pairs</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* 메쉬 그라데이션 시스템 */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 45, 0],
            x: ['-10%', '10%', '-10%'],
            y: ['-5%', '5%', '-5%']
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] blur-[100px]"
        />

        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -60, 0],
            x: ['20%', '-10%', '20%'],
            y: ['10%', '-10%', '10%']
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 -right-[20%] w-[90%] h-[90%] bg-[radial-gradient(circle,rgba(20,184,166,0.12)_0%,transparent_70%)] blur-[120px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: ['-20%', '20%', '-20%'],
            y: ['30%', '10%', '30%']
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-[10%] w-[70%] h-[60%] bg-[radial-gradient(circle,rgba(52,211,153,0.1)_0%,transparent_70%)] blur-[140px]"
        />
      </div>

      {/* 플로팅 입체 아이콘 카드: 샤프한 디자인 최적화 */}
      <div className="absolute inset-0 z-10 hidden md:block">
        <FloatingItem
          icon={<Pill size={24} className="text-emerald-400" />}
          label="Pure"
          className="top-[25%] left-[5%] xl:left-[15%] -rotate-6 scale-90 md:scale-100"
          delay={0}
        />
        <FloatingItem
          icon={<Sparkles size={20} className="text-amber-400" />}
          label="Boost"
          className="top-[45%] right-[8%] rotate-3 scale-90 md:scale-110"
          delay={1.5}
        />
        <FloatingItem
          icon={<Activity size={22} className="text-blue-400" />}
          label="Active"
          className="bottom-[22%] left-[10%] xl:left-[20%] rotate-6 scale-90 md:scale-100"
          delay={3}
        />
        <FloatingItem
          icon={<HeartPulse size={24} className="text-rose-400" />}
          label="Health"
          className="top-[18%] right-[15%] xl:right-[22%] -rotate-12 scale-90 md:scale-100"
          delay={4.5}
        />
      </div>

      {/* 매지컬 입자 시스템 */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -120],
            x: [0, (Math.random() - 0.5) * 60]
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeInOut"
          }}
          className="absolute w-[3px] h-[3px] bg-emerald-300/30 rounded-full blur-[1px]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${60 + Math.random() * 40}%`
          }}
        />
      ))}
    </div>
  );
}

function FloatingItem({ icon, label, className, delay }: { icon: React.ReactNode, label: string, className: string, delay: number }) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0, scale: 0.8 }}
      animate={{
        y: [-15, 15, -15],
        opacity: [0, 1, 0.7],
        scale: [0.95, 1.05, 0.95]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className={`absolute hidden md:flex items-center gap-3 bg-slate-950/40 border border-white/[0.1] px-5 py-3 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="p-2 bg-white/5 rounded-xl border border-white/10">{icon}</div>
      <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </motion.div>
  );
}
