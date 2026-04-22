import { NextRequest, NextResponse } from "next/server";
import { performAnalysis } from "@/lib/analysis";
import { supabase } from "@/lib/supabase";
import { Ingredient } from "@/types/database";

// 서버 메모리 캐시 (할당량 방어용 ✨)
const analysisCache = new Map<string, any>();
const pendingRequests = new Map<string, Promise<any>>(); // 진행 중인 요청 풀

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ingredient_ids, language } = body;

        if (!ingredient_ids || !Array.isArray(ingredient_ids)) {
            return NextResponse.json({ error: "Invalid ingredients" }, { status: 400 });
        }

        // 1. 캐시 키 생성 (성분 ID 정렬 + 언어)
        const cacheKey = `${language || "ko"}:${[...ingredient_ids].sort().join(",")}`;
        
        // 2. [1차] 서버 메모리 캐시 확인 (Hot Cache)
        if (analysisCache.has(cacheKey)) {
            console.log("[Kodari Cache] Serving analysis from server memory! 🚀");
            return NextResponse.json({ success: true, data: analysisCache.get(cacheKey) });
        }

        // 3. [2차] Supabase DB 캐시 확인 (Persistent Cache) ✨
        const { data: dbCache } = await (supabase
            .from("ai_analysis_cache") as any)
            .select("response")
            .eq("cache_key", cacheKey)
            .single();

        if (dbCache) {
            console.log("[Kodari DB] Serving analysis from Supabase cache! 💾");
            // 메모리 캐시에 동기화
            analysisCache.set(cacheKey, dbCache.response);
            return NextResponse.json({ success: true, data: dbCache.response });
        }

        // 4. [3차] 동시 요청 합치기 (Request Collapsing)
        if (pendingRequests.has(cacheKey)) {
            console.log("[Kodari Pool] Waiting for existing Gemini request... ⏳");
            const result = await pendingRequests.get(cacheKey);
            return NextResponse.json({ success: true, data: result });
        }

        // 5. [Final] 새 요청 생성 및 분석 실행
        const analysisPromise = (async () => {
            try {
                const { data: allIngredients } = await supabase
                    .from("ingredients")
                    .select("*")
                    .order("sort_order", { ascending: true });

                if (!allIngredients) throw new Error("Failed to fetch ingredients");

                const selectedIngredients = (allIngredients as Ingredient[]).filter(ing => 
                    ingredient_ids.includes(ing.id)
                );

                if (selectedIngredients.length < 2) throw new Error("At least 2 ingredients required");

                const res = await performAnalysis(
                    selectedIngredients, 
                    language || "ko", 
                    allIngredients as Ingredient[]
                );
                
                if (res && !res.is_fallback) {
                    // 메모리 캐시 저장
                    analysisCache.set(cacheKey, res);
                    
                    // DB 캐시 저장 (백그라운드에서 실행해도 되지만 안전하게 대기) ✨
                    const { error: insertError } = await (supabase.from("ai_analysis_cache") as any).insert({
                        cache_key: cacheKey,
                        response: res,
                        language: language || "ko"
                    });
                    
                    if (insertError) {
                        console.error("[Kodari DB] Insert Error:", insertError);
                    } else {
                        console.log("[Kodari DB] New analysis cached to Supabase! ✅");
                    }
                }
                return res;
            } finally {
                pendingRequests.delete(cacheKey);
            }
        })();

        pendingRequests.set(cacheKey, analysisPromise);
        const result = await analysisPromise;

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("API Analyze Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
