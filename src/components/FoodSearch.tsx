"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2, Star, CheckCircle, Database, User } from "lucide-react"
import { searchUSDAFood } from "@/lib/api/usda"
import { LOCAL_FOODS } from "@/lib/constants/foodMapping"
import { getCustomFoods, CustomFood } from "@/lib/firebase/firestore"
import { useAuthStore } from "@/stores/useAuthStore"

interface FoodSearchProps {
  onSelect: (food: any) => void
}

export default function FoodSearch({ onSelect }: FoodSearchProps) {
  const { user } = useAuthStore()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      setShowDropdown(true)

      const searchTasks = [
        // 1. Search Local
        Promise.resolve(Object.values(LOCAL_FOODS)
          .filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
          .map(f => ({ ...f, type: 'local', id: f.name }))),

        // 2. Search User Library
        user ? getCustomFoods(user.uid)
          .then(foods => foods.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
            .map(f => ({ ...f, type: 'library' })))
          .catch(() => [])
          : Promise.resolve([]),

        // 3. Search USDA
        searchUSDAFood(query)
          .then(usda => usda.map(f => ({ ...f, type: 'usda', name: f.foodName })))
          .catch(() => [])
      ]

      const [localMatches, libraryMatches, usdaMatches] = await Promise.all(searchTasks)
      setResults([...libraryMatches, ...localMatches, ...usdaMatches])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [query, user])

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Quick Search</label>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Search food by name..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-[320px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
            {results.map((food, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    onSelect(food)
                    setShowDropdown(false)
                    setQuery("")
                  }}
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl shrink-0 ${food.type === 'library' ? 'bg-amber-50 text-amber-600' :
                      food.type === 'local' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                      {food.type === 'library' ? <User className="h-4 w-4" /> :
                        food.type === 'local' ? <CheckCircle className="h-4 w-4" /> :
                          <Database className="h-4 w-4" />}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{food.name}</h5>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{food.kcal} kcal</span>
                        <span className="text-[10px] font-bold text-slate-300">|</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{food.proteins}g P</span>
                        {food.type === 'library' && (
                          <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ml-1">Your Library</span>
                        )}
                        {food.type === 'local' && (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ml-1">Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star className="h-4 w-4 text-indigo-400 group-hover:fill-indigo-400" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDropdown && query.trim().length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-xl shadow-slate-200/50">
          <p className="text-slate-400 text-sm font-medium">No foods found. Try a different search.</p>
        </div>
      )}
    </div>
  )
}
