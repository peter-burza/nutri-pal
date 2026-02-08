"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useGoalStore } from "@/stores/useGoalStore"
import { useMealStore } from "@/stores/useMealStore"
import { getUserGoals, getTodayMeals, Meal } from "@/lib/firebase/firestore"
import { getTodayDateString } from "@/lib/utils/date"
import AuthCheck from "@/components/AuthCheck"
import Navbar from "@/components/Navbar"
import DailySummary from "@/components/DailySummary"
import MealForm from "@/components/MealForm"
import MealList from "@/components/MealList"

export default function Dashboard() {
  const { user } = useAuthStore()
  const { setGoals } = useGoalStore()
  const { setTodayMeals } = useMealStore()
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const goals = await getUserGoals(user.uid)
        if (goals) setGoals(goals)

        const meals = await getTodayMeals(user.uid, getTodayDateString())
        setTodayMeals(meals)
      }
      fetchData()
    }
  }, [user, setGoals, setTodayMeals])

  return (
    <AuthCheck>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Today's Nutrition</h1>
            <p className="text-slate-500 mt-1">Focus on your calories and protein today.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Summary & form */}
            <div className="lg:col-span-1 space-y-8">
              <DailySummary />
              <MealForm
                editingMeal={editingMeal}
                onCancelEdit={() => setEditingMeal(null)}
              />
            </div>

            {/* Right Column: Meal List */}
            <div className="lg:col-span-2">
              <MealList onEdit={(meal) => {
                setEditingMeal(meal)
                // Smooth scroll to top/form on mobile
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }} />
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  )
}
