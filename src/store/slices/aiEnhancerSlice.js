import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const enhanceDescription = createAsyncThunk(
  "aiEnhancer/enhanceDescription",
  async (description, { rejectWithValue }) => {
    console.log('description: ', description);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
    try {
      const response = await axios.post(`${BACKEND_URL}/openai/enhance-description`, { message: description });
      return response.data.enhancedDescription;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Enhancement failed");
    }
  }
);

const aiEnhancerSlice = createSlice({
  name: "aiEnhancer",
  initialState: {
    loading: false,
    result: null,
  },
  reducers: {
    clearEnhancementResult: (state) => {
      return {
        ...state,
        loading: false,
        result: null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(enhanceDescription.pending, (state) => {
        return {
          ...state,
          loading: true,
          result: null
        }
      })
      .addCase(enhanceDescription.fulfilled, (state, action) => {
        return {
          ...state,
          loading: false,
          result: action.payload
        }
      })
      .addCase(enhanceDescription.rejected, (state, action) => {
        return {
          ...state,
          loading: false,
        }
      });
  },
});

export const { clearEnhancementResult } = aiEnhancerSlice.actions;
export default aiEnhancerSlice.reducer;
