"use client"

import React, { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { getCustomFoods, deleteCustomFood, updateCustomFood, CustomFood } from "@/lib/firebase/firestore"
import AuthCheck from "@/components/AuthCheck"
import Navbar from "@/components/Navbar"
import { Bookmark, Search, Trash2, Edit2, X, Check, Loader2, Database, User } from "lucide-react"

export default function LibraryPage() {
  const { user } = useAuthStore()
  const [foods, setFoods] = useState<CustomFood[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editKcal, setEditKcal] = useState("")
  const [editProteins, setEditProteins] = useState("")
  const [editCarbs, setEditCarbs] = useState("")
  const [editFats, setEditFats] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchFoods = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getCustomFoods(user.uid)
      setFoods(data)
    } catch (error) {
      console.error("Error fetching library:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFoods()
  }, [user])

  const handleDelete = async (foodId: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this food from your library?")) return
    setDeletingId(foodId)
    try {
      await deleteCustomFood(user.uid, foodId)
      setFoods(foods.filter(f => f.id !== foodId))
    } catch (error) {
      console.error("Error deleting food:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const startEditing = (food: CustomFood) => {
    setEditingId(food.id!)
    setEditName(food.name)
    setEditKcal(food.kcal.toString())
    setEditProteins(food.proteins.toString())
    setEditCarbs(food.carbohydrates?.toString() || "")
    setEditFats(food.fats?.toString() || "")
  }

  const handleUpdate = async (foodId: string) => {
    if (!user) return
    setIsUpdating(true)
    try {
      await updateCustomFood(user.uid, foodId, {
        name: editName,
        kcal: Number(editKcal),
        proteins: Number(editProteins),
        carbohydrates: editCarbs === "" ? undefined : Number(editCarbs),
        fats: editFats === "" ? undefined : Number(editFats),
      })
      setEditingId(null)
      await fetchFoods()
    } catch (error) {
      console.error("Error updating food:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AuthCheck>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <Bookmark className="h-8 w-8 text-indigo-600" />
                My Library
              </h1>
              <p className="text-slate-500 mt-1">Manage your custom food items and macros.</p>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search library..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Loading your library...</p>
              </div>
            ) : filteredFoods.length === 0 ? (
              <div className="p-20 text-center">
                <Database className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">
                  {searchQuery ? "No matches found." : "Your library is empty. Save foods when logging to see them here!"}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Food Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kcal</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Prot.</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center hidden md:table-cell">Carbs</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center hidden md:table-cell">Fats</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredFoods.map((food) => (
                        <React.Fragment key={food.id}>
                          <tr className={`group hover:bg-slate-50/50 transition-colors ${editingId === food.id ? 'bg-indigo-50/30' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                  <User className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-slate-700">{food.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-black text-indigo-600">{food.kcal}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-black text-emerald-600">{food.proteins}g</span>
                            </td>
                            <td className="px-6 py-4 text-center hidden md:table-cell">
                              <span className="font-bold text-slate-500">{food.carbohydrates || 0}g</span>
                            </td>
                            <td className="px-6 py-4 text-center hidden md:table-cell">
                              <span className="font-bold text-slate-500">{food.fats || 0}g</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => editingId === food.id ? setEditingId(null) : startEditing(food)}
                                  className={`p-2 rounded-xl transition-all ${editingId === food.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(food.id!)}
                                  disabled={deletingId === food.id}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-20"
                                >
                                  {deletingId === food.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {editingId === food.id && (
                            <tr>
                              <td colSpan={6} className="px-6 py-6 bg-indigo-50/20 border-t border-indigo-100/50">
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                  <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Name</label>
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:border-indigo-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kcal</label>
                                    <input
                                      type="number"
                                      value={editKcal}
                                      onChange={(e) => setEditKcal(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:border-indigo-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Prot.</label>
                                    <input
                                      type="number"
                                      value={editProteins}
                                      onChange={(e) => setEditProteins(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:border-indigo-500 outline-none"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">C</label>
                                      <input
                                        type="number"
                                        value={editCarbs}
                                        onChange={(e) => setEditCarbs(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:border-indigo-500 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">F</label>
                                      <input
                                        type="number"
                                        value={editFats}
                                        onChange={(e) => setEditFats(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:border-indigo-500 outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdate(food.id!)}
                                      disabled={isUpdating}
                                      className="flex-1 bg-indigo-600 text-white rounded-xl py-3 px-4 font-black text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                                    >
                                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                      <span>Save</span>
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View (optimized for 400px width) */}
                <div className="sm:hidden divide-y divide-slate-50">
                  {filteredFoods.map((food) => (
                    <div key={food.id} className="p-4 sm:p-5">
                      {editingId === food.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Food Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kcal</label>
                              <input
                                type="number"
                                value={editKcal}
                                onChange={(e) => setEditKcal(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Protein</label>
                              <input
                                type="number"
                                value={editProteins}
                                onChange={(e) => setEditProteins(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Carbs</label>
                              <input
                                type="number"
                                value={editCarbs}
                                onChange={(e) => setEditCarbs(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fats</label>
                              <input
                                type="number"
                                value={editFats}
                                onChange={(e) => setEditFats(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleUpdate(food.id!)}
                              disabled={isUpdating}
                              className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-black text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-4 bg-white border border-slate-200 text-slate-400 rounded-xl font-bold text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate mb-2">{food.name}</h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                {food.kcal} kcal
                              </span>
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                {food.proteins}g P
                              </span>
                              {(food.carbohydrates !== undefined || food.fats !== undefined) && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                                  C: {food.carbohydrates || 0}g | F: {food.fats || 0}g
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => startEditing(food)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(food.id!)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthCheck>
  )
}
