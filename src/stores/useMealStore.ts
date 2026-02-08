import { create } from "zustand"
import { Meal } from "@/lib/firebase/firestore"

interface MealState {
  todayMeals: Meal[]
  setTodayMeals: (meals: Meal[]) => void
  addMeal: (meal: Meal) => void
}

export const useMealStore = create<MealState>((set) => ({
  todayMeals: [],
  setTodayMeals: (meals) => set({ todayMeals: meals }),
  addMeal: (meal) => set((state) => ({
    todayMeals: [...state.todayMeals, meal].sort((a, b) => {
      // Small sorting logic based on meal type if needed, or by createdAt
      return new Date(a.createdAt?.toDate?.() || 0).getTime() -
        new Date(b.createdAt?.toDate?.() || 0).getTime()
    })
  })),
}))
