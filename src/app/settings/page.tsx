"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useGoalStore } from "@/stores/useGoalStore"
import { getUserGoals, setUserGoals } from "@/lib/firebase/firestore"
import AuthCheck from "@/components/AuthCheck"
import Navbar from "@/components/Navbar"
import { Save, CheckCircle, Target } from "lucide-react"

export default function Settings() {
  const { user } = useAuthStore()
  const { goals, setGoals } = useGoalStore()

  const [kcal, setKcal] = useState("")
  const [proteins, setProteins] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (goals) {
      setKcal(goals.kcal.toString())
      setProteins(goals.proteins.toString())
      setCarbs(goals.carbohydrates.toString())
      setFats(goals.fats.toString())
    }
  }, [goals])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const newGoals = {
      kcal: Number(kcal),
      proteins: Number(proteins),
      carbohydrates: Number(carbs) || 0,
      fats: Number(fats) || 0,
    }

    try {
      await setUserGoals(user.uid, newGoals)
      setGoals(newGoals)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving goals:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daily Goals</h1>
            <p className="text-slate-500 mt-1">Configure your target intake for optimal health.</p>
          </header>

          <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-slate-100 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* PRIMARY GOALS */}
              <div className="sm:col-span-2 flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest border-b border-slate-50 pb-2">
                <Target className="h-4 w-4" />
                Primary Targets
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Daily Calories (kcal)</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="block w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xl font-black p-3.5 bg-slate-50/50 border transition-all outline-none text-slate-900"
                  value={kcal}
                  onChange={(e) => setKcal(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Daily Proteins (g)</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="block w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-indigo-500/20 text-xl font-black p-3.5 bg-slate-50/50 border transition-all outline-none text-slate-900"
                  value={proteins}
                  onChange={(e) => setProteins(e.target.value)}
                />
              </div>

              {/* SECONDARY GOALS */}
              <div className="sm:col-span-2 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest border-b border-slate-50 pb-2 mt-4">
                Secondary Macros (Optional Tracking)
              </div>

              <div className="opacity-60 focus-within:opacity-100 transition-opacity">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Carbohydrates (g)</label>
                <input
                  type="number"
                  min="0"
                  className="block w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold p-3.5 bg-slate-50/50 border transition-all outline-none text-slate-900"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>

              <div className="opacity-60 focus-within:opacity-100 transition-opacity">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Fats (g)</label>
                <input
                  type="number"
                  min="0"
                  className="block w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold p-3.5 bg-slate-50/50 border transition-all outline-none text-slate-900"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              {saved && (
                <div className="flex items-center text-emerald-600 text-sm font-bold animate-in fade-in slide-in-from-left-2 duration-300">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Goals updated successfully!
                </div>
              )}
              <div className={!saved ? "w-full" : ""}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto ml-auto flex items-center justify-center bg-slate-900 text-white rounded-xl py-4 px-10 text-sm font-bold shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </AuthCheck>
  )
}
