"use client"

import React, { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useGoalStore } from "@/stores/useGoalStore"
import { getMonthlyMeals, getUserGoals, deleteMeal } from "@/lib/firebase/firestore"
import AuthCheck from "@/components/AuthCheck"
import Navbar from "@/components/Navbar"
import { Calendar, ChevronLeft, ChevronRight, Trash2, Loader2, Edit2, X, Check } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isFuture } from "date-fns"
import { updateMeal as firebaseUpdateMeal } from "@/lib/firebase/firestore"

import { MEAL_TYPES } from "@/lib/constants"
import FancySelect from "@/components/FancySelect"

export default function History() {
  const { user } = useAuthStore()
  const { goals, setGoals } = useGoalStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)

  // Edit form state
  const [editMealType, setEditMealType] = useState("")
  const [editKcal, setEditKcal] = useState("")
  const [editProteins, setEditProteins] = useState("")
  const [editCarbs, setEditCarbs] = useState("")
  const [editFats, setEditFats] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    const yearMonth = format(currentMonth, "yyyy-MM")

    if (!goals) {
      const fetchedGoals = await getUserGoals(user.uid)
      if (fetchedGoals) setGoals(fetchedGoals)
    }

    const meals = await getMonthlyMeals(user.uid, yearMonth)

    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    })

    const dailyStats = daysInMonth
      .filter(day => !isFuture(day))
      .reverse()
      .map(day => {
        const dateStr = format(day, "yyyy-MM-dd")
        const dayMeals = meals.filter(m => m.date === dateStr)
        const totals = dayMeals.reduce((acc, m) => ({
          kcal: acc.kcal + m.kcal,
          proteins: acc.proteins + m.proteins,
          carbs: acc.carbs + (m.carbohydrates || 0),
          fats: acc.fats + (m.fats || 0),
        }), { kcal: 0, proteins: 0, carbs: 0, fats: 0 })

        return {
          date: dateStr,
          displayDate: format(day, "MMM d, EEE"),
          meals: dayMeals,
          ...totals
        }
      })

    setHistory(dailyStats)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user, currentMonth, goals, setGoals])

  const handleDeleteHistoryMeal = async (mealId: string, userId: string) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return

    setDeletingId(mealId)
    try {
      await deleteMeal(userId, mealId)
      await fetchData()
    } catch (error) {
      console.error("Error deleting historical meal:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const startEditing = (meal: any) => {
    setEditingMealId(meal.id)
    setEditMealType(meal.mealType)
    setEditKcal(meal.kcal.toString())
    setEditProteins(meal.proteins.toString())
    setEditCarbs(meal.carbohydrates?.toString() || "")
    setEditFats(meal.fats?.toString() || "")
  }

  const cancelEditing = () => {
    setEditingMealId(null)
  }

  const handleUpdateMeal = async (mealId: string) => {
    if (!user) return
    setIsUpdating(true)

    const updates = {
      mealType: editMealType,
      kcal: Number(editKcal),
      proteins: Number(editProteins),
      carbohydrates: editCarbs === "" ? undefined : Number(editCarbs),
      fats: editFats === "" ? undefined : Number(editFats),
    }

    try {
      await firebaseUpdateMeal(user.uid, mealId, updates)
      setEditingMealId(null)
      await fetchData()
    } catch (error) {
      console.error("Error updating meal:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + offset)
    if (!isFuture(startOfMonth(newMonth))) {
      setCurrentMonth(newMonth)
    }
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-10 flex flex-col items-center text-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">History</h1>
              <p className="text-slate-500 mt-1">Your nutritional journey over time.</p>
            </div>

            <div className="flex items-center bg-white rounded-xl border border-slate-100 p-1 w-full max-w-sm justify-between">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div className="px-6 py-2 text-sm font-extrabold text-slate-700 flex items-center min-w-[160px] justify-center uppercase tracking-widest">
                <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                {format(currentMonth, "MMM yyyy")}
              </div>
              <button
                onClick={() => changeMonth(1)}
                disabled={isFuture(startOfMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)))}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-default"
                title="Next Month"
              >
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </header>

          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Crunching your data...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No activity recorded for this month.</p>
              </div>
            ) : (
              history.map((day) => {
                const kcalPercent = (goals && goals.kcal > 0) ? (day.kcal / goals.kcal) * 100 : 0
                const isOnTrack = kcalPercent >= 90 && kcalPercent <= 110
                const isOver = kcalPercent > 110

                return (
                  <div key={day.date} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/20">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">{day.displayDate}</h3>
                        {day.date === format(new Date(), "yyyy-MM-dd") && (
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Today</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 xs:gap-4 sm:gap-6">
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calories</div>
                          <div className={`text-lg xs:text-xl font-black ${isOver ? 'text-rose-600' : isOnTrack ? 'text-emerald-600' : 'text-indigo-600'}`}>
                            {day.kcal} <span className="text-[10px] font-normal text-slate-400">kcal</span>
                          </div>
                        </div>
                        <div className="text-right border-l border-slate-100 pl-2 xs:pl-4 sm:pl-6">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protein</div>
                          <div className="text-lg xs:text-xl font-black text-emerald-600">
                            {day.proteins} <span className="text-[10px] font-normal text-slate-400">g</span>
                          </div>
                        </div>
                        <div className="hidden ss:block text-right border-l border-slate-100 pl-2 xs:pl-4 sm:pl-6">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Macros</div>
                          <div className="text-xs sm:text-sm font-bold text-slate-600">
                            C: <span className="font-extrabold">{day.carbs}</span>g <span className="mx-1 text-slate-300 ss:inline hidden">|</span> <span className="ss:inline hidden">F: <span className="font-extrabold">{day.fats}</span>g</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 bg-white overflow-x-auto custom-scrollbar">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-slate-50">
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meal Type</th>
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 xs:px-4 text-center ss:text-left">Kcal</th>
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 xs:px-4 text-center ss:text-left">Prot.</th>
                            <th className="hidden ss:table-cell pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Macros</th>
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Edit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {day.meals.map((meal: any) => (
                            <React.Fragment key={meal.id}>
                              <tr className={`group hover:bg-slate-50 transition-colors ${editingMealId === meal.id ? 'bg-indigo-50/30' : ''}`}>
                                <td className="py-3 font-bold text-slate-700 text-xs xs:text-sm">{meal.mealType}</td>
                                <td className="py-3 px-2 xs:px-4 font-black text-indigo-600 text-xs xs:text-sm text-center ss:text-left">{meal.kcal}</td>
                                <td className="py-3 px-2 xs:px-4 font-black text-emerald-600 text-xs xs:text-sm text-center ss:text-left">{meal.proteins}g</td>
                                <td className="hidden ss:table-cell py-3 px-2 text-[10px] font-bold text-slate-400">
                                  C: {meal.carbohydrates || 0} | F: {meal.fats || 0}
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={() => startEditing(meal)}
                                      className={`p-1.5 rounded transition-all cursor-pointer ${editingMealId === meal.id ? 'text-indigo-600 bg-white ring-1 ring-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                      title="Edit entry"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteHistoryMeal(meal.id, user!.uid)}
                                      disabled={deletingId === meal.id}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all disabled:opacity-30 cursor-pointer disabled:cursor-default"
                                      title="Delete entry"
                                    >
                                      {deletingId === meal.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {editingMealId === meal.id && (
                                <tr>
                                  <td colSpan={5} className="p-0 border-t border-indigo-100 bg-indigo-50/20">
                                    <div className={`grid transition-all duration-300 ease-in-out ${editingMealId === meal.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                                      <div className="overflow-visible p-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                                          <div className="col-span-2 sm:col-span-1">
                                            <FancySelect
                                              label="Type"
                                              options={MEAL_TYPES}
                                              value={editMealType}
                                              onChange={(value) => setEditMealType(value)}
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kcal</label>
                                            <input
                                              type="number"
                                              min="0"
                                              value={editKcal}
                                              onChange={(e) => setEditKcal(e.target.value)}
                                              className="w-full text-sm font-bold text-slate-900 p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Protein</label>
                                            <input
                                              type="number"
                                              min="0"
                                              value={editProteins}
                                              onChange={(e) => setEditProteins(e.target.value)}
                                              className="w-full text-sm font-bold text-slate-900 p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 col-span-2 sm:col-span-1">
                                            <div>
                                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Carbs</label>
                                              <input
                                                type="number"
                                                min="0"
                                                value={editCarbs}
                                                onChange={(e) => setEditCarbs(e.target.value)}
                                                className="w-full text-sm font-bold text-slate-900 p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fats</label>
                                              <input
                                                type="number"
                                                min="0"
                                                value={editFats}
                                                onChange={(e) => setEditFats(e.target.value)}
                                                className="w-full text-sm font-bold text-slate-900 p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex gap-2 col-span-2 sm:col-span-1">
                                            <button
                                              onClick={() => handleUpdateMeal(meal.id)}
                                              disabled={isUpdating}
                                              className="flex-1 bg-indigo-600 text-white rounded-xl p-3.5 text-xs font-bold hover:bg-indigo-700 shadow-indigo-100 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer disabled:cursor-default"
                                            >
                                              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                              Save
                                            </button>
                                            <button
                                              onClick={cancelEditing}
                                              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                              <X className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                          {day.meals.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-300 text-xs italic">No entries for this day</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </main>
      </div>
    </AuthCheck>
  )
}
