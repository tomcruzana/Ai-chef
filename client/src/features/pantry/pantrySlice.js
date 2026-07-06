import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../app/apiClient";

export const fetchPantryItems = createAsyncThunk("pantry/fetchPantryItems", async () => {
  const response = await apiClient.get("/pantry");
  return response.data || [];
});

export const createPantryItem = createAsyncThunk("pantry/createPantryItem", async (item) => {
  const response = await apiClient.post("/pantry", item);
  return response.data;
});

export const deletePantryItem = createAsyncThunk("pantry/deletePantryItem", async (id) => {
  await apiClient.delete(`/pantry/${id}`);
  return id;
});

const initialState = {
  items: [],
  status: "idle",
  saveStatus: "idle",
  deleteStatus: "idle",
  deletingId: "",
  error: "",
};

const pantrySlice = createSlice({
  name: "pantry",
  initialState,
  reducers: {
    clearPantryError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPantryItems.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchPantryItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPantryItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createPantryItem.pending, (state) => {
        state.saveStatus = "loading";
        state.error = "";
      })
      .addCase(createPantryItem.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.push(action.payload);
      })
      .addCase(createPantryItem.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(deletePantryItem.pending, (state, action) => {
        state.deleteStatus = "loading";
        state.deletingId = action.meta.arg;
        state.error = "";
      })
      .addCase(deletePantryItem.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.deletingId = "";
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deletePantryItem.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deletingId = "";
        state.error = action.error.message;
      });
  },
});

export const { clearPantryError } = pantrySlice.actions;
export default pantrySlice.reducer;
