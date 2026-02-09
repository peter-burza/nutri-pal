export interface FoodDefinition {
  name: string
  kcal: number
  proteins: number
  carbohydrates: number
  fats: number
  source: 'local'
}

export const LOCAL_FOODS: Record<string, FoodDefinition> = {
  "chicken_breast": { name: "Chicken Breast (100g)", kcal: 165, proteins: 31, carbohydrates: 0, fats: 3.6, source: 'local' },
  "eggs": { name: "Eggs (2 large)", kcal: 140, proteins: 12, carbohydrates: 0.8, fats: 10, source: 'local' },
  "oats": { name: "Oats (100g)", kcal: 389, proteins: 16.9, carbohydrates: 66, fats: 6.9, source: 'local' },
  "white_rice": { name: "White Rice (100g cooked)", kcal: 130, proteins: 2.7, carbohydrates: 28, fats: 0.3, source: 'local' },
  "banana": { name: "Banana (1 medium)", kcal: 105, proteins: 1.3, carbohydrates: 27, fats: 0.3, source: 'local' },
  "apple": { name: "Apple (1 medium)", kcal: 95, proteins: 0.5, carbohydrates: 25, fats: 0.3, source: 'local' },
  "olive_oil": { name: "Olive Oil (1 tbsp)", kcal: 119, proteins: 0, carbohydrates: 0, fats: 13.5, source: 'local' },
  "full_milk": { name: "Whole Milk (250ml)", kcal: 150, proteins: 8, carbohydrates: 12, fats: 8, source: 'local' },
  "greek_yogurt": { name: "Greek Yogurt (100g)", kcal: 59, proteins: 10, carbohydrates: 3.6, fats: 0.4, source: 'local' },
  "whole_bread": { name: "Whole Wheat Bread (1 slice)", kcal: 80, proteins: 4, carbohydrates: 14, fats: 1, source: 'local' },
  "peanut_butter": { name: "Peanut Butter (1 tbsp)", kcal: 94, proteins: 4, carbohydrates: 3, fats: 8, source: 'local' },
  "almonds": { name: "Almonds (28g/approx 23)", kcal: 164, proteins: 6, carbohydrates: 6, fats: 14, source: 'local' },
  "salmon": { name: "Salmon (100g)", kcal: 208, proteins: 20, carbohydrates: 0, fats: 13, source: 'local' },
  "beef_ground": { name: "Ground Beef 10% (100g)", kcal: 176, proteins: 20, carbohydrates: 0, fats: 10, source: 'local' },
  "protein_shake": { name: "Whey Protein (1 scoop)", kcal: 120, proteins: 24, carbohydrates: 3, fats: 2, source: 'local' },
  "avocado": { name: "Avocado (1/2 medium)", kcal: 160, proteins: 2, carbohydrates: 8.5, fats: 14.7, source: 'local' },
}
