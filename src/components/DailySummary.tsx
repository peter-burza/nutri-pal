"use client"

import { useMealStore } from "@/stores/useMealStore"
import { useGoalStore } from "@/stores/useGoalStore"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

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
    <div className="bg-white p-6 rounded-2xl border border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Daily Progress</h3>

      <div className="space-y-8">
        {/* Calories Progress - MAJOR HIGHLIGHT */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-extrabold text-slate-900">Total Calories</span>
            <span className="text-sm font-bold text-indigo-600">
              {totals.kcal} / <span className="text-slate-400">{goals.kcal} kcal</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${kcalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Proteins Progress - SECONDARY HIGHLIGHT */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-extrabold text-slate-900">Total Proteins</span>
            <span className="text-sm font-bold text-emerald-600">
              {totals.proteins}g / <span className="text-slate-400">{goals.proteins}g</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${proteinsProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Accordion for Optional Macros */}
        <div className="border-t border-slate-100 pt-6">
          <button
            onClick={() => setShowMacros(!showMacros)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest cursor-pointer"
          >
            <span>Optional Macronutrients</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showMacros ? "rotate-180" : ""}`} />
          </button>

          <div className={`grid transition-all duration-300 ease-in-out ${showMacros ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Carbohydrates</span>
                  <span className="text-xs font-bold text-slate-600">{totals.carbohydrates}g / <span className="font-normal text-slate-400">{goals.carbohydrates}g</span></span>
                </div>
                <div className="w-full bg-slate-50 rounded-full h-2 border border-slate-100 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${carbsProgress}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Fats</span>
                  <span className="text-xs font-bold text-slate-600">{totals.fats}g / <span className="font-normal text-slate-400">{goals.fats}g</span></span>
                </div>
                <div className="w-full bg-slate-50 rounded-full h-2 border border-slate-100 overflow-hidden">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all duration-500"
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
