"use client"

import { useMealStore } from "@/stores/useMealStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { deleteMeal, getTodayMeals, updateMeal, Meal } from "@/lib/firebase/firestore"
import { getTodayDateString } from "@/lib/utils/date"
import { Utensils, Edit2, Trash2, AlertCircle, Clock, Info, Check, X, Loader2 } from "lucide-react"
import { useState } from "react"
import { MEAL_TYPES } from "@/lib/constants"
import FancySelect from "./FancySelect"

interface MealListProps {
  onEdit?: (meal: Meal) => void // Keep for backwards compatibility if needed, but we'll use inline
}

export default function MealList({ onEdit }: MealListProps) {
  const { todayMeals, setTodayMeals } = useMealStore()
  const { user } = useAuthStore()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editKcal, setEditKcal] = useState("")
  const [editProteins, setEditProteins] = useState("")
  const [editCarbs, setEditCarbs] = useState("")
  const [editFats, setEditFats] = useState("")
  const [editMealType, setEditMealType] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleDelete = async (mealId: string) => {
    if (!user) return
    if (!window.confirm("Are you sure you want to delete this entry?")) return

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

  const startEditing = (meal: Meal) => {
    setEditingId(meal.id)
    setEditName(meal.foodName)
    setEditKcal(meal.kcal.toString())
    setEditProteins(meal.proteins.toString())
    setEditCarbs(meal.carbohydrates?.toString() || "")
    setEditFats(meal.fats?.toString() || "")
    setEditMealType(meal.mealType)
  }

  const handleUpdate = async (mealId: string) => {
    if (!user) return
    setIsUpdating(true)
    try {
      await updateMeal(user.uid, mealId, {
        foodName: editName,
        mealType: editMealType,
        kcal: Number(editKcal),
        proteins: Number(editProteins),
        carbohydrates: editCarbs === "" ? undefined : Number(editCarbs),
        fats: editFats === "" ? undefined : Number(editFats),
      })
      setEditingId(null)
      const updatedMeals = await getTodayMeals(user.uid, getTodayDateString())
      setTodayMeals(updatedMeals)
    } catch (error) {
      console.error("Error updating meal:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (todayMeals.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm shadow-slate-200/50">
        <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Utensils className="h-10 w-10 text-slate-200" />
        </div>
        <h4 className="text-slate-900 font-bold mb-2 text-lg">No food logged today</h4>
        <p className="text-slate-400 text-sm max-w-[240px] mx-auto leading-relaxed">Your daily progress will appear here as you log meals.</p>
      </div>
    )
  }

  // Group meals by mealType string
  const groupedMeals = MEAL_TYPES.map(typeStr => ({
    label: typeStr,
    meals: todayMeals.filter(m => m.mealType === typeStr)
  })).filter(group => group.meals.length > 0)

  return (
    <div className="space-y-8">
      {groupedMeals.map((group) => (
        <div key={group.label} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-200/40 hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              {group.label}
            </h4>
            <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
              {group.meals.reduce((sum, m) => sum + m.kcal, 0)} KCAL
            </span>
          </div>

          <ul className="divide-y divide-slate-50">
            {group.meals.map((meal) => (
              <li key={meal.id} className={`p-6 transition-all relative ${editingId === meal.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}>
                {editingId === meal.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <FancySelect
                          label="Meal Type"
                          options={MEAL_TYPES}
                          value={editMealType}
                          onChange={(val) => setEditMealType(val)}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:col-span-2">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kcal</label>
                          <input
                            type="number"
                            value={editKcal}
                            onChange={(e) => setEditKcal(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Prot.</label>
                          <input
                            type="number"
                            value={editProteins}
                            onChange={(e) => setEditProteins(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Carbs</label>
                          <input
                            type="number"
                            value={editCarbs}
                            onChange={(e) => setEditCarbs(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fats</label>
                          <input
                            type="number"
                            value={editFats}
                            onChange={(e) => setEditFats(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(meal.id)}
                        disabled={isUpdating}
                        className="flex-1 bg-indigo-600 text-white rounded-xl py-3 px-4 font-black text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                      >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h5 className="font-bold text-slate-900 truncate text-sm">
                          {meal.foodName}
                        </h5>
                        <span className="text-[9px] font-black text-slate-300 flex items-center gap-1 shrink-0 bg-slate-50 px-1.5 py-0.5 rounded-md">
                          <Clock className="h-2.5 w-2.5" />
                          {meal.createdAt?.seconds ? new Date(meal.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">kcal</span>
                          <span className="text-sm font-black text-indigo-600">{meal.kcal}</span>
                        </div>
                        <div className="flex items-baseline gap-1 pl-3 border-l border-slate-100">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">P</span>
                          <span className="text-sm font-black text-emerald-600">{meal.proteins}g</span>
                        </div>
                        {meal.carbohydrates !== undefined && (
                          <div className="flex items-baseline gap-1 pl-3 border-l border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">C</span>
                            <span className="text-sm font-bold text-slate-600">{meal.carbohydrates}g</span>
                          </div>
                        )}
                        {meal.fats !== undefined && (
                          <div className="flex items-baseline gap-1 pl-3 border-l border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">F</span>
                            <span className="text-sm font-bold text-slate-600">{meal.fats}g</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0 opacity-100 transition-all">
                      <button
                        onClick={() => startEditing(meal)}
                        className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-slate-100 rounded-xl transition-all cursor-pointer"
                        title="Edit entry"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        disabled={deletingId === meal.id}
                        className="p-2.5 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-slate-100 rounded-xl transition-all disabled:opacity-30 cursor-pointer"
                        title="Delete entry"
                      >
                        {deletingId === meal.id ? <AlertCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
