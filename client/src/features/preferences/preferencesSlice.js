import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cuisine: "any",
  diet: "none",
  cookingTime: "30 minutes",
  servings: 2,
  allergies: "",
  dislikes: "",
  strictMode: true,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    updatePreference(state, action) {
      const { field, value } = action.payload;
      state[field] = value;
    },
  },
});

export const { updatePreference } = preferencesSlice.actions;
export default preferencesSlice.reducer;
