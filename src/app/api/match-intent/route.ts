import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { matchIngredientsByIntent } from "@/lib/gemini";

// Supabase 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// 서버 메모리 캐시 (할당량 절약 ✨)
const intentCache = new Map<string, string[]>();

export async function POST(request: Request) {
  try {
    const { intent } = await request.json();

    if (!intent || intent.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Intent is too short" }, { status: 400 });
    }

    const cacheKey = `intent:${intent.trim().toLowerCase()}`;

    // 1. [1차] 서버 메모리 캐시 확인
    if (intentCache.has(cacheKey)) {
      console.log(`[AI Match Cache] Hit for: "${cacheKey}" 🚀`);
      return NextResponse.json({ success: true, data: intentCache.get(cacheKey) });
    }

    // 2. [2차] DB 캐시 확인 (키워드 기반 유연한 검색 ✨)
    const keywordsForSearch = intent.split(/\s+/).filter((w: string) => w.length >= 2);
    
    let query = supabase.from("ai_analysis_cache").select("cache_key, response");
    
    // 모든 키워드가 포함된 캐시 키를 찾음 (예: "50대" AND "여자" AND "폐경")
    keywordsForSearch.forEach((word: string) => {
        query = query.like("cache_key", `%${word}%`);
    });

    const { data: dbCache } = await (query as any)
        .limit(1)
        .maybeSingle();

    if (dbCache) {
      console.log(`[AI Match DB] Found smart match in cache: "${dbCache.cache_key}" 💾`);
      intentCache.set(cacheKey, dbCache.response as any);
      return NextResponse.json({ success: true, data: dbCache.response });
    }

    // 3. 전체 성분 목록 가져오기
    const { data: ingredients, error: dbError } = await supabase
      .from("ingredients")
      .select("id, name, short_description, is_popular");

    if (dbError || !ingredients) {
      throw new Error("Failed to fetch ingredients from database");
    }

    try {
        // 4. Gemini 매칭 실행
        const matchedIds = await matchIngredientsByIntent(intent, ingredients);

        // 5. 결과 캐싱 (성공적인 경우에만)
        if (matchedIds && matchedIds.length > 0) {
            intentCache.set(cacheKey, matchedIds);
            
            // DB 저장 ✨
            await (supabase.from("ai_analysis_cache") as any).insert({
                cache_key: cacheKey,
                response: matchedIds,
                language: "ko"
            });
            console.log(`[AI Match DB] New intent result cached! ✅`);
        }

        return NextResponse.json({ success: true, data: matchedIds });
    } catch (geminiError: any) {
        console.warn("[Kodari Alert] Gemini Match Failed. Running heuristic local matching...");
        
        // 1. 질문에서 키워드 추출 (단어 단위 분리)
        const keywords: string[] = intent.split(/\s+/).filter((word: string) => word.length >= 2);
        
        // 2. 키워드가 성분명이나 설명에 포함된 것들 필터링
        const matchedByKeyword = (ingredients as any[]).filter((ing: any) => {
            return keywords.some((key: string) => 
                (ing.name as string).includes(key) || 
                (ing.short_description as string).includes(key)
            );
        });

        // 3. 키워드 매칭 결과가 있다면 그것을 사용, 없으면 인기 성분 사용
        let fallbackIds = matchedByKeyword.slice(0, 3).map((i: any) => i.id);
        
        if (fallbackIds.length === 0) {
            fallbackIds = (ingredients as any[])
                .filter((i: any) => i.is_popular)
                .slice(0, 3)
                .map((i: any) => i.id);
        }
            
        return NextResponse.json({ 
            success: true, 
            data: fallbackIds, 
            isFallback: true 
        });
    }
  } catch (error: any) {
    console.error("API /api/match-intent Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
