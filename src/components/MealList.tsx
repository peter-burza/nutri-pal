"use client"

import { useMealStore } from "@/stores/useMealStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { deleteMeal, getTodayMeals, Meal } from "@/lib/firebase/firestore"
import { getTodayDateString } from "@/lib/utils/date"
import { Utensils, Edit2, Trash2, AlertCircle } from "lucide-react"
import { useState } from "react"

interface MealListProps {
  onEdit: (meal: Meal) => void
}

export default function MealList({ onEdit }: MealListProps) {
  const { todayMeals, setTodayMeals } = useMealStore()
  const { user } = useAuthStore()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (mealId: string) => {
    if (!user) return
    if (!window.confirm("Are you sure you want to delete this meal?")) return

    setDeletingId(mealId)
    try {
      await deleteMeal(user.uid, mealId)
      const updatedMeals = await getTodayMeals(user.uid, getTodayDateString())
      setTodayMeals(updatedMeals)
    } catch (error) {
      console.error("Error deleting meal:", error)
    } finally {
      setDeletingId(null)
    }
  }

  if (todayMeals.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Utensils className="h-10 w-10 text-slate-200" />
        </div>
        <h4 className="text-slate-900 font-bold mb-1">No meals logged yet</h4>
        <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Your daily progress will appear here as you log meals.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Entry Log</h4>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
          {todayMeals.length} MEALS
        </span>
      </div>
      <ul className="divide-y divide-slate-50">
        {todayMeals.map((meal) => (
          <li key={meal.id} className="p-5 hover:bg-slate-50/50 transition-all group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  {meal.mealType}
                  <span className="text-[10px] font-medium text-slate-400 normal-case bg-slate-100 px-1.5 py-0.5 rounded">
                    {meal.createdAt?.toDate ? new Date(meal.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </h5>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Kcal</span>
                    <span className="text-xs xs:text-sm font-extrabold text-indigo-600">{meal.kcal}</span>
                  </span>
                  <span className="flex items-center gap-1 border-l border-slate-200 pl-2 xs:pl-4">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">P</span>
                    <span className="text-xs xs:text-sm font-extrabold text-emerald-600">{meal.proteins}g</span>
                  </span>
                  {meal.carbohydrates !== undefined && (
                    <span className="hidden ss:flex items-center gap-1 border-l border-slate-200 pl-2 xs:pl-4 text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-tighter">C</span>
                      <span className="text-xs font-semibold">{meal.carbohydrates}g</span>
                    </span>
                  )}
                  {meal.fats !== undefined && (
                    <span className="hidden ss:flex items-center gap-1 border-l border-slate-200 pl-2 xs:pl-4 text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-tighter">F</span>
                      <span className="text-xs font-semibold">{meal.fats}g</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(meal)}
                  className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                  title="Edit meal"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(meal.id)}
                  disabled={deletingId === meal.id}
                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  title="Delete meal"
                >
                  {deletingId === meal.id ? <AlertCircle className="h-4 w-4 animate-pulse" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
