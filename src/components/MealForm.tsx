"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useMealStore } from "@/stores/useMealStore"
import { logMeal, getTodayMeals, updateMeal, Meal } from "@/lib/firebase/firestore"
import { getTodayDateString } from "@/lib/utils/date"
import { X } from "lucide-react"

import { MEAL_TYPES } from "@/lib/constants"
import FancySelect from "./FancySelect"

interface MealFormProps {
  editingMeal?: Meal | null
  onCancelEdit?: () => void
}

export default function MealForm({ editingMeal, onCancelEdit }: MealFormProps) {
  const { user } = useAuthStore()

  const [mealType, setMealType] = useState(MEAL_TYPES[0])
  const [kcal, setKcal] = useState("")
  const [proteins, setProteins] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingMeal) {
      setMealType(editingMeal.mealType)
      setKcal(editingMeal.kcal.toString())
      setProteins(editingMeal.proteins.toString())
      setCarbs(editingMeal.carbohydrates?.toString() || "")
      setFats(editingMeal.fats?.toString() || "")
    } else {
      setMealType(MEAL_TYPES[0])
      setKcal("")
      setProteins("")
      setCarbs("")
      setFats("")
    }
  }, [editingMeal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const mealData = {
      userId: user.uid,
      date: getTodayDateString(),
      mealType,
      kcal: Number(kcal),
      proteins: Number(proteins),
      carbohydrates: carbs === "" ? undefined : Number(carbs),
      fats: fats === "" ? undefined : Number(fats),
    }

    try {
      if (editingMeal) {
        await updateMeal(user.uid, editingMeal.id, mealData)
        if (onCancelEdit) onCancelEdit()
      } else {
        await logMeal(mealData as any)
      }

      // Refresh meals after logging/updating
      const updatedMeals = await getTodayMeals(user.uid, getTodayDateString())
      useMealStore.getState().setTodayMeals(updatedMeals)

      if (!editingMeal) {
        setKcal("")
        setProteins("")
        setCarbs("")
        setFats("")
      }
    } catch (error) {
      console.error("Error saving meal:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white p-6 rounded-xl border ${editingMeal ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          {editingMeal ? "Edit Meal" : "Log a Meal"}
        </h3>
        {editingMeal && (
          <button onClick={onCancelEdit} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FancySelect
              label="Meal Type"
              options={MEAL_TYPES}
              value={mealType}
              onChange={(value) => setMealType(value)}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Calories (kcal) *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 500"
              className="block w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold p-3.5 bg-slate-50/50 border transition-all placeholder:font-normal placeholder:text-slate-300 outline-none text-slate-900"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Proteins (g) *</label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 30"
              className="block w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold p-3.5 bg-slate-50/50 border transition-all placeholder:font-normal placeholder:text-slate-300 outline-none text-slate-900"
              value={proteins}
              onChange={(e) => setProteins(e.target.value)}
            />
          </div>

          <div className="sm:col-span-1 opacity-70 focus-within:opacity-100 transition-opacity">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 italic">Carbs (g) - Optional</label>
            <input
              type="number"
              min="0"
              placeholder="Optional"
              className="block w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm p-3.5 bg-slate-50/50 border transition-all outline-none text-slate-900 font-bold"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
          </div>

          <div className="sm:col-span-1 opacity-70 focus-within:opacity-100 transition-opacity">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 italic">Fats (g) - Optional</label>
            <input
              type="number"
              min="0"
              placeholder="Optional"
              className="block w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm p-3.5 bg-slate-50/50 border transition-all outline-none text-slate-900 font-bold"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${editingMeal ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-xl py-3 px-4 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer`}
        >
          {loading ? "Saving..." : editingMeal ? "Update Meal" : "Add to Log"}
        </button>
      </form>
    </div>
  )
}
