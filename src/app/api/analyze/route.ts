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
        const cacheKey = `${language}:${[...ingredient_ids].sort().join(",")}`;
        
        // 2. 캐시 확인
        if (analysisCache.has(cacheKey)) {
            console.log("[Kodari Cache] Serving analysis from server memory! 🚀");
            return NextResponse.json({ success: true, data: analysisCache.get(cacheKey) });
        }

        // 3. 동시 요청 합치기 (Request Collapsing ✨)
        if (pendingRequests.has(cacheKey)) {
            console.log("[Kodari Pool] Waiting for existing Gemini request... ⏳");
            const result = await pendingRequests.get(cacheKey);
            return NextResponse.json({ success: true, data: result });
        }

        // 4. 새 요청 생성 및 풀에 등록
        const analysisPromise = (async () => {
            try {
                // 분석에 필요한 성분 데이터 로드
                const { data: allIngredients } = await supabase
                    .from("ingredients")
                    .select("*")
                    .order("sort_order", { ascending: true });

                if (!allIngredients) throw new Error("Failed to fetch ingredients");

                const selectedIngredients = (allIngredients as Ingredient[]).filter(ing => 
                    ingredient_ids.includes(ing.id)
                );

                if (selectedIngredients.length < 2) throw new Error("At least 2 ingredients required");

                // 분석 실행
                const res = await performAnalysis(
                    selectedIngredients, 
                    language || "ko", 
                    allIngredients as Ingredient[]
                );
                
                if (res) {
                    analysisCache.set(cacheKey, res);
                }
                return res;
            } finally {
                // 완료 후 풀에서 제거
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
