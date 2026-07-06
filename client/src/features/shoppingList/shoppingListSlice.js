import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../app/apiClient";

export const fetchShoppingItems = createAsyncThunk("shoppingList/fetchShoppingItems", async () => {
  const response = await apiClient.get("/shopping-list");
  return response?.data || [];
});

export const addShoppingItems = createAsyncThunk("shoppingList/addShoppingItems", async (items) => {
  const response = await apiClient.post("/shopping-list", { items: Array.isArray(items) ? items : [] });
  return response?.data || [];
});

export const toggleShoppingItem = createAsyncThunk("shoppingList/toggleShoppingItem", async (id) => {
  const response = await apiClient.patch(`/shopping-list/${id}/toggle`);
  return response?.data;
});

export const removeShoppingItem = createAsyncThunk("shoppingList/removeShoppingItem", async (id) => {
  await apiClient.delete(`/shopping-list/${id}`);
  return id;
});

export const fetchEmailSettings = createAsyncThunk("shoppingList/fetchEmailSettings", async () => {
  const response = await apiClient.get("/shopping-list/email-settings");
  return response?.data || { enabled: false, recipient: "" };
});

export const sendShoppingList = createAsyncThunk(
  "shoppingList/sendShoppingList",
  async (recipient, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/shopping-list/send", { recipient });
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message || "Email could not be sent.");
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  addStatus: "idle",
  toggleStatus: "idle",
  deleteStatus: "idle",
  sendStatus: "idle",
  emailSettingsStatus: "idle",
  emailSettings: {
    enabled: false,
    recipient: "",
  },
  togglingId: "",
  deletingId: "",
  error: "",
  message: "",
};

const shoppingListSlice = createSlice({
  name: "shoppingList",
  initialState,
  reducers: {
    clearShoppingListError(state) {
      state.error = "";
    },
    clearShoppingListMessage(state) {
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShoppingItems.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchShoppingItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchShoppingItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addShoppingItems.pending, (state) => {
        state.addStatus = "loading";
        state.error = "";
      })
      .addCase(addShoppingItems.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        state.items.push(...action.payload);
      })
      .addCase(addShoppingItems.rejected, (state, action) => {
        state.addStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(toggleShoppingItem.pending, (state, action) => {
        state.toggleStatus = "loading";
        state.togglingId = action.meta.arg;
        state.error = "";
      })
      .addCase(toggleShoppingItem.fulfilled, (state, action) => {
        state.toggleStatus = "succeeded";
        state.togglingId = "";
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(toggleShoppingItem.rejected, (state, action) => {
        state.toggleStatus = "failed";
        state.togglingId = "";
        state.error = action.error.message;
      })
      .addCase(removeShoppingItem.pending, (state, action) => {
        state.deleteStatus = "loading";
        state.deletingId = action.meta.arg;
        state.error = "";
      })
      .addCase(removeShoppingItem.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.deletingId = "";
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeShoppingItem.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deletingId = "";
        state.error = action.error.message;
      })
      .addCase(fetchEmailSettings.pending, (state) => {
        state.emailSettingsStatus = "loading";
      })
      .addCase(fetchEmailSettings.fulfilled, (state, action) => {
        state.emailSettingsStatus = "succeeded";
        state.emailSettings = action.payload;
      })
      .addCase(fetchEmailSettings.rejected, (state) => {
        state.emailSettingsStatus = "failed";
        state.emailSettings = { enabled: false, recipient: "" };
      })
      .addCase(sendShoppingList.pending, (state) => {
        state.sendStatus = "loading";
        state.error = "";
        state.message = "";
      })
      .addCase(sendShoppingList.fulfilled, (state) => {
        state.sendStatus = "succeeded";
        state.message = "Shopping list sent.";
      })
      .addCase(sendShoppingList.rejected, (state, action) => {
        state.sendStatus = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearShoppingListError, clearShoppingListMessage } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;
