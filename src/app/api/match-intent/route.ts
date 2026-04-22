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

    const cacheKey = intent.trim().toLowerCase();

    // 1. 캐시 확인
    if (intentCache.has(cacheKey)) {
      console.log(`[AI Match Cache] Hit for: "${cacheKey}" 🚀`);
      return NextResponse.json({ success: true, data: intentCache.get(cacheKey) });
    }

    // 2. 전체 성분 목록 가져오기 (Gemini에게 전달용)
    const { data: ingredients, error: dbError } = await supabase
      .from("ingredients")
      .select("id, name, short_description");

    if (dbError || !ingredients) {
      throw new Error("Failed to fetch ingredients from database");
    }

    // 3. Gemini 매칭 실행
    const matchedIds = await matchIngredientsByIntent(intent, ingredients);

    // 4. 결과 캐싱 (성공적인 경우에만)
    if (matchedIds && matchedIds.length > 0) {
      intentCache.set(cacheKey, matchedIds);
    }

    return NextResponse.json({ success: true, data: matchedIds });
  } catch (error: any) {
    console.error("API /api/match-intent Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
