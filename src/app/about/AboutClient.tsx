"use client";

import { motion, Variants } from "framer-motion";
import { 
  ShieldCheck, Users, Target, Database, ChevronLeft, 
  BookOpen, HeartPulse, Sparkles, Zap, Globe, Cpu 
} from "lucide-react";
import Link from "next/link";
import { useBasketStore } from "@/store/basketStore";
import { BrandLogo, BrandName } from "@/components/BrandAssets";
import { cn } from "@/lib/utils";

/**
 * ZestPair 리뉴얼 About 페이지 (AI Intelligence Lab Edition ✨)
 */
export default function AboutClient() {
  const { language } = useBasketStore();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0,transparent_70%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* 헤더 */}
      <nav className="relative z-50 px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 md:gap-3">
          <BrandLogo size={28} className="md:size-8" />
          <BrandName size="text-lg md:text-xl" />
        </Link>
        <Link 
          href="/"
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft size={12} className="md:size-14" />
          {language === 'ko' ? '돌아가기' : language === 'ja' ? '戻る' : language === 'zh' ? '返回' : 'Back'}
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Sparkles size={12} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
              {language === 'ko' ? "우리의 비전" : language === 'ja' ? "私たちのビジョン" : language === 'zh' ? "我们的愿景" : "Our Visionary Hub"}
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className={cn(
            "text-[2.2rem] sm:text-5xl md:text-8xl font-[1000] tracking-tighter mb-6 md:mb-8 leading-[0.95] md:leading-[0.9]",
            (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
          )}>
            {language === 'ko' ? (
              <>AI가 재정의하는<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">완전한 영양의 균형</span></>
            ) : language === 'ja' ? (
              <>AIが再定義する<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">完全な栄養バランス</span></>
            ) : language === 'zh' ? (
              <>AI 重新定义的<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">完美营养平衡</span></>
            ) : (
              <>Redefining<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Nutritional Balance</span></>
            )}
          </motion.h1>
          
          <motion.p variants={itemVariants} className={cn(
            "text-base md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium mb-10 md:mb-12 px-2 md:px-0",
            (language === 'ja' || language === 'zh') ? "break-keep" : "break-words"
          )}>
            {language === 'ko' 
              ? 'ZestPair는 단순한 영양제 알리미가 아닙니다. 수천만 건의 과학적 데이터를 학습한 AI가 당신의 건강 최적화를 위해 실시간으로 성분 시너지를 분석하는 정보 공학 연구소입니다.' 
              : language === 'ja'
              ? 'ZestPairは、単なるサプリメントのアラームではありません。数千万件の科学的データを学習したAIが、あなたの健康を最適化するためにリアルタイムで成分のシナジーを分析する情報工学研究所です。'
              : language === 'zh'
              ? 'ZestPair 不仅仅是一个营养补充品提醒器。它是一个信息工程实验室，AI 通过学习数千万条科学数据，为您实时分析成分协同作用，以优化您的健康。'
              : 'ZestPair is more than just a supplement reminder. It is an information engineering lab where AI, trained on millions of scientific data points, analyzes ingredient synergies in real-time for your health optimization.'}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 md:gap-4 px-2">
             <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-xl md:text-2xl font-black text-emerald-400">10,000+</span>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Analyzed<br/>Ingredients</span>
             </div>
             <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-xl md:text-2xl font-black text-cyan-400">2.5v</span>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">AI Synergy<br/>Core Engine</span>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group relative p-6 md:p-10 rounded-2xl md:rounded-[3rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                <Target className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 tracking-tight">
                {language === 'ko' ? '데이터 정밀도' : language === 'ja' ? 'データの精度' : language === 'zh' ? '数据精准度' : 'Data Precision'}
              </h3>
              <p className={cn(
                "text-sm md:text-base text-slate-400 font-medium leading-relaxed",
                (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
              )}>
                {language === 'ko' 
                  ? '글로벌 의학 논문과 약리학 데이터베이스를 직접 연결하여, 가장 신뢰할 수 있는 화학적 근거를 바탕으로 분석합니다.' 
                  : language === 'ja'
                  ? '世界の医学論文や薬理学データベースと直接連携し、最も信頼できる科学的根拠に基づいて分析します。'
                  : language === 'zh'
                  ? '直接连接全球医学论文和药理学数据库，基于最可靠的科学依据进行分析。'
                  : 'By directly connecting global medical literature and pharmacological databases, we analyze based on the most reliable chemical evidence.'}
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group relative p-6 md:p-10 rounded-2xl md:rounded-[3rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-cyan-500" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 tracking-tight">
                {language === 'ko' ? '안전 최적화' : language === 'ja' ? '安全の最適化' : language === 'zh' ? '安全优化' : 'Safety First'}
              </h3>
              <p className={cn(
                "text-sm md:text-base text-slate-400 font-medium leading-relaxed",
                (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
              )}>
                {language === 'ko' 
                  ? '단순 추천을 넘어, 치명적인 부작용을 일으킬 수 있는 충돌 성분을 초단위로 스캔하여 사전에 완벽히 차단합니다.' 
                  : language === 'ja'
                  ? '単なる推奨にとどまらず、致命的な副作用を引き起こす可能性のある成分の衝突を秒単位でスキャンし、事前に完璧に遮断します。'
                  : language === 'zh'
                  ? '除了简单的推荐，我们还会秒级扫描可能导致致命副作用的冲突成分，并提前完全拦截。'
                  : 'Beyond simple recommendations, we scan for conflicting ingredients that could cause fatal side effects in seconds and block them in advance.'}
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group relative p-6 md:p-10 rounded-2xl md:rounded-[3rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                <Cpu className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 tracking-tight">
                {language === 'ko' ? 'AI 가이드' : language === 'ja' ? 'AIガイド' : language === 'zh' ? 'AI 指南' : 'AI Intelligence'}
              </h3>
              <p className={cn(
                "text-sm md:text-base text-slate-400 font-medium leading-relaxed",
                (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
              )}>
                {language === 'ko' 
                  ? '복잡한 약학 정보를 누구나 이해하기 쉬운 직관적인 스케줄로 변환하여, 스마트한 웰니스 루틴을 설계해 드립니다.' 
                  : language === 'ja'
                  ? '複雑な薬学情報を誰でも理解しやすい直感的なスケジュールに変換し、スマートなウェルネスルーチンを設計します。'
                  : language === 'zh'
                  ? '将复杂的药学信息转换为任何人都能理解的直观计划，为您设计智能的健康习惯。'
                  : 'We convert complex pharmaceutical information into an intuitive schedule that anyone can understand, designing a smart wellness routine for you.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Data Flow Section */}
      <section className="relative py-12 md:py-32 px-4 md:px-6">
        <div className="max-w-6xl mx-auto rounded-3xl md:rounded-[4rem] bg-white/[0.02] border border-white/5 p-6 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <Globe size={300} className="text-emerald-500/30" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit">
                <Zap size={12} className="text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {language === 'ko' ? "데이터 파이프라인" : language === 'ja' ? "データパイプライン" : language === 'zh' ? "数据流水线" : "Data Pipeline"}
                </span>
              </div>
              <h2 className={cn(
                "text-4xl md:text-5xl font-[1000] tracking-tighter mb-8 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent",
                (language === 'ja' || language === 'zh') ? "break-all" : "break-words"
              )}>
                {language === 'ko' ? '초대형 연구 데이터를 바탕으로 한 신뢰의 원천' : language === 'ja' ? '巨大な研究データに基づいた信頼の源' : language === 'zh' ? '基于巨量研究数据的信任之源' : 'Trust Built on Massive Research Data'}
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <BookOpen size={18} />, title: language === 'ko' ? '글로벌 학술 자료 라이브러리' : language === 'ja' ? '世界の学術資料ライブラリ' : language === 'zh' ? '全球学术资料库' : 'Global Academic Library' },
                  { icon: <Database size={18} />, title: language === 'ko' ? '실시간 식약처 및 보건기구 연동' : language === 'ja' ? 'リアルタイムの保健機関との連携' : language === 'zh' ? '实时连接卫生机构' : 'Real-time Health Org Sync' },
                  { icon: <HeartPulse size={18} />, title: language === 'ko' ? '전문 약리학 분석 알고리즘' : language === 'ja' ? '専門的な薬理学分析アルゴリズム' : language === 'zh' ? '专业药理学分析算法' : 'Pharmacological Algorithms' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-slate-300">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-400 border border-white/10">
                      {item.icon}
                    </div>
                    <span className="font-bold text-sm md:text-base">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
               <div className="aspect-square rounded-2xl md:rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-4 md:p-8 flex flex-col justify-between">
                  <div className="text-emerald-400 font-black text-[10px] md:text-xs uppercase tracking-widest leading-none">{language === 'ko' ? "효율성" : language === 'ja' ? "効率性" : language === 'zh' ? "效率" : "Efficiency"}</div>
                  <div className="text-3xl md:text-4xl font-black tracking-tight text-white">+94%</div>
               </div>
               <div className="aspect-square rounded-2xl md:rounded-3xl bg-blue-500/10 border border-blue-500/20 p-4 md:p-8 flex flex-col justify-between">
                  <div className="text-blue-400 font-black text-[10px] md:text-xs uppercase tracking-widest leading-none">{language === 'ko' ? "정확도" : language === 'ja' ? "正確度" : language === 'zh' ? "准确度" : "Accuracy"}</div>
                  <div className="text-3xl md:text-4xl font-black tracking-tight text-white">99.9</div>
               </div>
               <div className="col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-2">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{language === 'ko' ? "우리의 약속" : language === 'ja' ? "私たちの約束" : language === 'zh' ? "我们的承诺" : "Our Commitment"}</div>
                  <p className="text-sm font-bold text-slate-400">
                    {language === 'ko' 
                      ? '우리는 기술이 인간의 건강을 침해하지 않고, 더 나은 삶을 위한 가장 강력한 도구가 되도록 노력합니다.' 
                      : language === 'ja'
                      ? '私たちは、技術が人間の健康を損なうことなく、より良い生活のための最も強力なツールとなるよう努めています。'
                      : language === 'zh'
                      ? '我们致力于让技术成为改善生活的强大工具，而不损害人类健康。'
                      : 'We strive for technology to be the most powerful tool for a better life, without compromising human health.'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <Users className="text-emerald-400" size={32} />
          </div>
          <h2 className="text-4xl font-[1000] tracking-tighter mb-10 leading-tight">
            {language === 'ko' ? (
              <>건강을 사랑하는 전문가들이<br/>함께 만들어갑니다</>
            ) : language === 'ja' ? (
              <>健康を愛する専門家たちが<br/>共に作り上げています</>
            ) : language === 'zh' ? (
              <>热爱健康的专家们<br/>共同打造</>
            ) : (
              <>Built by Experts<br/>Who Care About Health</>
            )}
          </h2>
          <div className="inline-flex flex-col items-center gap-2 p-6 rounded-3xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose">
              {language === 'ko' ? "운영 주체" : language === 'ja' ? "運営主体" : language === 'zh' ? "运营主体" : "Operating Entity"}
            </span>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Team ZestPair AI Labs</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="py-24 text-center">
        <Link 
          href="/"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-emerald-500 text-[#030712] font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(16,185,129,0.3)]"
        >
          {language === 'ko' ? '분석 시작하기' : language === 'ja' ? '分析を開始する' : language === 'zh' ? '开始分析' : 'Start Discovery'}
          <Zap size={16} fill="currentColor" />
        </Link>
        <p className="mt-20 text-[10px] text-slate-800 font-bold tracking-[0.3em] uppercase">
          © 2026 ZESTPAIR. {language === 'ko' ? "모든 시스템 정상 작동 중" : language === 'ja' ? "全システム稼働中" : language === 'zh' ? "所有系统正常运行" : "ALL SYSTEMS OPERATIONAL"}.
        </p>
      </div>
    </div>
  );
}
