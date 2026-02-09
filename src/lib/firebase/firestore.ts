import { db } from "./config"
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  deleteDoc,
  Timestamp
} from "firebase/firestore"

/**
 * Removes undefined values from an object to prevent Firebase errors.
 */
const removeUndefined = (obj: any) => {
  const newObj = { ...obj }
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] === undefined) {
      delete newObj[key]
    }
  })
  return newObj
}

export interface Goals {
  kcal: number
  proteins: number
  carbohydrates: number
  fats: number
}

export type FoodSource = 'manual' | 'usda' | 'local' | 'library'

export interface Meal {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  mealType: string
  foodName: string
  kcal: number
  proteins: number
  carbohydrates?: number
  fats?: number
  source: FoodSource
  fdcId?: string
  createdAt: any
}

export interface CustomFood {
  id?: string
  name: string
  kcal: number
  proteins: number
  carbohydrates?: number
  fats?: number
  userId: string
  createdAt?: any
}

export const getUserGoals = async (userId: string): Promise<Goals | null> => {
  const userDoc = await getDoc(doc(db, "users", userId))
  if (userDoc.exists()) {
    return userDoc.data().goals as Goals
  }
  return null
}

export const setUserGoals = async (userId: string, goals: Goals) => {
  await setDoc(doc(db, "users", userId), { goals }, { merge: true })
}

export const logMeal = async (meal: Omit<Meal, "createdAt" | "id">) => {
  const cleanedMeal = removeUndefined(meal)
  await addDoc(collection(db, "users", meal.userId, "meals"), {
    ...cleanedMeal,
    createdAt: serverTimestamp(),
  })
}

export const getTodayMeals = async (userId: string, date: string): Promise<Meal[]> => {
  const mealsRef = collection(db, "users", userId, "meals")
  const q = query(
    mealsRef,
    where("date", "==", date),
    orderBy("createdAt", "asc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Meal[]
}

export const getMonthlyMeals = async (userId: string, yearMonth: string): Promise<Meal[]> => {
  const mealsRef = collection(db, "users", userId, "meals")
  const q = query(
    mealsRef,
    where("date", ">=", `${yearMonth}-01`),
    where("date", "<=", `${yearMonth}-31`),
    orderBy("date", "asc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Meal[]
}

export const updateMeal = async (userId: string, mealId: string, updates: Partial<Omit<Meal, "id" | "userId" | "createdAt">>) => {
  const mealRef = doc(db, "users", userId, "meals", mealId)
  const cleanedUpdates = removeUndefined(updates)
  await setDoc(mealRef, cleanedUpdates, { merge: true })
}

export const deleteMeal = async (userId: string, mealId: string) => {
  const mealRef = doc(db, "users", userId, "meals", mealId)
  await deleteDoc(mealRef)
}

// User Library (Custom Foods)
export const logCustomFood = async (food: Omit<CustomFood, "id" | "createdAt">) => {
  const cleanedFood = removeUndefined(food)
  await addDoc(collection(db, "users", food.userId, "customFoods"), {
    ...cleanedFood,
    createdAt: serverTimestamp(),
  })
}

export const getCustomFoods = async (userId: string): Promise<CustomFood[]> => {
  if (!userId) return []
  const foodsRef = collection(db, "users", userId, "customFoods")
  const snapshot = await getDocs(foodsRef)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CustomFood[]
}

export const deleteCustomFood = async (userId: string, foodId: string) => {
  await deleteDoc(doc(db, "users", userId, "customFoods", foodId))
}

export const updateCustomFood = async (userId: string, foodId: string, updates: Partial<Omit<CustomFood, "id" | "userId" | "createdAt">>) => {
  const foodRef = doc(db, "users", userId, "customFoods", foodId)
  const cleanedUpdates = removeUndefined(updates)
  await setDoc(foodRef, cleanedUpdates, { merge: true })
}
