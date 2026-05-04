import { supabase } from "@/lib/supabase";
import type { Ingredient, Interaction, InteractionResult, AnalysisResult } from "@/types/database";
import { generateUnifiedAnalysis } from "./gemini";

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
        const ingA = selectedIngredients.find(i => i.id === c.interaction!.ingredient_a_id);
        const ingB = selectedIngredients.find(i => i.id === c.interaction!.ingredient_b_id);
        const isDrugRelated = (ingA && (ingA.category as string) === 'drugs') || (ingB && (ingB.category as string) === 'drugs');
        cautionPenalty += isDrugRelated ? 15 : 5;
    });

    conflicts.forEach(c => {
        if (!c.interaction) return;
        const ingA = selectedIngredients.find(i => i.id === c.interaction!.ingredient_a_id);
        const ingB = selectedIngredients.find(i => i.id === c.interaction!.ingredient_b_id);
        const isDrugRelated = (ingA && (ingA.category as string) === 'drugs') || (ingB && (ingB.category as string) === 'drugs');
        conflictPenalty += isDrugRelated ? 35 : 20;
    });

    const rawFoundationBonus = Math.max(0, (selectedIngredients.length - 2) * 10);
    const drugBurden = drugCount * 8;
    const foundationBonus = Math.max(0, rawFoundationBonus - drugBurden);

    const rawScore = 70 + synergyWeight + foundationBonus - cautionPenalty - conflictPenalty;
    const score = Math.max(5, Math.min(100, rawScore));

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
                // 중요: 전수 조사가 가능하도록 후보군(uniquePartnerIds)과 기존 바구니(ingredientIds)를 합쳐서 모든 관계를 가져옵니다.
                const uniquePartnerIds = [...new Set(partnerCandidates)];
                const allInterestedIds = [...new Set([...uniquePartnerIds, ...ingredientIds])];
                
                const { data: dbPartnerInteractions } = await supabase
                    .from("interactions")
                    .select("*")
                    .or(`ingredient_a_id.in.(${allInterestedIds.map(id => `"${id}"`).join(',')}),ingredient_b_id.in.(${allInterestedIds.map(id => `"${id}"`).join(',')})`);

                const allInts = (dbPartnerInteractions as Interaction[]) || [];

                // 4단계: 로컬 시뮬레이션 및 상위 티어 후보 수집
                const candidatePool: Array<{ pair: [Ingredient, Ingredient], interaction: Interaction, simScore: number }> = [];

                for (const partnerId of uniquePartnerIds) {
                    const partner = allIngredients.find(i => i.id === partnerId);
                    
                    // CRITICAL SAFETY CHECK: 의약품(drugs)은 어떤 경우에도 추천 파트너가 될 수 없음
                    if (!partner || partner.category === 'drugs') continue;

                    // 이 파트너가 현재 바구니 입장에서 가지는 "모든" 상호작용 (시너지, 주의, 충돌)
                    const simInteractions = allInts.filter(int => 
                        (int.ingredient_a_id === partnerId && ingredientIds.includes(int.ingredient_b_id)) ||
                        (int.ingredient_b_id === partnerId && ingredientIds.includes(int.ingredient_a_id))
                    );

                    // 현재 바구니 내부에 원래 있던 상호작용 개수 세기
                    const existingSynergiesCount = synergies.length;
                    const existingCautionPenalty = cautionPenalty;
                    const existingConflictPenalty = conflictPenalty;
                    
                    let simSynergyCount = existingSynergiesCount;
                    let simCautionPenalty = existingCautionPenalty;
                    let simConflictPenalty = existingConflictPenalty;
                    
                    const isPartnerDrug = (partner.category as string) === 'drugs';
                    const simDrugCount = drugCount + (isPartnerDrug ? 1 : 0);

                    simInteractions.forEach(pint => {
                        if (pint.type === "SYNERGY") simSynergyCount++;
                        else if (pint.type === "CAUTION") {
                            const otherId = pint.ingredient_a_id === partnerId ? pint.ingredient_b_id : pint.ingredient_a_id;
                            const otherIng = selectedIngredients.find(si => si.id === otherId);
                            const isOtherDrug = otherIng && (otherIng.category as string) === 'drugs';
                            const isPairDrugRelated = isPartnerDrug || isOtherDrug;
                            simCautionPenalty += isPairDrugRelated ? 15 : 5;
                        }
                        else if (pint.type === "CONFLICT") {
                            const otherId = pint.ingredient_a_id === partnerId ? pint.ingredient_b_id : pint.ingredient_a_id;
                            const otherIng = selectedIngredients.find(si => si.id === otherId);
                            const isOtherDrug = otherIng && (otherIng.category as string) === 'drugs';
                            const isPairDrugRelated = isPartnerDrug || isOtherDrug;
                            simConflictPenalty += isPairDrugRelated ? 35 : 20;
                        }
                    });

                    const simSynergyWeight = simSynergyCount * 20;
                    const simIngredientCount = selectedIngredients.length + 1;
                    const simRawFoundationBonus = Math.max(0, (simIngredientCount - 2) * 10);
                    const simDrugBurden = simDrugCount * 8;
                    const simFoundationBonus = Math.max(0, simRawFoundationBonus - simDrugBurden);

                    const simRawScoreResult = 70 + simSynergyWeight + simFoundationBonus - simCautionPenalty - simConflictPenalty;
                    const simScore = Math.max(5, Math.min(100, simRawScoreResult));

                    // 현재 점수보다 개선되거나, 최소한 점수가 유지되는 우수 후보를 풀에 추가
                    if (simScore >= score) {
                        const originInt = potentialSynergies.find(ps => 
                            (ps.ingredient_a_id === partnerId && ingredientIds.includes(ps.ingredient_b_id)) || 
                            (ps.ingredient_b_id === partnerId && ingredientIds.includes(ps.ingredient_a_id))
                        );
                        
                        if (originInt) {
                            const originIngId = originInt.ingredient_a_id === partnerId ? originInt.ingredient_b_id : originInt.ingredient_a_id;
                            const originIng = selectedIngredients.find(si => si.id === originIngId);
                            if (originIng) {
                                candidatePool.push({ pair: [originIng!, partner], interaction: originInt, simScore });
                            }
                        }
                    }
                }

                // 5단계: 상위 티어 필터링 및 랜덤 추출 (Variety ✨)
                if (candidatePool.length > 0) {
                    const maxSimScore = Math.max(...candidatePool.map(c => c.simScore));
                    // 최고 점수 대비 -3.0점 이내의 모든 후보를 상위 티어로 인정
                    const topTierCandidates = candidatePool.filter(c => c.simScore >= maxSimScore - 3.0);
                    
                    const winner = topTierCandidates[Math.floor(Math.random() * topTierCandidates.length)];
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


    // AI 통합 요약(브리핑 & 시간표) 1회 호출로 해결 ✨ (할당량 최적화)
    const { 
        briefing: ai_briefing, 
        schedule, 
        recommendation_targets, 
        lifestyle_guidelines,
        expected_timeline,
        synergy_jackpot,
        conflict_solution,
        meal_pairing,
        medication_safety,
        bio_metrics,
        scientific_mechanism,
        isFallback 
    } = await generateUnifiedAnalysis(
        selectedIngredients,
        { synergies, cautions, conflicts },
        score,
        language
    );

    return {
        ingredients: [...selectedIngredients],
        synergies, cautions, conflicts, score, summary,
        potentialSynergy,
        projectedScore,
        ai_briefing,
        recommendation_targets,
        lifestyle_guidelines,
        expected_timeline,
        synergy_jackpot,
        conflict_solution,
        meal_pairing,
        medication_safety,
        bio_metrics,
        scientific_mechanism,
        schedule,
        is_fallback: isFallback,
        analyzed_at: new Date().toISOString()
    };
}
