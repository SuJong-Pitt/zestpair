"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import {
  ShieldCheck, Target, Database, ChevronLeft,
  BookOpen, HeartPulse, Sparkles, Zap, Globe, Cpu, ArrowRight, Activity
} from "lucide-react";
import Link from "next/link";
import { useBasketStore } from "@/store/basketStore";
import { BrandLogo, BrandName } from "@/components/BrandAssets";

// ── 카운터 애니메이션 훅 ──────────────────────────────────────
function useCounter(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView && startOnView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration, startOnView]);

  return { count, ref };
}

// ── 섹션 페이드인 래퍼 ───────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── 언어 헬퍼 ────────────────────────────────────────────────
type Lang = 'ko' | 'en' | 'ja' | 'zh';
function t(ko: ReactNode, en: ReactNode, ja: ReactNode, zh: ReactNode, lang: Lang) {
  return lang === 'ko' ? ko : lang === 'ja' ? ja : lang === 'zh' ? zh : en;
}

export default function AboutClient() {
  const { language } = useBasketStore();
  const lang = (language ?? 'ko') as Lang;

  const stat1 = useCounter(10000);
  const stat2 = useCounter(99);
  const stat3 = useCounter(2500);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "#030712" }}>

      {/* ── 고정 배경 ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.09) 0%, transparent 70%)"
        }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30" style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)",
          filter: "blur(60px)"
        }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20" style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          filter: "blur(80px)"
        }} />
        {/* 그리드 */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      {/* ── 네비게이션 ── */}
      <nav className="relative z-50 px-5 md:px-10 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandLogo size={28} />
          <BrandName size="text-lg" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.5)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)";
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
          }}
        >
          <ChevronLeft size={13} />
          {t("돌아가기", "Back", "戻る", "返回", lang)}
        </Link>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative z-10 pt-16 pb-32 px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <Sparkles size={11} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
            {t("우리의 비전", "Our Vision", "私たちのビジョン", "我们的愿景", lang)}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.92] mb-8 max-w-5xl mx-auto"
        >
          {t("AI가 재정의하는", "Redefining", "AIが再定義する", "AI 重新定义的", lang)}{" "}
          <span style={{
            background: "linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {t("완전한 영양의 균형", "Nutritional Balance", "完全な栄養バランス", "完美营养平衡", lang)}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-base md:text-lg text-white/40 leading-relaxed max-w-2xl mx-auto mb-12 font-medium"
        >
          {t(
            "ZestPair는 수천만 건의 과학적 데이터를 학습한 AI가 실시간으로 성분 시너지를 분석하는 정보 공학 연구소입니다.",
            "ZestPair is an information engineering lab where AI, trained on tens of millions of scientific data points, analyzes ingredient synergies in real-time.",
            "ZestPairは、数千万件の科学的データを学習したAIがリアルタイムで成分シナジーを分析する情報工学研究所です。",
            "ZestPair 是一个信息工程实验室，AI通过学习数千万条科学数据，实时分析成分协同效应。",
            lang
          )}
        </motion.p>

        {/* 스탯 3종 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 md:gap-6"
        >
          {[
            { ref: stat1.ref, value: stat1.count, suffix: "+", label: t("분석 성분", "Ingredients", "分析済み成分", "已分析成分", lang), color: "#34d399" },
            { ref: stat2.ref, value: stat2.count, suffix: ".9%", label: t("정확도", "Accuracy", "正確度", "准确度", lang), color: "#22d3ee" },
            { ref: stat3.ref, value: stat3.count, suffix: "+", label: t("상호작용 DB", "Interaction DB", "相互作用DB", "相互作用DB", lang), color: "#818cf8" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center px-8 py-5 rounded-2xl" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
            }}>
              <span ref={s.ref} className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: s.color }}>
                {s.value.toLocaleString()}{s.suffix}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          3 PILLAR CARDS
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-8 md:py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/70 mb-3">
              {t("핵심 철학", "Core Philosophy", "コア哲学", "核心理念", lang)}
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
              {t("신뢰할 수 있는 과학", "Science You Can Trust", "信頼できる科学", "值得信赖的科学", lang)}
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Target size={22} />,
                color: "#34d399",
                bg: "rgba(52,211,153,0.08)",
                border: "rgba(52,211,153,0.2)",
                glow: "rgba(52,211,153,0.15)",
                title: t("데이터 정밀도", "Data Precision", "データの精度", "数据精准度", lang),
                desc: t(
                  "글로벌 의학 논문과 약리학 데이터베이스를 직접 연결하여, 가장 신뢰할 수 있는 화학적 근거를 바탕으로 분석합니다.",
                  "By connecting global medical literature and pharmacological databases, we analyze based on the most reliable chemical evidence.",
                  "世界の医学論文や薬理学データベースと直接連携し、最も信頼できる科学的根拠に基づいて分析します。",
                  "直接连接全球医学论文和药理学数据库，基于最可靠的科学依据进行分析。",
                  lang
                ),
                delay: 0,
              },
              {
                icon: <ShieldCheck size={22} />,
                color: "#22d3ee",
                bg: "rgba(34,211,238,0.08)",
                border: "rgba(34,211,238,0.2)",
                glow: "rgba(34,211,238,0.15)",
                title: t("안전 최적화", "Safety First", "安全の最適化", "安全优化", lang),
                desc: t(
                  "치명적인 부작용을 일으킬 수 있는 충돌 성분을 초단위로 스캔하여 사전에 완벽히 차단합니다.",
                  "We scan for conflicting ingredients that could cause fatal side effects in seconds and block them in advance.",
                  "致命的な副作用を引き起こす可能性のある成分の衝突を秒単位でスキャンし、完璧に遮断します。",
                  "秒级扫描可能导致致命副作用的冲突成分，并提前完全拦截。",
                  lang
                ),
                delay: 0.1,
              },
              {
                icon: <Cpu size={22} />,
                color: "#818cf8",
                bg: "rgba(129,140,248,0.08)",
                border: "rgba(129,140,248,0.2)",
                glow: "rgba(129,140,248,0.15)",
                title: t("AI 가이드", "AI Intelligence", "AIガイド", "AI 指南", lang),
                desc: t(
                  "복잡한 약학 정보를 누구나 이해하기 쉬운 직관적인 스케줄로 변환하여, 스마트한 웰니스 루틴을 설계해 드립니다.",
                  "We convert complex pharmaceutical information into an intuitive schedule anyone can understand, designing a smart wellness routine.",
                  "複雑な薬学情報を誰でも理解しやすい直感的なスケジュールに変換し、スマートなウェルネスルーチンを設計します。",
                  "将复杂的药学信息转换为直观计划，为您设计智能的健康习惯。",
                  lang
                ),
                delay: 0.2,
              },
            ].map((card, i) => (
              <FadeIn key={i} delay={card.delay}>
                <motion.div
                  whileHover={{ y: -8, boxShadow: `0 24px 60px ${card.glow}` }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="group relative h-full p-8 rounded-3xl overflow-hidden cursor-default"
                  style={{
                    background: `linear-gradient(145deg, ${card.bg} 0%, rgba(255,255,255,0.02) 100%)`,
                    border: `1px solid ${card.border}`,
                  }}
                >
                  {/* 호버 글로우 */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                    background: `radial-gradient(circle, ${card.glow} 0%, transparent 70%)`,
                    filter: "blur(20px)",
                  }} />

                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-6" style={{ background: card.bg, border: `1px solid ${card.border}`, color: card.color }}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-black mb-3 tracking-tight">{card.title}</h3>
                    <p className="text-sm text-white/45 leading-relaxed font-medium">{card.desc}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DATA PIPELINE SECTION
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 md:py-28 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl md:rounded-[3rem] overflow-hidden relative" style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {/* 배경 글로우 */}
            <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
              filter: "blur(40px)",
            }} />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-16 items-center">
              {/* 왼쪽 텍스트 */}
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{
                  background: "rgba(234,179,8,0.08)",
                  border: "1px solid rgba(234,179,8,0.2)",
                }}>
                  <Zap size={11} className="text-yellow-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400/80">
                    {t("데이터 파이프라인", "Data Pipeline", "データパイプライン", "数据流水线", lang)}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-8 leading-tight">
                  <span style={{
                    background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.4) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                    {t("초대형 연구 데이터로 만든\n신뢰의 원천", "Trust Built on\nMassive Research Data", "巨大な研究データに\n基づいた信頼の源", "基于巨量研究数据\n构建的信任之源", lang)}
                  </span>
                </h2>

                <div className="space-y-4">
                  {[
                    { icon: <BookOpen size={16} />, label: t("글로벌 학술 자료 라이브러리", "Global Academic Library", "世界の学術資料ライブラリ", "全球学术资料库", lang), color: "#34d399" },
                    { icon: <Database size={16} />, label: t("실시간 식약처 및 보건기구 연동", "Real-time Health Org Sync", "リアルタイムの保健機関連携", "实时连接卫生机构", lang), color: "#22d3ee" },
                    { icon: <HeartPulse size={16} />, label: t("전문 약리학 분석 알고리즘", "Pharmacological Algorithms", "専門的な薬理学分析アルゴリズム", "专业药理学分析算法", lang), color: "#818cf8" },
                    { icon: <Activity size={16} />, label: t("성분 시너지 실시간 스캔", "Real-time Synergy Scanning", "成分シナジーのリアルタイムスキャン", "实时成分协同效应扫描", lang), color: "#fb923c" },
                  ].map((item, i) => (
                    <FadeIn key={i} delay={i * 0.08}>
                      <div className="flex items-center gap-3.5 group/item">
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-110" style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: item.color,
                        }}>
                          {item.icon}
                        </div>
                        <span className="text-sm font-semibold text-white/60 group-hover/item:text-white/80 transition-colors">
                          {item.label}
                        </span>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </FadeIn>

              {/* 오른쪽 스탯 그리드 */}
              <FadeIn delay={0.15}>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Activity size={16} />,
                      label: t("효율성", "Efficiency", "効率性", "效率", lang),
                      desc: t("불필요한 복용 제거", "Eliminating redundant doses", "無駄な摂取を排除", "消除冗余摄入", lang),
                      value: "+94%",
                      progress: 94,
                      color: "#34d399",
                      bg: "rgba(52,211,153,0.08)",
                      border: "rgba(52,211,153,0.18)",
                    },
                    {
                      icon: <Target size={16} />,
                      label: t("정확도", "Accuracy", "正確度", "准确度", lang),
                      desc: t("성분 충돌 감지율", "Interaction detection rate", "成分衝突検出率", "成分冲突检测率", lang),
                      value: "99.9%",
                      progress: 99.9,
                      color: "#22d3ee",
                      bg: "rgba(34,211,238,0.08)",
                      border: "rgba(34,211,238,0.18)",
                    },
                    {
                      icon: <Cpu size={16} />,
                      label: t("AI 딥 분석", "AI Deep Analysis", "AIディープ分析", "AI深度分析", lang),
                      desc: t("단순 속도보다 정확한 AI 추론", "Accurate AI reasoning over raw speed", "速さより正確なAI推論", "精确的AI推理优于速度", lang),
                      value: "AI",
                      progress: 92,
                      color: "#818cf8",
                      bg: "rgba(129,140,248,0.08)",
                      border: "rgba(129,140,248,0.18)",
                    },
                    {
                      icon: <Globe size={16} />,
                      label: t("데이터 갱신", "Data Refresh", "データ更新", "数据更新", lang),
                      desc: t("실시간 DB 동기화", "Real-time DB sync", "リアルタイムDB同期", "实时数据库同步", lang),
                      value: "24/7",
                      progress: 100,
                      color: "#fb923c",
                      bg: "rgba(251,146,60,0.08)",
                      border: "rgba(251,146,60,0.18)",
                    },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.03, y: -4 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="rounded-2xl p-5 flex flex-col gap-3 cursor-default"
                      style={{ background: s.bg, border: `1px solid ${s.border}` }}
                    >
                      {/* 상단: 아이콘 + 라벨 */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                          style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color }}>
                          {s.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: s.color }}>
                          {s.label}
                        </span>
                      </div>

                      {/* 수치 */}
                      <div className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                        {s.value}
                      </div>

                      {/* 설명 */}
                      <p className="text-[10px] font-medium leading-snug" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {s.desc}
                      </p>

                      {/* 프로그레스 바 */}
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${s.color}80, ${s.color})` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMMITMENT + CTA
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-16 md:py-28 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8" style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              boxShadow: "0 0 40px rgba(16,185,129,0.15)",
            }}>
              <Globe size={28} className="text-emerald-400" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
              {t(
                <>건강을 사랑하는 전문가들이<br />함께 만들어갑니다</>,
                <>Built by Experts Who<br />Care About Health</>,
                <>健康を愛する専門家たちが<br />共に作り上げています</>,
                <>热爱健康的专家们<br />共同打造</>,
                lang
              )}
            </h2>

            <p className="text-sm md:text-base text-white/40 leading-relaxed mb-10 max-w-xl mx-auto">
              {t(
                "우리는 기술이 인간의 건강을 침해하지 않고, 더 나은 삶을 위한 가장 강력한 도구가 되도록 노력합니다.",
                "We strive for technology to be the most powerful tool for a better life, without compromising human health.",
                "私たちは、技術が人間の健康を損なうことなく、より良い生活のための最も強力なツールとなるよう努めています。",
                "我们致力于让技术成为改善生活的强大工具，而不损害人类健康。",
                lang
              )}
            </p>

            <div className="inline-flex flex-col items-center gap-2 px-8 py-5 rounded-2xl mb-14" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                {t("운영 주체", "Operating Entity", "運営主体", "运营主体", lang)}
              </span>
              <span className="text-xl md:text-2xl font-black tracking-tight" style={{
                background: "linear-gradient(135deg, #34d399, #22d3ee, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Team ZestPair AI Labs
              </span>
            </div>
          </FadeIn>

          {/* CTA 버튼 */}
          <FadeIn delay={0.2}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm transition-all"
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #0891b2 100%)",
                  color: "#fff",
                  boxShadow: "0 12px 40px rgba(16,185,129,0.35)",
                }}
              >
                {t("분석 시작하기", "Start Analysis", "分析を開始する", "开始分析", lang)}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <div className="relative z-10 pb-12 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.1)" }}>
          © 2026 ZESTPAIR · {t("모든 시스템 정상 작동 중", "ALL SYSTEMS OPERATIONAL", "全システム稼働中", "所有系统正常运行", lang)}
        </p>
      </div>

    </div>
  );
}
