"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/* 고정 시드(seed)로 랜덤값 생성 – SSR/CSR hydration mismatch 방지      */
/* ------------------------------------------------------------------ */
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/* 알약 캡슐 SVG 아이콘 */
function CapsuleIcon({ color1, color2, size = 28 }: { color1: string; color2: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.45} viewBox="0 0 60 27" fill="none">
      <rect x="1" y="1" width="58" height="25" rx="12.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M1 13.5 Q1 1 13.5 1 H30 V26 H13.5 Q1 26 1 13.5Z" fill={color1} opacity="0.85" />
      <path d="M30 1 H46.5 Q59 1 59 13.5 Q59 26 46.5 26 H30 V1Z" fill={color2} opacity="0.85" />
      <line x1="30" y1="1" x2="30" y2="26" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    </svg>
  );
}

/* 분자 연결선 네트워크 */
function MolecularNetwork() {
  const nodes = [
    { x: 15, y: 20 }, { x: 35, y: 10 }, { x: 55, y: 25 },
    { x: 25, y: 45 }, { x: 50, y: 55 }, { x: 70, y: 35 },
    { x: 80, y: 15 }, { x: 10, y: 65 }, { x: 65, y: 75 },
    { x: 42, y: 72 }, { x: 85, y: 60 }, { x: 5, y: 40 },
  ];
  const connections = [
    [0, 1], [1, 2], [1, 3], [2, 5], [3, 4], [4, 5],
    [5, 6], [3, 7], [4, 8], [4, 9], [8, 10], [0, 11],
    [7, 9], [2, 6], [8, 9],
  ];

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
        </linearGradient>
        <filter id="nodeglow">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {connections.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="url(#lineGrad)"
          strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.6, 0.3] }}
          transition={{ duration: 2 + i * 0.3, delay: i * 0.15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x} cy={n.y} r="0.8"
          fill={i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#06b6d4" : "#a78bfa"}
          filter="url(#nodeglow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3 + seededRand(i) * 2, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

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
        setStats({ ingredients: ingCount || 0, interactions: intCount || 0 });
      } catch (e) {
        console.error("Stats fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (!hasMounted) return null;

  /* 부유 알약 캡슐 정적 데이터 */
  const capsules = [
    { color1: "#10b981", color2: "#06b6d4", x: "8%",  y: "18%", rotate: -20, delay: 0,   scale: 1.1 },
    { color1: "#f59e0b", color2: "#f97316", x: "88%", y: "14%", rotate:  15, delay: 1.2, scale: 0.9 },
    { color1: "#8b5cf6", color2: "#ec4899", x: "6%",  y: "62%", rotate:  30, delay: 2.4, scale: 1.0 },
    { color1: "#06b6d4", color2: "#3b82f6", x: "85%", y: "58%", rotate: -10, delay: 3.6, scale: 1.2 },
    { color1: "#f97316", color2: "#f59e0b", x: "18%", y: "80%", rotate:  25, delay: 0.8, scale: 0.85 },
    { color1: "#10b981", color2: "#8b5cf6", x: "80%", y: "80%", rotate: -35, delay: 2.0, scale: 0.95 },
    { color1: "#ec4899", color2: "#f59e0b", x: "50%", y: "88%", rotate:  10, delay: 1.6, scale: 0.8 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">

      {/* === 배경: 3중 레이어 메쉬 그라데이션 오브 === */}
      <div className="absolute inset-0">
        {/* 에메랄드 오브 – 좌상단 */}
        <motion.div
          animate={{ scale: [1, 1.35, 1], x: ["-5%", "8%", "-5%"], y: ["-5%", "5%", "-5%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[65%] h-[70%]"
          style={{ background: "radial-gradient(circle at 40% 40%, rgba(16,185,129,0.28) 0%, transparent 65%)", filter: "blur(80px)" }}
        />
        {/* 시안/퍼플 오브 – 우상단 */}
        <motion.div
          animate={{ scale: [1.2, 0.9, 1.2], x: ["5%", "-8%", "5%"], y: ["5%", "-5%", "5%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[15%] w-[70%] h-[75%]"
          style={{ background: "radial-gradient(circle at 60% 35%, rgba(139,92,246,0.25) 0%, rgba(6,182,212,0.15) 40%, transparent 65%)", filter: "blur(90px)" }}
        />
        {/* 골든 오브 – 가운데 하단 */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], x: ["-5%", "5%", "-5%"], y: ["5%", "-5%", "5%"] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[5%] left-[20%] w-[60%] h-[50%]"
          style={{ background: "radial-gradient(circle at 50% 70%, rgba(245,158,11,0.12) 0%, rgba(16,185,129,0.1) 40%, transparent 65%)", filter: "blur(100px)" }}
        />
      </div>

      {/* === 분자 네트워크 배경 === */}
      <div className="absolute inset-0 opacity-70">
        <MolecularNetwork />
      </div>

      {/* === 노이즈 텍스처 === */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* === 수평 스캔라인 (프리미엄 기술감) === */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)" }}
      />

      {/* === 데이터 통계 뱃지 === */}
      <div className="absolute top-16 left-8 z-20 hidden xl:flex flex-col gap-5">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.06, x: 4 }}
          transition={{ delay: 0.8, duration: 0.7, type: "spring" }}
          className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl cursor-default"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.08) 100%)",
            border: "1px solid rgba(16,185,129,0.25)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
          }}
        >
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
          </div>
          <div>
            <p className="text-[9px] text-emerald-400/60 uppercase tracking-[0.18em] font-black mb-0.5">Analysis Library</p>
            <p className="text-lg font-[900] text-white leading-none">
              {isLoading ? "···" : stats.ingredients.toLocaleString()}
              <span className="text-emerald-400 text-sm font-black ml-1">+ Ingredients</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.06, x: 4 }}
          transition={{ delay: 1.0, duration: 0.7, type: "spring" }}
          className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl cursor-default ml-6"
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(139,92,246,0.08) 100%)",
            border: "1px solid rgba(6,182,212,0.25)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
          }}
        >
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-60" style={{ animationDelay: "0.5s" }} />
          </div>
          <div>
            <p className="text-[9px] text-cyan-400/60 uppercase tracking-[0.18em] font-black mb-0.5">Interaction DB</p>
            <p className="text-lg font-[900] text-white leading-none">
              {isLoading ? "···" : stats.interactions.toLocaleString()}
              <span className="text-cyan-400 text-sm font-black ml-1">+ Pairs</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* === 부유 알약 캡슐 (md 이상에서만) === */}
      {capsules.map((cap, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:block"
          style={{ left: cap.x, top: cap.y, rotate: cap.rotate, scale: cap.scale }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 0.75, 0.55],
            y: [-12, 12, -12],
            rotate: [cap.rotate - 5, cap.rotate + 5, cap.rotate - 5],
          }}
          transition={{ duration: 6 + i, delay: cap.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ filter: `drop-shadow(0 8px 20px ${cap.color1}55)` }}>
            <CapsuleIcon color1={cap.color1} color2={cap.color2} size={40} />
          </div>
        </motion.div>
      ))}

      {/* === 리치 파티클 시스템 (다양한 색상) === */}
      {[...Array(30)].map((_, i) => {
        const colors = ["#10b981", "#06b6d4", "#a78bfa", "#f59e0b", "#f97316", "#ec4899"];
        const color = colors[i % colors.length];
        const size = 2 + seededRand(i * 3) * 3;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.7, 0],
              y: [0, -(80 + seededRand(i) * 80)],
              x: [0, (seededRand(i * 2) - 0.5) * 50],
              scale: [1, 0.5],
            }}
            transition={{
              duration: 4 + seededRand(i * 5) * 5,
              repeat: Infinity,
              delay: seededRand(i * 7) * 10,
              ease: "easeOut",
            }}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: color,
              left: `${seededRand(i * 11) * 100}%`,
              top: `${55 + seededRand(i * 13) * 45}%`,
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
}
