import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";

const initialState = {
  userList: [],
  isLoading: true,
  currentUserData: null,
};

export const fetchUserChat = createAsyncThunk("chat/fetchAll", async () => {
  // const querySnapshot = await getDocs(collection(db, "users"));
  // const users = querySnapshot.docs.map((doc) => ({
  //   id: doc.id,
  //   ...doc.data(),
  // }));
  // const currentUser = getAuth().currentUser;
  // const currentUserData =
  //   users.find((user) => user.uid === currentUser?.uid) || null;
  // return {
  //   users,
  //   currentUserData,
  // };
});

const chatBotSlice = createSlice({
  name: "chat",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserChat.pending, (state) => {
        return {
          ...state,
          isLoading: true,
        };
      })
      .addCase(fetchUserChat.fulfilled, (state, action) => {
        return {
          ...state,
          userList: action.payload.users,
          currentUserData: action.payload.currentUserData,
          isLoading: false,
        };
      })
      .addCase(fetchUserChat.rejected, (state) => {
        return {
          ...state,
          isLoading: false,
        };
      });
  },
});

export default chatBotSlice.reducer;
