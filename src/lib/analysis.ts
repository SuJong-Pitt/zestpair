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

    // 3. 점수 계산 (먼저 수행하여 기준점 확보)
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

    // 4. 다이내믹 시너지 추천 로직 (성능 최적화 및 안정화 버전 ✨)
    let potentialSynergy: InteractionResult | null = null;
    let projectedScore = score;
    let bestSimScore = -1;

    try {
        // 1단계: 현재 선택된 성분들과 시너지가 있는 모든 상호작용을 한 번에 가져옴
        const { data: dbPotential } = await supabase
            .from("interactions")
            .select("*")
            .or(`ingredient_a_id.in.(${ingredientIds.map(id => `"${id}"`).join(',')}),ingredient_b_id.in.(${ingredientIds.map(id => `"${id}"`).join(',')})`)
            .eq("type", "SYNERGY");

        const potentialSynergies = (dbPotential as Interaction[]) || [];

        if (potentialSynergies.length > 0) {
            // 2단계: 파트너 후보군 추출 (현재 바구니에 없는 것만)
            const partnerCandidates = potentialSynergies
                .map(int => ingredientIds.includes(int.ingredient_a_id) ? int.ingredient_b_id : int.ingredient_a_id)
                .filter(id => !ingredientIds.includes(id));

            if (partnerCandidates.length > 0) {
                // 3단계: 후보 파트너들의 모든 상호작용을 벌크로 가져옴 (시뮬레이션용)
                const uniquePartnerIds = [...new Set(partnerCandidates)];
                const { data: dbPartnerInteractions } = await supabase
                    .from("interactions")
                    .select("*")
                    .or(`ingredient_a_id.in.(${uniquePartnerIds.map(id => `"${id}"`).join(',')}),ingredient_b_id.in.(${uniquePartnerIds.map(id => `"${id}"`).join(',')})`);

                const pInteractions = (dbPartnerInteractions as Interaction[]) || [];

                // 4단계: 로컬 시뮬레이션 및 최고 점수 후보군 수집
                const topCandidates: Array<{ pair: [Ingredient, Ingredient], interaction: Interaction, simScore: number }> = [];

                for (const partnerId of uniquePartnerIds) {
                    const partner = allIngredients.find(i => i.id === partnerId);
                    if (!partner || partner.category === 'drugs') continue;

                    const relevantInts = pInteractions.filter(pint => {
                        const otherId = pint.ingredient_a_id === partnerId ? pint.ingredient_b_id : pint.ingredient_a_id;
                        return ingredientIds.includes(otherId);
                    });

                    let newSynerCount = 0;
                    let newCautCount = 0;
                    let newConfCount = 0;

                    relevantInts.forEach(pint => {
                        if (pint.type === "SYNERGY") newSynerCount++;
                        else if (pint.type === "CAUTION") newCautCount++;
                        else if (pint.type === "CONFLICT") newConfCount++;
                    });

                    const boost = (newSynerCount * 20) + 10 - (newCautCount * 5) - (newConfCount * 20);
                    const simScore = Math.max(10, Math.min(100, score + boost));

                    if (simScore >= bestSimScore && (simScore >= score || topCandidates.length === 0)) {
                        const originInt = potentialSynergies.find(ps => ps.ingredient_a_id === partnerId || ps.ingredient_b_id === partnerId);
                        if (originInt) {
                            const originIngId = originInt.ingredient_a_id === partnerId ? originInt.ingredient_b_id : originInt.ingredient_a_id;
                            const originIng = selectedIngredients.find(si => si.id === originIngId);
                            
                            if (originIng) {
                                if (simScore > bestSimScore) {
                                    topCandidates.length = 0; // 더 높은 점수가 나오면 기존 후보지 비우기
                                    topCandidates.push({ pair: [originIng, partner], interaction: originInt, simScore });
                                    bestSimScore = simScore;
                                } else if (simScore === bestSimScore) {
                                    topCandidates.push({ pair: [originIng, partner], interaction: originInt, simScore }); // 동점일 경우 후보군에 추가
                                }
                            }
                        }
                    }
                }

                // 5단계: 최고 점수 후보군 중 랜덤 추출 (특정 부원료 고정 노출 방지)
                if (topCandidates.length > 0) {
                    const winner = topCandidates[Math.floor(Math.random() * topCandidates.length)];
                    potentialSynergy = { pair: winner.pair, interaction: winner.interaction };
                    projectedScore = winner.simScore;
                }
            }
        }
    } catch (err) {
        console.warn("Synergy search failed, but proceeding with base analysis:", err);
    }




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


    return {
        ingredients: [...selectedIngredients],
        synergies, cautions, conflicts, score, summary,
        potentialSynergy,
        projectedScore,
        analyzed_at: new Date().toISOString()
    };
}
