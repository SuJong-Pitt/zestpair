"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Users, Target, Database, ChevronLeft, Mail, BookOpen, HeartPulse } from "lucide-react";
import Link from "next/link";
import { useBasketStore } from "@/store/basketStore";
import { UI_TRANSLATIONS } from "@/lib/i18n";
import VisualDecorations from "@/components/VisualDecorations";

export default function AboutClient() {
  const { language } = useBasketStore();
  const t = UI_TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32 text-center"
        style={{
          background: "radial-gradient(circle at 50% 0%, #0d1a15 0%, #080c14 50%, #030712 100%)"
        }}
      >
        <VisualDecorations />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 font-bold mb-8 hover:opacity-80 transition-opacity">
            <ChevronLeft size={16} />
            <span>{language === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}</span>
          </Link>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-[1000] text-white tracking-tighter mb-6"
          >
            {language === 'ko' ? '우리의 미션' : 'Our Mission'}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto font-medium"
          >
            {language === 'ko' 
              ? 'ZestPair는 AI 기술을 통해 복잡한 영양 성분 간의 상호작용을 분석하여, 누구나 안전하고 효과적으로 영양제를 섭취할 수 있도록 돕습니다.' 
              : 'ZestPair uses AI technology to analyze interactions between complex nutritional ingredients, helping everyone consume supplements safely and effectively.'}
          </motion.p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                <Target className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-[900] text-slate-900 tracking-tight">
                {language === 'ko' ? '데이터 기반의 정밀 분석' : 'Data-Driven Precision'}
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                {language === 'ko' 
                  ? 'ZestPair의 "AI Synergy Core v2.5"는 세계적인 의학 논문 데이터베이스, 식약처 공공 데이터, 전문 약리학 자료를 실시간으로 학습하여 가장 정확한 궁합 정보를 제공합니다.' 
                  : 'ZestPair\'s "AI Synergy Core v2.5" provides the most accurate synergy information by learning from global medical paper databases, FDA public data, and professional pharmacological resources in real-time.'}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-sm">
                <ShieldCheck className="text-blue-500" />
              </div>
              <h2 className="text-3xl font-[900] text-slate-900 tracking-tight">
                {language === 'ko' ? '안전 최우선 원칙' : 'Safety First Principle'}
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                {language === 'ko' 
                  ? '단순한 정보 전달을 넘어, 건강에 치명적일 수 있는 충돌 조합을 사전에 경고하여 사용자의 건강을 보호하는 것을 최우선 가치로 삼습니다.' 
                  : 'Beyond simply delivering information, our top priority is protecting users\' health by warning them in advance about conflict combinations that could be fatal to their health.'}
              </p>
            </motion.div>
          </div>

          {/* Team Section */}
          <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-xl shadow-slate-200/50 mb-24">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                <Users size={14} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Our Team</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-[1000] text-slate-900 tracking-tighter">
                {language === 'ko' ? '운영 주체 및 팀 소개' : 'Meet Our Team'}
              </h2>
            </div>
            
            <div className="prose prose-slate max-w-none text-slate-600 font-medium">
              <p className="text-center mb-8">
                {language === 'ko' 
                  ? 'ZestPair는 헬스테크 전문가, 데이터 사이언티스트, 그리고 건강을 사랑하는 개발팀이 함께 만들어가고 있습니다. 우리는 기술이 건강한 삶에 실질적인 도움을 줄 수 있다고 믿습니다.' 
                  : 'ZestPair is being built by health-tech experts, data scientists, and a development team that loves health. We believe technology can provide substantial help for a healthy life.'}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="font-black text-slate-900 mb-2">{language === 'ko' ? '운영 주체' : 'Operating Entity'}</h3>
                  <p className="text-sm">Team ZestPair</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="font-black text-slate-900 mb-2">{language === 'ko' ? '분석 방식' : 'Analysis Method'}</h3>
                  <p className="text-sm">{language === 'ko' ? '범용 의학 데이터베이스 및 학술 자료 기반 AI 분석' : 'AI analysis based on global medical databases and academic resources'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Section */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 rounded-full bg-emerald-500" />
              <h2 className="text-3xl font-[1000] text-slate-900 tracking-tighter">
                {language === 'ko' ? 'AI 분석 근거 데이터' : 'AI Evidence Data'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <BookOpen />, title: language === 'ko' ? '글로벌 학술 자료' : 'Global Academic Resources', desc: language === 'ko' ? '세계적인 의학 및 영양학 학술 논문 데이터베이스' : 'International medical and nutritional literature' },
                { icon: <Database />, title: language === 'ko' ? '공공 보건 정보' : 'Public Health Information', desc: language === 'ko' ? '글로벌 보건 기구 및 국가별 약물 정보 가이드' : 'Global health organization and national drug guides' },
                { icon: <HeartPulse />, title: language === 'ko' ? '표준 약전 가이드' : 'Pharmacy Guidelines', desc: language === 'ko' ? '성분별 상호작용 및 전문가 권장 가이드라인' : 'Ingredient interactions and expert guidelines' }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 font-bold">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>


        </div>
      </section>
      
    </div>
  );
}
