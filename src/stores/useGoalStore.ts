import { create } from "zustand"
import { Goals } from "@/lib/firebase/firestore"

interface GoalState {
  goals: Goals | null
  setGoals: (goals: Goals | null) => void
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: {
    kcal: 2000,
    proteins: 150,
    carbohydrates: 250,
    fats: 65,
  },
  setGoals: (goals) => set({ goals }),
}))
