import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../app/apiClient";

export const generateRecipe = createAsyncThunk(
  "recipes/generateRecipe",
  async ({ ingredients, preferences }) => {
    return apiClient.post("/recipes/generate", { ingredients, preferences });
  }
);

export const fetchSavedRecipes = createAsyncThunk("recipes/fetchSavedRecipes", async () => {
  const response = await apiClient.get("/recipes");
  return response.data || [];
});

export const loadSavedRecipe = createAsyncThunk("recipes/loadSavedRecipe", async (id) => {
  const response = await apiClient.get(`/recipes/${id}`);
  return response.data;
});

export const saveGeneratedRecipe = createAsyncThunk(
  "recipes/saveGeneratedRecipe",
  async (_, { getState, rejectWithValue }) => {
    const { generatedRecipe: recipe, savedRecipes } = getState().recipes;

    if (!recipe) {
      return rejectWithValue("No generated recipe to save.");
    }

    const alreadySaved = savedRecipes.some((savedRecipe) => (
      savedRecipe.title || ""
    ).trim().toLowerCase() === (recipe.title || "").trim().toLowerCase());

    if (alreadySaved) {
      return rejectWithValue("This recipe is already saved.");
    }

    const response = await apiClient.post("/recipes", recipe);
    return response.data;
  }
);

export const deleteSavedRecipe = createAsyncThunk("recipes/deleteSavedRecipe", async (id) => {
  await apiClient.delete(`/recipes/${id}`);
  return id;
});

const initialState = {
  generatedRecipe: null,
  savedRecipes: [],
  status: "idle",
  savedStatus: "idle",
  saveStatus: "idle",
  openStatus: "idle",
  openingId: "",
  deleteStatus: "idle",
  deletingId: "",
  error: "",
};

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    clearRecipeError(state) {
      state.error = "";
    },
    clearGeneratedRecipe(state) {
      state.generatedRecipe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateRecipe.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(generateRecipe.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.generatedRecipe = action.payload.data || action.payload;
      })
      .addCase(generateRecipe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchSavedRecipes.pending, (state) => {
        state.savedStatus = "loading";
        state.error = "";
      })
      .addCase(fetchSavedRecipes.fulfilled, (state, action) => {
        state.savedStatus = "succeeded";
        state.savedRecipes = action.payload;
      })
      .addCase(fetchSavedRecipes.rejected, (state, action) => {
        state.savedStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(loadSavedRecipe.pending, (state, action) => {
        state.openStatus = "loading";
        state.openingId = action.meta.arg;
        state.error = "";
      })
      .addCase(loadSavedRecipe.fulfilled, (state, action) => {
        state.openStatus = "succeeded";
        state.openingId = "";
        state.generatedRecipe = action.payload;
      })
      .addCase(loadSavedRecipe.rejected, (state, action) => {
        state.openStatus = "failed";
        state.openingId = "";
        state.error = action.error.message;
      })
      .addCase(saveGeneratedRecipe.pending, (state) => {
        state.saveStatus = "loading";
        state.error = "";
      })
      .addCase(saveGeneratedRecipe.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.savedRecipes.unshift(action.payload);
      })
      .addCase(saveGeneratedRecipe.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteSavedRecipe.pending, (state, action) => {
        state.deleteStatus = "loading";
        state.deletingId = action.meta.arg;
        state.error = "";
      })
      .addCase(deleteSavedRecipe.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.deletingId = "";
        state.savedRecipes = state.savedRecipes.filter((recipe) => recipe.id !== action.payload);
      })
      .addCase(deleteSavedRecipe.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deletingId = "";
        state.error = action.error.message;
      });
  },
});

export const { clearGeneratedRecipe, clearRecipeError } = recipesSlice.actions;
export default recipesSlice.reducer;
