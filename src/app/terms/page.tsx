"use client";

import { motion } from "framer-motion";
import { FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { BrandLogo, BrandName } from "@/components/BrandAssets";
import { useBasketStore } from "@/store/basketStore";

/**
 * ZestPair 고감도 이용약관 페이지 (AI Core v2.5 Design ✨)
 * 1인 기업 대표님의 법적 리스크를 제거하기 위해 코다리 부장이 깔끔하게 정리했습니다.
 */
export default function TermsPage() {
  const { language } = useBasketStore();

  const content = {
    ko: {
      title: "이용약관",
      lastUpdated: "최종 수정일: 2026년 4월 21일",
      sections: [
        {
          title: "1. 목적",
          body: "본 약관은 ZestPair(이하 '서비스')가 제공하는 AI 영양제 분석 및 관련 제반 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리, 의무 및 책임 사항 등을 규정함을 목적으로 합니다."
        },
        {
          title: "2. 서비스의 제공 및 변경",
          body: "ZestPair는 이용자에게 아래와 같은 기능을 제공합니다.\n- AI 기반 영양제 상호작용 및 시너지 분석\n- 개인별 최적 영양제 복용 시간표 생성\n- 기타 서비스가 정하는 부가 기능\n\n서비스의 내용이나 기술적 사양이 변경될 경우, 이를 이용자에게 공지하거나 서비스 내에 업데이트합니다."
        },
        {
          title: "3. 이용자의 의무",
          body: "이용자는 본 서비스를 이용할 때 다음의 행위를 해서는 안 됩니다.\n- 서비스의 정상적인 운영을 방해하는 행위\n- 타인의 정보를 도용하거나 허위 정보를 입력하는 행위\n- 서비스에서 얻은 정보를 상업적 목적으로 재배포하는 행위 (사전 협의 없는 경우)"
        },
        {
          title: "4. 면책 사항 (의학적 조언 아님)",
          body: "ZestPair가 제공하는 모든 분석 결과와 정보는 AI 기반의 참고 자료일 뿐이며, 전문적인 의학적 진단이나 조언을 대체할 수 없습니다. 이용자는 실제 영양제 섭취 전 반드시 전문가(의사, 약사 등)와 상의해야 하며, 서비스 이용으로 발생하는 모든 문제에 대한 책임은 이용자 본인에게 있습니다."
        },
        {
          title: "5. 저작권의 귀속",
          body: "ZestPair가 작성한 디자인, 로고, AI 알고리즘 등에 관한 저작권 및 기타 지식재산권은 ZestPair에 귀속됩니다."
        }
      ]
    },
    en: {
      title: "Terms of Service",
      lastUpdated: "Last Updated: April 21, 2026",
      sections: [
        {
          title: "1. Purpose",
          body: "The purpose of these Terms of Service is to define the conditions, procedures, rights, duties, and responsibilities for using ZestPair (the 'Service') and its AI-driven supplement analysis features."
        },
        {
          title: "2. Provision of Service",
          body: "ZestPair provides the following functions:\n- AI-based supplement interaction and synergy analysis\n- Personalized supplement intake schedule generation\n- Other additional features as defined by the Service\n\nNotice will be provided of updates or changes to service content."
        },
        {
          title: "3. User Obligations",
          body: "Users must not engage in the following acts while using the service:\n- Interfering with the normal operation of the service\n- Using another person's information or entering false information\n- Redistributing info for commercial purposes without prior agreement"
        },
        {
          title: "4. Disclaimer (No Medical Advice)",
          body: "All analysis results provided by ZestPair are for reference only and do not replace professional medical advice. Users must consult with a healthcare professional (doctor, pharmacist, etc.) before taking supplements. The Service is not responsible for any issues arising from its use."
        },
        {
          title: "5. Intellectual Property",
          body: "The copyrights to the design, logo, and AI algorithms created by ZestPair belong to ZestPair."
        }
      ]
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-cyan-500/30">
      {/* 배경 장식 */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-20">
        {/* 헤더 */}
        <div className="flex flex-col items-center mb-16">
          <Link 
            href="/"
            className="group flex items-center gap-2 mb-10 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-slate-400 hover:text-white"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>{language === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}</span>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <BrandLogo size={40} />
            <BrandName size="text-4xl" />
          </div>

          <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <FileText size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Service Terms</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter mb-4 text-center">
            {t.title}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            {t.lastUpdated}
          </p>
        </div>

        {/* 본문 컨텐츠 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {t.sections.map((section, idx) => (
            <section key={idx} className="group">
              <h2 className="text-xl font-black mb-4 flex items-center gap-3 text-cyan-400/90 group-hover:text-cyan-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                {section.title}
              </h2>
              <div 
                className="text-slate-400 text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.04] transition-all"
              >
                {section.body}
              </div>
            </section>
          ))}

          {/* 안내 */}
          <section className="pt-8 border-t border-white/10">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] text-center">
              <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed max-w-lg mx-auto font-medium">
                {language === 'ko' 
                  ? 'ZestPair 이용약관 및 서비스 운영과 관련하여 궁금한 점이 있으시면 언제든지 고객센터로 연락 주시기 바랍니다.'
                  : 'If you have any questions regarding the ZestPair Terms of Service and service operation, please feel free to contact us.'}
              </p>
            </div>
          </section>
        </motion.div>

        {/* 푸터 카피 */}
        <div className="mt-24 text-center">
          <p className="text-[10px] text-slate-700 font-bold tracking-[0.25em] uppercase">
            © 2026 ZESTPAIR. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  );
}
