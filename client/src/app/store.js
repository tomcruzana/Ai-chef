import { configureStore } from "@reduxjs/toolkit";
import pantryReducer from "../features/pantry/pantrySlice";
import preferencesReducer from "../features/preferences/preferencesSlice";
import recipesReducer from "../features/recipes/recipesSlice";
import shoppingListReducer from "../features/shoppingList/shoppingListSlice";

export const store = configureStore({
  reducer: {
    pantry: pantryReducer,
    preferences: preferencesReducer,
    recipes: recipesReducer,
    shoppingList: shoppingListReducer,
  },
});
