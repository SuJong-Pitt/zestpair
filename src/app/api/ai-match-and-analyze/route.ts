import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { matchIngredientsByIntent } from "@/lib/gemini";
import { performAnalysis } from "@/lib/analysis";
import type { Ingredient } from "@/types/database";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// 캐시 (할당량 절약 ✨)
const unifiedCache = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const { intent, language = "ko" } = await request.json();

    if (!intent || intent.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Intent is too short" }, { status: 400 });
    }

    const originalIntent = intent.trim().toLowerCase();
    
    // 1. 모드 감지 (전부 추천 vs 필요한 것만 추천) ✨
    const isAllMode = /전부|모두|다|all|everything|full/i.test(originalIntent);
    const isMinimalMode = /필요한|딱|필수|minimal|necessary|best/i.test(originalIntent);
    const modeSuffix = isAllMode ? ":all" : isMinimalMode ? ":minimal" : ":default";

    // 2. 키워드 정규화 (조사 제거 등 단순화)
    const keywords = originalIntent
        .split(/\s+/)
        .filter((w: string) => w.length >= 2)
        .map((w: string) => w.replace(/(에|의|를|을|은|는|도|가|이)$/, '')); // 기초적인 조사 제거
    
    const intentKey = `intent:${keywords.join('_')}${modeSuffix}`;

    // 1. [1차] 서버 메모리 캐시 확인
    if (unifiedCache.has(intentKey)) {
      console.log(`[Unified Match Cache] Hot Hit: "${intentKey}" 🚀`);
      return NextResponse.json({ success: true, data: unifiedCache.get(intentKey) });
    }

    // 2. [2차] DB 캐시 확인 (키워드 기반 스마트 검색 ✨)
    let matchedIds: string[] | null = null;

    if (keywords.length > 0) {
      let query = supabase.from("ai_analysis_cache").select("cache_key, response");
      keywords.slice(0, 3).forEach((word: string) => {
        query = query.like("cache_key", `%${word}%`);
      });
      query = query.like("cache_key", `%${modeSuffix}`);
      
      const { data: dbIntentCache } = await (query as any).limit(1).maybeSingle();
      if (dbIntentCache && Array.isArray(dbIntentCache.response)) {
        console.log(`[Unified Match DB] Intent match found: "${dbIntentCache.cache_key}" 💾`);
        matchedIds = dbIntentCache.response;
      }
    }

    // 3. 모든 성분 목록 가져오기 (필요한 경우에 대비)
    const { data: allIngredients, error: dbError } = await supabase
      .from("ingredients")
      .select("*")
      .order("sort_order", { ascending: true });

    if (dbError || !allIngredients) {
      throw new Error("Failed to fetch ingredients from database");
    }

    // 4. 매칭 결과가 없다면 Gemini 호출
    if (!matchedIds) {
      console.log(`[Unified Match Gemini] Matching intent via AI... 🤖`);
      matchedIds = await matchIngredientsByIntent(intent, allIngredients as any);
      
      // Intent 결과 캐싱 (DB)
      if (matchedIds && matchedIds.length > 0) {
        await (supabase.from("ai_analysis_cache") as any).insert({
          cache_key: intentKey,
          response: matchedIds,
          language
        });
      }
    }

    if (!matchedIds || matchedIds.length < 2) {
      return NextResponse.json({ success: false, error: "Insufficient matches", matchedIds });
    }

    // 5. [3차] 해당 조합에 대한 분석 결과가 이미 있는지 확인
    const analysisKey = `${language}:${[...matchedIds].sort().join(",")}`;
    const { data: dbAnalysisCache } = await (supabase.from("ai_analysis_cache") as any)
      .select("response")
      .eq("cache_key", analysisKey)
      .maybeSingle();

    if (dbAnalysisCache) {
      console.log(`[Unified Analysis DB] Full analysis found in cache! 💾`);
      const selectedIngredients = (allIngredients as Ingredient[]).filter(ing => 
        matchedIds!.includes(ing.id)
      );
      const finalData = { ingredients: selectedIngredients, analysisResult: dbAnalysisCache.response };
      unifiedCache.set(intentKey, finalData); // 메모리 캐시 동기화
      return NextResponse.json({ success: true, data: finalData });
    }

    // 6. 분석 결과가 없다면 최종 분석 실행
    console.log(`[Unified Analysis Gemini] Generating new synergy report... 🧪`);
    const selectedIngredients = (allIngredients as Ingredient[]).filter(ing => 
      matchedIds!.includes(ing.id)
    );

    const analysisResult = await performAnalysis(
      selectedIngredients,
      language,
      allIngredients as Ingredient[]
    );

    const finalData = { ingredients: selectedIngredients, analysisResult };

    // 7. 결과 캐싱 (분석 결과)
    if (analysisResult && !analysisResult.is_fallback) {
      await (supabase.from("ai_analysis_cache") as any).insert({
        cache_key: analysisKey,
        response: analysisResult,
        language
      });
      unifiedCache.set(intentKey, finalData); // 메모리 캐시 동기화
    }

    return NextResponse.json({ success: true, data: finalData });

  } catch (error: any) {
    console.error("API /api/ai-match-and-analyze Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
