// ============================================================
// Nutri-Mixer - Core TypeScript Type Definitions
// ============================================================

/**
 * 복용 권장 시간
 */
export type DosageTime = "before_meal" | "after_meal" | "any_time" | "morning" | "evening";

/**
 * 궁합 유형
 * - SYNERGY: 시너지 효과 (함께 먹으면 더 효과적)
 * - CAUTION: 주의 필요 (시간 간격을 두고 섭취 권장)
 * - CONFLICT: 충돌 (함께 섭취하면 효과 방해 또는 부작용)
 */
export type InteractionType = "SYNERGY" | "CAUTION" | "CONFLICT";

/**
 * 영양제 카테고리
 */
export type IngredientCategory =
  | "vitamins"
  | "minerals"
  | "omega"
  | "probiotics"
  | "herbs"
  | "amino_acids"
  | "antioxidants"
  | "hormones"
  | "enzymes"
  | "drugs"
  | "lipids"
  | "other";

/**
 * 영양제 성분 (Ingredient)
 * Supabase `ingredients` 테이블과 매핑
 */
export interface Ingredient {
  id: string; // UUID
  name: string; // 한국어 이름 (e.g. '비타민C')
  name_en: string; // 영문 이름 (e.g. 'Vitamin C')
  name_ja?: string; // 일문 이름 (e.g. 'ビタミンC')
  name_zh?: string; // 중문 이름 (e.g. '维生素C')
  slug: string; // URL-friendly 식별자 (e.g. 'vitamin-c')
  category: IngredientCategory;
  description: string; // 성분 상세 설명
  description_en?: string; // 영문 상세 설명
  description_ja?: string; // 일문 상세 설명
  description_zh?: string; // 중문 상세 설명
  short_description: string; // 카드에 표시할 한 줄 설명
  short_description_en?: string; // 영문 한 줄 설명
  short_description_ja?: string; // 일문 한 줄 설명
  short_description_zh?: string; // 중문 한 줄 설명
  dosage_time: DosageTime; // 권장 복용 시간
  dosage_note: string | null; // 복용량/방법 메모
  dosage_note_en?: string | null; // 영문 복용 방법 메모
  dosage_note_ja?: string | null; // 일문 복용 방법 메모
  dosage_note_zh?: string | null; // 중문 복용 방법 메모
  icon_emoji: string; // 대표 이모지 (e.g. '🍊')
  benefits: string[]; // 주요 효능 목록
  benefits_en?: string[]; // 영문 주요 효능 목록
  benefits_ja?: string[]; // 일문 주요 효능 목록
  benefits_zh?: string[]; // 중문 주요 효능 목록
  warnings: string[] | null; // 주의사항 목록
  warnings_en?: string[] | null; // 영문 주의사항 목록
  warnings_ja?: string[] | null; // 일문 주의사항 목록
  warnings_zh?: string[] | null; // 중문 주의사항 목록
  coupang_search_keyword: string; // 쿠팡 파트너스 검색 키워드
  amazon_search_keyword?: string; // 글로벌(영문) 사이트용 아마존 파트너스 키워드
  rakuten_search_keyword?: string; // 일본 사이트용 라쿠텐 검색 키워드
  tmall_search_keyword?: string; // 중국 사이트용 티몰 검색 키워드
  coupang_url?: string; // 직접 지정된 쿠팡 파트너스 링크
  amazon_url?: string; // 직접 지정된 아마존 파트너스 링크
  rakuten_url?: string; // 직접 지정된 라쿠텐 파트너스 링크
  tmall_url?: string; // 직접 지정된 티몰 파트너스 링크
  is_popular: boolean; // 인기 성분 여부 (홈 화면 우선 노출)
  sort_order: number; // 정렬 순서
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/**
 * 두 성분 간의 궁합 정보 (Interaction)
 * Supabase `interactions` 테이블과 매핑
 * ingredient_a_id < ingredient_b_id 순서로 저장하여 중복 방지
 */
export interface Interaction {
  id: string; // UUID
  ingredient_a_id: string; // UUID (FK → ingredients.id)
  ingredient_b_id: string; // UUID (FK → ingredients.id)
  type: InteractionType; // 궁합 유형
  title: string; // 궁합 요약 제목 (e.g. '흡수율 2배 상승!')
  title_en?: string; // 영문 궁합 요약 제목
  title_ja?: string; // 일문 궁합 요약 제목
  title_zh?: string; // 중문 궁합 요약 제목
  reason: string; // 전문적인 궁합 이유 설명
  reason_en?: string; // 영문 궁합 이유 설명
  reason_ja?: string; // 일문 궁합 이유 설명
  reason_zh?: string; // 중문 궁합 이유 설명
  recommendation: string | null; // 구체적인 복용 권장 방법
  recommendation_en?: string | null; // 영문 복용 권장 방법
  recommendation_ja?: string | null; // 일문 복용 권장 방법
  recommendation_zh?: string | null; // 중문 복용 권장 방법
  scientific_reference: string | null; // 근거 논문/출처 (선택)
  created_at: string;
  updated_at: string;
  // JOIN 시 추가되는 성분 정보 (API 응답용)
  ingredient_a?: Ingredient;
  ingredient_b?: Ingredient;
}

/**
 * 분석 결과 - 쌍(pair)별 궁합 요약
 */
export interface InteractionResult {
  pair: [Ingredient, Ingredient];
  interaction: Interaction | null; // null = 데이터 없음 (중립)
}

/**
 * 전체 분석 결과
 */
export interface AnalysisResult {
  ingredients: Ingredient[];
  synergies: InteractionResult[]; // SYNERGY 궁합
  cautions: InteractionResult[]; // CAUTION 궁합
  conflicts: InteractionResult[]; // CONFLICT 궁합
  score: number; // 전체 궁합 점수 0~100
  summary: string; // AI 생성 종합 요약
  potentialSynergy?: InteractionResult | null; // 추천용 잠재적 시너지 (데이터베이스 기반)
  projectedScore?: number; // 추천 성분 추가 시의 예상 점수
  analyzed_at: string; // 분석 시각 ISO 8601
  schedule?: ScheduleSlot[]; // AI생성 복용 시간표
  ai_briefing?: Array<{ headline: string; details: string } | string>; // AI가 생성한 프리미엄 브리핑 포인트 (새 구조와 구 구조 호환)
  recommendation_targets?: string[]; // AI가 분석한 '누구에게 좋은지' 대상 (신규) ✨
  lifestyle_guidelines?: string[]; // 함께하면 좋은 생활 습관/음식 가이드 ✨
  expected_timeline?: { // 4주 기대 효과 타임라인 ✨
    week1: string;
    week2: string;
    week4: string;
  };
  synergy_jackpot?: { // 가장 강력한 시너지 커플 하이라이트 ✨
    pair_names: string;
    reason: string;
  } | null;
  conflict_solution?: string | null; // 주의/충돌 조합에 대한 AI의 해결책 설명 ✨
  meal_pairing?: string[]; // 영양제와 궁합이 좋은 음식 추천 ✨
  medication_safety?: string | null; // 의약품 포함 시 전용 안전 가이드 ✨
  is_fallback?: boolean; // AI 호출 실패로 인한 임시 데이터 여부 ✨
  impact_ratio?: { // (Legacy) 정신적 vs 신체적 영향력 비율
    mental: number;
    physical: number;
  };
  bio_metrics?: { // 6대 바이오 지표 (각 0~100) ✨
    focus: number;      // 정신/집중
    vitality: number;   // 신체/활력
    shield: number;     // 면역/보호
    beauty: number;     // 항노화/미용
    calm: number;       // 스트레스/수면
    metabolism: number; // 대사/소화
  };
  scientific_mechanism?: string | null; // 과학적 기전 상세 설명 (아코디언용) ✨
}

/**
 * AI 복용 시간표 상세 타입
 */
export interface ScheduleItem {
  ingredient_id: string;
  name: string;
  icon: string;
  note: string;
}

export interface ScheduleSlot {
  time_id: "morning_before" | "morning_after" | "lunch_after" | "evening_after" | "night_before" | "anytime";
  items: ScheduleItem[];
  ai_insight: string;
}


/**
 * 쿠팡 파트너스 상품 placeholder 타입
 */
export interface CoupangProduct {
  product_id: string;
  name: string;
  price: number;
  original_price: number | null;
  discount_rate: number | null;
  image_url: string;
  product_url: string; // 쿠팡 파트너스 어필리에이트 링크
  is_rocket: boolean; // 로켓배송 여부
  rating: number | null; // 평점 0~5
  review_count: number | null;
}

/**
 * 쿠팡 파트너스 응답 wrapping
 */
export interface CoupangAffiliateSlot {
  ingredient_name: string;
  search_keyword: string;
  products: CoupangProduct[];
}

// ============================================================
// AI 분석 캐시 (AI Analysis Cache)
// ============================================================

export interface AIAnalysisCache {
  cache_key: string;
  response: AnalysisResult;
  language: string;
  created_at: string;
}

// ============================================================
// API 요청/응답 타입
// ============================================================

export interface AnalyzeRequestPayload {
  ingredient_ids: string[];
}

export interface AnalyzeResponsePayload {
  success: boolean;
  data: AnalysisResult | null;
  error?: string;
}

// ============================================================
// Supabase Database 스키마 타입 (supabase-js 호환)
// ============================================================

export type Database = {
  public: {
    Tables: {
      ingredients: {
        Row: Ingredient;
        Insert: Omit<Ingredient, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Ingredient, "id" | "created_at" | "updated_at">>;
      };
      interactions: {
        Row: Omit<Interaction, "ingredient_a" | "ingredient_b">;
        Insert: Omit<
          Interaction,
          "id" | "created_at" | "updated_at" | "ingredient_a" | "ingredient_b"
        >;
        Update: Partial<
          Omit<Interaction, "id" | "created_at" | "updated_at" | "ingredient_a" | "ingredient_b">
        >;
      };
      ai_analysis_cache: {
        Row: AIAnalysisCache;
        Insert: Omit<AIAnalysisCache, "created_at">;
        Update: Partial<Omit<AIAnalysisCache, "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
