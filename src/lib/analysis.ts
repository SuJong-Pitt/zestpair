import { supabase } from "@/lib/supabase";
import type { Ingredient, Interaction, InteractionResult, AnalysisResult } from "@/types/database";

/**
 * 영양제 조합 분석 코어 로직 (AI 디자인실장 영자 & Pori AI 합작 ✨)
 */
export async function performAnalysis(
    selectedIngredients: Ingredient[],
    language: "ko" | "en",
    allIngredients: Ingredient[]
): Promise<AnalysisResult | null> {
    if (selectedIngredients.length < 2) return null;

    const ingredientIds = selectedIngredients.map((i) => i.id);
    
    // 1. 상호작용 데이터 가져오기
    const { data: dbInteractions } = await supabase
        .from("interactions")
        .select("*")
        .in("ingredient_a_id", ingredientIds)
        .in("ingredient_b_id", ingredientIds);

    const findInteraction = (idA: string, idB: string) => {
        const dbInts = (dbInteractions as Interaction[]) || [];
        return dbInts.find(i =>
            (i.ingredient_a_id === idA && i.ingredient_b_id === idB) ||
            (i.ingredient_a_id === idB && i.ingredient_b_id === idA)
        ) ?? null;
    };

    const synergies: InteractionResult[] = [];
    const cautions: InteractionResult[] = [];
    const conflicts: InteractionResult[] = [];

    // 2. 쌍별 상호작용 분류
    for (let i = 0; i < selectedIngredients.length; i++) {
        for (let j = i + 1; j < selectedIngredients.length; j++) {
            const ing1 = selectedIngredients[i];
            const ing2 = selectedIngredients[j];
            const interaction = findInteraction(ing1.id, ing2.id);
            const res: InteractionResult = { pair: [ing1, ing2], interaction };
            if (!interaction) continue;
            if (interaction.type === "SYNERGY") synergies.push(res);
            else if (interaction.type === "CAUTION") cautions.push(res);
            else if (interaction.type === "CONFLICT") conflicts.push(res);
        }
    }

    // 3. 다이내믹 시너지 추천 로직
    let potentialSynergy: InteractionResult | null = null;
    for (const ing of selectedIngredients) {
        const { data: dbPotential } = await supabase
            .from("interactions")
            .select("*")
            .or(`ingredient_a_id.eq.${ing.id},ingredient_b_id.eq.${ing.id}`)
            .eq("type", "SYNERGY");

        const potentialMatch = (dbPotential as Interaction[])?.find(int => {
            const partnerId = int.ingredient_a_id === ing.id ? int.ingredient_b_id : int.ingredient_a_id;
            const partner = allIngredients.find(i => i.id === partnerId);
            return !ingredientIds.includes(partnerId) && partner?.category !== 'drugs';
        });

        if (potentialMatch) {
            const partnerId = potentialMatch.ingredient_a_id === ing.id ? potentialMatch.ingredient_b_id : potentialMatch.ingredient_a_id;
            const partner = allIngredients.find(i => i.id === partnerId);
            if (partner) {
                potentialSynergy = {
                    pair: [ing, partner],
                    interaction: potentialMatch
                };
                break;
            }
        }
    }

    // 4. 점수 계산
    let synergyWeight = synergies.length * 20;
    let cautionPenalty = 0;
    let conflictPenalty = 0;
    let drugCount = selectedIngredients.filter(i => i.category === 'drugs').length;

    cautions.forEach(c => {
        if (!c.interaction) return;
        const isDrugRelated = selectedIngredients.find(i =>
            (i.id === c.interaction!.ingredient_a_id || i.id === c.interaction!.ingredient_b_id) && i.category === 'drugs'
        );
        cautionPenalty += isDrugRelated ? 15 : 5;
    });

    conflicts.forEach(c => {
        if (!c.interaction) return;
        const isDrugRelated = selectedIngredients.find(i =>
            (i.id === c.interaction!.ingredient_a_id || i.id === c.interaction!.ingredient_b_id) && i.category === 'drugs'
        );
        conflictPenalty += isDrugRelated ? 35 : 20;
    });

    const rawFoundationBonus = Math.max(0, (selectedIngredients.length - 2) * 10);
    const drugBurden = drugCount * 8;
    const foundationBonus = Math.max(0, rawFoundationBonus - drugBurden);

    const score = Math.max(5, Math.min(100, 70 + synergyWeight + foundationBonus - cautionPenalty - conflictPenalty));

    // 5. 요약 텍스트 생성
    let summary = "";
    if (language === "ko") {
        if (conflicts.length > 0) summary = `⚠️ ${conflicts.length}가지 충돌 조합이 발견되었습니다...`;
        else if (synergies.length > 0) summary = `✅ ${synergies.length}가지 시너지 조합이 발견되었습니다!`;
        else if (cautions.length > 0) summary = `🔶 ${cautions.length}가지 주의 조합이 발견되었습니다...`;
        else summary = "중립적인 조합입니다.";
    } else {
        if (conflicts.length > 0) summary = `⚠️ ${conflicts.length} conflicts detected...`;
        else if (synergies.length > 0) summary = `✅ ${synergies.length} synergies detected!`;
        else if (cautions.length > 0) summary = `🔶 ${cautions.length} cautions detected...`;
        else summary = "Neutral combination.";
    }

    // 6. 예상 점수 계산
    let projectedScore = score;
    if (potentialSynergy) {
        const partner = potentialSynergy.pair[1];
        const { data: allPartnerInteractions } = await supabase
            .from("interactions")
            .select("*")
            .or(`ingredient_a_id.eq.${partner.id},ingredient_b_id.eq.${partner.id}`);

        const relevantInteractions = (allPartnerInteractions as Interaction[])?.filter(int => {
            const otherId = int.ingredient_a_id === partner.id ? int.ingredient_b_id : int.ingredient_a_id;
            return ingredientIds.includes(otherId);
        }) || [];

        let newSynerCount = 0;
        let newCautCount = 0;
        let newConfCount = 0;

        relevantInteractions.forEach(int => {
            if (int.type === "SYNERGY") newSynerCount++;
            else if (int.type === "CAUTION") newCautCount++;
            else if (int.type === "CONFLICT") newConfCount++;
        });

        const boost = (newSynerCount * 20) + 10 - (newCautCount * 5) - (newConfCount * 20);
        projectedScore = Math.max(10, Math.min(100, score + boost));
    }

    return {
        ingredients: [...selectedIngredients],
        synergies, cautions, conflicts, score, summary,
        potentialSynergy,
        projectedScore,
        analyzed_at: new Date().toISOString()
    };
}
