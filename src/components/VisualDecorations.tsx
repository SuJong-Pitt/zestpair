import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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

/* 분자 연결선 네트워크 - 신경망 펄스 효과 추가 ✨ */
function MolecularNetwork() {
  const nodes = useMemo(() => [
    { x: 15, y: 20 }, { x: 35, y: 10 }, { x: 55, y: 25 },
    { x: 25, y: 45 }, { x: 50, y: 55 }, { x: 70, y: 35 },
    { x: 80, y: 15 }, { x: 10, y: 65 }, { x: 65, y: 75 },
    { x: 42, y: 72 }, { x: 85, y: 60 }, { x: 5, y: 40 },
  ], []);

  const connections = useMemo(() => [
    [0, 1], [1, 2], [2, 5], [5, 6], [6, 4], [4, 3], [3, 0],
    [3, 7], [4, 8], [5, 10], [9, 10], [7, 11], [11, 0]
  ], []);

  return (
    <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(16,185,129,0)" />
          <stop offset="50%" stopColor="rgba(16,185,129,0.3)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0)" />
        </linearGradient>
      </defs>
      
      {/* 연결선 (정적) */}
      {connections.map(([a, b], i) => (
        <line
          key={`l-${i}`}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="rgba(255,255,255,0.03)" strokeWidth="0.1"
        />
      ))}

      {/* 펄스 애니메이션 (선을 타고 흐르는 빛) ✨ */}
      {connections.map(([a, b], i) => (
        <motion.line
          key={`p-${i}`}
          x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="url(#lineGrad)" strokeWidth="0.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
        />
      ))}

      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x} cy={n.y} r="0.3"
          fill={i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#06b6d4" : "#a78bfa"}
          filter="url(#softglow)"
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 4 + i % 3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

/* HUD 데이터 파티클 (좌표값 등) */
function HUDDataPoints() {
  const points = useMemo(() => [
    { x: '15%', y: '25%', label: 'NEURAL_LINK_01' },
    { x: '82%', y: '12%', label: 'CORE_V2.5_STABLE' },
    { x: '10%', y: '78%', label: 'Z_AXIS_MATCH' },
    { x: '88%', y: '85%', label: 'INTELLIGENCE_LAB' },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {points.map((p, i) => (
        <motion.div
          key={i}
          className="absolute flex flex-col gap-1"
          style={{ left: p.x, top: p.y }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 1.5 }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[7px] font-black tracking-widest text-emerald-500/40 uppercase font-mono">
              {p.label}
            </span>
          </div>
          <div className="w-8 h-[1px] bg-gradient-to-r from-emerald-500/20 to-transparent" />
        </motion.div>
      ))}
    </div>
  );
}

export default function VisualDecorations() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.1 });
  const [hasMounted, setHasMounted] = useState(false);
  const [stats, setStats] = useState({ ingredients: 0, interactions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  /* 부유 알약 캡슐 정적 데이터 */
  const capsules = useMemo(() => [
    { color1: "#10b981", color2: "#06b6d4", x: "8%", y: "18%", rotate: -20, delay: 0, scale: 1.1 },
    { color1: "#f59e0b", color2: "#f97316", x: "88%", y: "14%", rotate: 15, delay: 1.2, scale: 0.9 },
    { color1: "#8b5cf6", color2: "#ec4899", x: "6%", y: "62%", rotate: 30, delay: 2.4, scale: 1.0 },
    { color1: "#06b6d4", color2: "#3b82f6", x: "85%", y: "58%", rotate: -10, delay: 3.6, scale: 1.2 },
    { color1: "#f97316", color2: "#f59e0b", x: "18%", y: "80%", rotate: 25, delay: 0.8, scale: 0.85 },
    { color1: "#10b981", color2: "#8b5cf6", x: "80%", y: "80%", rotate: -35, delay: 2.0, scale: 0.95 },
    { color1: "#ec4899", color2: "#f59e0b", x: "50%", y: "88%", rotate: 10, delay: 1.6, scale: 0.8 },
  ], []);

  if (!hasMounted) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none">

      {/* === 배경: 3중 레이어 메쉬 그라데이션 오브 (생동감 UP ✨) === */}
      <div className="absolute inset-0">
        {/* 에메랄드 오브 – 좌상단 (숨쉬듯 움직임) */}
        <motion.div
          animate={isInView ? { 
            scale: [1, 1.3, 1.1], 
            x: ["-5%", "8%", "-5%"], 
            y: ["-5%", "5%", "-5%"],
            opacity: [0.15, 0.25, 0.15]
          } : {}}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[70%] h-[75%] gpu-accelerated"
          style={{
            background: "radial-gradient(circle at 40% 40%, rgba(16,185,129,0.3) 0%, transparent 65%)",
            filter: isMobile ? "blur(30px)" : "blur(60px)",
            willChange: "transform, opacity"
          }}
        />
        {/* 시안/퍼플 오브 – 우상단 (교차 흐름) */}
        <motion.div
          animate={isInView ? { 
            scale: [1.2, 1, 1.2], 
            x: ["5%", "-8%", "5%"], 
            y: ["5%", "-5%", "5%"],
            opacity: [0.12, 0.2, 0.12]
          } : {}}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[15%] w-[75%] h-[80%] gpu-accelerated"
          style={{
            background: "radial-gradient(circle at 60% 35%, rgba(139,92,246,0.22) 0%, rgba(6,182,212,0.15) 45%, transparent 70%)",
            filter: isMobile ? "blur(35px)" : "blur(70px)",
            willChange: "transform, opacity"
          }}
        />
        {/* 골든 오브 – 중앙 하단 (강렬한 베이스) */}
        <motion.div
          animate={isInView ? { scale: [0.9, 1.1, 0.9], opacity: [0.08, 0.15, 0.08] } : {}}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 right-0 h-[45%] gpu-accelerated"
          style={{
            background: "radial-gradient(circle at 50% 100%, rgba(16,185,129,0.18) 0%, transparent 75%)",
            filter: isMobile ? "blur(40px)" : "blur(80px)",
            willChange: "opacity, transform"
          }}
        />
      </div>

      {/* === 우아한 부유 보케 효과 === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(isMobile ? 2 : 5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? {
              opacity: [0, 0.15, 0],
              y: [150, -150],
              x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 100],
              scale: [0.5, 1.5, 0.7]
            } : { opacity: 0 }}
            transition={{ duration: 15 + i * 4, repeat: Infinity, ease: "linear", delay: i * 2 }}
            className="absolute rounded-full gpu-accelerated"
            style={{
              width: 150 + i * 50,
              height: 150 + i * 50,
              left: `${(i * 25) % 100}%`,
              top: '90%',
              background: `radial-gradient(circle, ${["#10b98115", "#06b6d415", "#8b5cf615"][i % 3]} 0%, transparent 70%)`,
              filter: isMobile ? "blur(20px)" : "blur(40px)",
              willChange: "transform, opacity"
            }}
          />
        ))}
      </div>

      {/* === 분자 네트워크 & HUD 데이터 포인트 ✨ === */}
      {!isMobile && (
        <>
          <div className="absolute inset-0">
            <MolecularNetwork />
          </div>
          <HUDDataPoints />
        </>
      )}

      {/* === 데이터 스트림 스캔 (Thin line sweep) ✨ === */}
      <motion.div
        animate={{ y: ['-10%', '110%'], opacity: [0, 0.3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent z-10"
      />

      {/* === 노이즈 & 스캔라인 (프리미엄 텍스처) === */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)" }}
      />

      {/* === 데이터 통계 뱃지 (글래스모피즘 강화 ✨) === */}
      <div className="absolute top-24 left-8 z-20 hidden xl:flex flex-col gap-6">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.06, x: 8, rotateY: 5 }}
          transition={{ delay: 0.8, duration: 0.7, type: "spring" }}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl cursor-default group"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)"
          }}
        >
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-50" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-400/70 uppercase tracking-[0.2em] font-black mb-1">Analysis Library</p>
            <p className="text-xl font-[900] text-white leading-none">
              {isLoading ? "···" : stats.ingredients.toLocaleString()}
              <span className="text-emerald-400 text-sm font-black ml-1.5">+ Ingredients</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.06, x: 8, rotateY: 5 }}
          transition={{ delay: 1.0, duration: 0.7, type: "spring" }}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl cursor-default ml-8 group"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)"
          }}
        >
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#06b6d4]" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-400 animate-ping opacity-50" style={{ animationDelay: "0.5s" }} />
          </div>
          <div>
            <p className="text-[10px] text-cyan-400/70 uppercase tracking-[0.2em] font-black mb-1">Interaction DB</p>
            <p className="text-xl font-[900] text-white leading-none">
              {isLoading ? "···" : stats.interactions.toLocaleString()}
              <span className="text-cyan-400 text-sm font-black ml-1.5">+ Pairs</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* === 부유 알약 캡슐 === */}
      {capsules.map((cap, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:block"
          style={{ left: cap.x, top: cap.y, rotate: cap.rotate, scale: cap.scale }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? {
            opacity: [0, 0.7, 0.4],
            y: [-15, 15, -15],
            rotate: [cap.rotate - 8, cap.rotate + 8, cap.rotate - 8],
          } : { opacity: 0 }}
          transition={{ duration: 7 + i, delay: cap.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ filter: `drop-shadow(0 10px 25px ${cap.color1}44)` }}>
            <CapsuleIcon color1={cap.color1} color2={cap.color2} size={42} />
          </div>
        </motion.div>
      ))}

      {/* === 리치 파티클 시스템 (Z-axis 스캔 파티클) === */}
      {[...Array(isMobile ? 5 : 12)].map((_, i) => {
        const colors = ["#10b981", "#06b6d4", "#a78bfa", "#f59e0b", "#f97316"];
        const color = colors[i % colors.length];
        const size = 1.5 + seededRand(i * 3) * 2;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={isInView ? {
              opacity: [0, 0.6, 0],
              y: [0, -(80 + seededRand(i) * 120)],
              x: [0, (seededRand(i * 2) - 0.5) * 40],
              scale: [1, 0.4, 0.1],
            } : { opacity: 0 }}
            transition={{
              duration: 7 + seededRand(i * 5) * 8,
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
              top: `${70 + seededRand(i * 13) * 30}%`,
              boxShadow: `0 0 ${size * 2}px ${color}`,
              willChange: "transform, opacity"
            }}
          />
        );
      })}
    </div>
  );
}
