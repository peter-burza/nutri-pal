"use client"

import { useMealStore } from "@/stores/useMealStore"
import { useGoalStore } from "@/stores/useGoalStore"
import { useState } from "react"
import { ChevronDown, Zap, Activity } from "lucide-react"

export default function DailySummary() {
  const { todayMeals } = useMealStore()
  const { goals } = useGoalStore()
  const [showMacros, setShowMacros] = useState(false)

  if (!goals) return null

  const totals = todayMeals.reduce(
    (acc, meal) => ({
      kcal: acc.kcal + (meal.kcal || 0),
      proteins: acc.proteins + (meal.proteins || 0),
      carbohydrates: acc.carbohydrates + (meal.carbohydrates || 0),
      fats: acc.fats + (meal.fats || 0),
    }),
    { kcal: 0, proteins: 0, carbohydrates: 0, fats: 0 }
  )

  const kcalProgress = goals.kcal > 0 ? Math.min((totals.kcal / goals.kcal) * 100, 100) : 0
  const proteinsProgress = goals.proteins > 0 ? Math.min((totals.proteins / goals.proteins) * 100, 100) : 0
  const carbsProgress = goals.carbohydrates > 0 ? Math.min((totals.carbohydrates / goals.carbohydrates) * 100, 100) : 0
  const fatsProgress = goals.fats > 0 ? Math.min((totals.fats / goals.fats) * 100, 100) : 0

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
      <div className="flex items-center gap-2 mb-8">
        <Activity className="h-5 w-5 text-indigo-600" />
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Daily Summary</h3>
      </div>

      <div className="space-y-10">
        {/* Calories Progress */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Energy Balance</span>
              <span className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                {totals.kcal}
                <span className="text-xs font-bold text-slate-300">/ {goals.kcal} kcal</span>
              </span>
            </div>
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border-2 ${kcalProgress >= 100 ? 'bg-indigo-600 border-indigo-100 text-white' : 'bg-indigo-50/50 border-indigo-50 text-indigo-600'}`}>
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="w-full bg-slate-50 rounded-full h-5 overflow-hidden border border-slate-100 p-1">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${kcalProgress >= 100 ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-indigo-500'}`}
              style={{ width: `${kcalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Proteins Progress */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Protein Goal</span>
              <span className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                {totals.proteins}g
                <span className="text-xs font-bold text-slate-300">/ {goals.proteins}g</span>
              </span>
            </div>
            <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              {Math.round(proteinsProgress)}%
            </div>
          </div>
          <div className="w-full bg-slate-50 rounded-full h-4 overflow-hidden border border-slate-100 p-0.5">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${proteinsProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Accordion for Carbs & Fats */}
        <div className="border-t border-slate-50 pt-8">
          <button
            onClick={() => setShowMacros(!showMacros)}
            className="flex items-center justify-between w-full text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest cursor-pointer group"
          >
            <span>Other Macronutrients</span>
            <div className={`p-1.5 rounded-xl transition-all ${showMacros ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 group-hover:bg-indigo-50'}`}>
              <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${showMacros ? "rotate-180" : ""}`} />
            </div>
          </button>

          <div className={`grid transition-all duration-500 ease-in-out ${showMacros ? "grid-rows-[1fr] opacity-100 mt-8" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden space-y-8">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Carbohydrates</span>
                  <span className="text-[11px] font-black text-amber-600">{totals.carbohydrates}g <span className="text-slate-300">/ {goals.carbohydrates}g</span></span>
                </div>
                <div className="w-full bg-slate-50 rounded-full h-2.5 border border-slate-100 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${carbsProgress}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fats</span>
                  <span className="text-[11px] font-black text-rose-600">{totals.fats}g <span className="text-slate-300">/ {goals.fats}g</span></span>
                </div>
                <div className="w-full bg-slate-50 rounded-full h-2.5 border border-slate-100 overflow-hidden">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${fatsProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
