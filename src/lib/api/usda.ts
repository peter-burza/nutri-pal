const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"
const API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY || "DEMO_KEY"

export interface USDAMealResult {
  foodName: string
  kcal: number
  proteins: number
  carbohydrates: number
  fats: number
  source: 'usda'
  fdcId: string
}

export const searchUSDAFood = async (query: string): Promise<USDAMealResult[]> => {
  try {
    const response = await fetch(`${USDA_BASE_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&pageSize=5`)
    const data = await response.json()

    if (!data.foods) return []

    return data.foods.map((food: any) => {
      const getNutrient = (id: number) => {
        const nutrient = food.foodNutrients.find((n: any) => n.nutrientId === id)
        return nutrient ? nutrient.value : 0
      }

      return {
        foodName: food.description,
        kcal: getNutrient(1008), // Energy kcal
        proteins: getNutrient(1003), // Protein
        carbohydrates: getNutrient(1005), // Carbs
        fats: getNutrient(1004), // Fats
        source: 'usda',
        fdcId: food.fdcId.toString()
      }
    })
  } catch (error) {
    console.error("USDA Search Error:", error)
    return []
  }
}
