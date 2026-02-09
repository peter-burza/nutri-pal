"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useMealStore } from "@/stores/useMealStore"
import { logMeal, getTodayMeals, updateMeal, logCustomFood, Meal, FoodSource } from "@/lib/firebase/firestore"
import { getTodayDateString } from "@/lib/utils/date"
import { X, Save, PlusCircle, Bookmark, BookmarkCheck, Loader2 } from "lucide-react"

import { MEAL_TYPES } from "@/lib/constants"
import FancySelect from "./FancySelect"
import FoodSearch from "./FoodSearch"

export default function MealForm() {
  const { user } = useAuthStore()

  const [mealType, setMealType] = useState(MEAL_TYPES[0])
  const [foodName, setFoodName] = useState("")
  const [kcal, setKcal] = useState("")
  const [proteins, setProteins] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [source, setSource] = useState<FoodSource>('manual')
  const [fdcId, setFdcId] = useState<string | undefined>(undefined)
  const [saveToLibrary, setSaveToLibrary] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFoodSelect = (food: any) => {
    setFoodName(food.name || food.foodName)
    setKcal(Math.round(food.kcal).toString())
    setProteins(food.proteins.toString())
    setCarbs(food.carbohydrates?.toString() || food.carbs?.toString() || "")
    setFats(food.fats?.toString() || "")
    setSource(food.type as FoodSource)
    setFdcId(food.fdcId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const mealData = {
      userId: user.uid,
      date: getTodayDateString(),
      mealType,
      foodName: foodName || (source === 'manual' ? 'Manual Entry' : 'Unknown Food'),
      kcal: Number(kcal),
      proteins: Number(proteins),
      carbohydrates: carbs === "" ? undefined : Number(carbs),
      fats: fats === "" ? undefined : Number(fats),
      source,
    }

    try {
      await logMeal(mealData as any)

      // Save to user library if requested
      if (saveToLibrary) {
        await logCustomFood({
          userId: user.uid,
          name: mealData.foodName,
          kcal: mealData.kcal,
          proteins: mealData.proteins,
          carbohydrates: mealData.carbohydrates,
          fats: mealData.fats
        })
      }

      // Refresh meals
      const updatedMeals = await getTodayMeals(user.uid, getTodayDateString())
      useMealStore.getState().setTodayMeals(updatedMeals)

      // Reset form
      setFoodName("")
      setKcal("")
      setProteins("")
      setCarbs("")
      setFats("")
      setSource('manual')
      setFdcId(undefined)
      setSaveToLibrary(false)
    } catch (error) {
      console.error("Error saving meal:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-50 text-slate-800">
            <PlusCircle className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Log Food
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <FoodSearch onSelect={handleFoodSelect} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <FancySelect
              label="Meal Type"
              options={MEAL_TYPES}
              value={mealType}
              onChange={(value) => setMealType(value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Food Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Greek Yogurt with Blueberries"
              className="block w-full rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-sm font-semibold p-4 bg-slate-50/50 border transition-all placeholder:text-slate-300 placeholder:font-normal outline-none text-slate-900"
              value={foodName}
              onChange={(e) => {
                setFoodName(e.target.value)
                if (source !== 'manual') setSource('manual')
              }}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 px-1">Calories (kcal)</label>
            <input
              type="number"
              required
              min="0"
              placeholder="0"
              className="block w-full rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-2xl font-black p-4 bg-slate-50/50 border transition-all placeholder:text-slate-200 outline-none text-slate-900"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 px-1">Protein (g)</label>
            <input
              type="number"
              required
              min="0"
              placeholder="0"
              className="block w-full rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 text-2xl font-black p-4 bg-slate-50/50 border transition-all placeholder:text-slate-200 outline-none text-slate-900"
              value={proteins}
              onChange={(e) => setProteins(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 sm:col-span-2 pt-2 border-t border-slate-50">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Carbs (g)</label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                className="block w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold p-3.5 bg-slate-50/30 border transition-all placeholder:text-slate-300 placeholder:font-normal outline-none text-slate-900"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Fats (g)</label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                className="block w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold p-3.5 bg-slate-50/30 border transition-all placeholder:text-slate-300 placeholder:font-normal outline-none text-slate-900"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {source === 'manual' && (
            <button
              type="button"
              onClick={() => setSaveToLibrary(!saveToLibrary)}
              className={`flex items-center gap-3 w-fit px-4 py-2 rounded-xl border transition-all cursor-pointer ${saveToLibrary ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm shadow-amber-100' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
            >
              {saveToLibrary ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {saveToLibrary ? "Saved to Library" : "Save to My Library"}
              </span>
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 shadow-slate-200 text-white rounded-2xl py-5 px-6 text-base font-black transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl cursor-pointer flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <PlusCircle className="h-5 w-5" />
                <span>Save Entry</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
