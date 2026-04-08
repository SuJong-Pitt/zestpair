"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Ingredient, AnalysisResult } from "@/types/database";

const MAX_BASKET_SIZE = 10;

interface BasketState {
    // State
    selectedIngredients: Ingredient[];
    isAnalyzing: boolean;
    hasResult: boolean;

    language: "ko" | "en";
    isBasketExpanded: boolean;
    analysisResult: AnalysisResult | null;

    // Actions
    addIngredient: (ingredient: Ingredient) => void;
    removeIngredient: (id: string) => void;
    toggleIngredient: (ingredient: Ingredient) => void;
    clearBasket: () => void;
    setAnalyzing: (value: boolean) => void;
    setHasResult: (value: boolean) => void;
    isSelected: (id: string) => boolean;
    setLanguage: (lang: "ko" | "en") => void;
    setBasketExpanded: (value: boolean) => void;
    setAnalysisResult: (result: AnalysisResult | null) => void;
}

/**
 * 영양제 바구니 Zustand 스토어
 * - persist 미들웨어로 localStorage와 자동 동기화
 * - 최대 10개 제한
 */
export const useBasketStore = create<BasketState>()(
    persist(
        (set, get) => ({
            selectedIngredients: [],
            isAnalyzing: false,
            hasResult: false,
            language: "ko",
            isBasketExpanded: false,
            analysisResult: null,

            addIngredient: (ingredient) => {
                const { selectedIngredients } = get();
                if (selectedIngredients.length >= MAX_BASKET_SIZE) return;
                if (selectedIngredients.some((i) => i.id === ingredient.id)) return;
                set({
                    selectedIngredients: [...selectedIngredients, ingredient],
                    hasResult: false, // 바구니 변경 시 결과 초기화
                    analysisResult: null
                });
            },

            removeIngredient: (id) => {
                set((state) => ({
                    selectedIngredients: state.selectedIngredients.filter((i) => i.id !== id),
                    hasResult: false, // 바구니 변경 시 결과 초기화
                    analysisResult: null
                }));
            },

            toggleIngredient: (ingredient) => {
                const { selectedIngredients, addIngredient, removeIngredient } = get();
                if (selectedIngredients.some((i) => i.id === ingredient.id)) {
                    removeIngredient(ingredient.id);
                } else {
                    addIngredient(ingredient);
                }
            },

            clearBasket: () => {
                set({ selectedIngredients: [], hasResult: false, analysisResult: null });
            },

            setAnalyzing: (value) => set({ isAnalyzing: value }),

            setHasResult: (value) => set({ hasResult: value }),

            isSelected: (id) => {
                return get().selectedIngredients.some((i) => i.id === id);
            },

            setLanguage: (lang) => set({ language: lang }),

            setBasketExpanded: (value) => set({ isBasketExpanded: value }),

            setAnalysisResult: (result) => set({ analysisResult: result }),
        }),
        {
            name: "zestpair-basket", // localStorage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // 이제 분석 결과도 로컬에 보관하여 로그인 없이도 히스토리 유지 가능 ✨
                selectedIngredients: state.selectedIngredients,
                language: state.language,
                analysisResult: state.analysisResult,
                hasResult: state.hasResult,
            }),
        }
    )
);

export { MAX_BASKET_SIZE };
