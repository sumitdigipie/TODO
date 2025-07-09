import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { retry } from "@reduxjs/toolkit/query";

export const fetchAllUsers = createAsyncThunk("users/fetchAll", async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  const users = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return users;
});

const userSlice = createSlice({
  name: "users",
  initialState: {
    userList: [],
    isLoading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        return {
          ...state,
          isLoading: false,
        };
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        return {
          ...state,
          userList: action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchAllUsers.rejected, (state) => {
        return {
          ...state,
          isLoading: false,
        };
      });
  },
});

export default userSlice.reducer;
