import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";

const initialState = {
  messages: [],
  botResponse: "",
};

export const fetchUserChat = createAsyncThunk("chat/fetchAll", async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  const userCollection = collection(db, "users");
  const snapshot = await getDocs(userCollection);

  const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return { users };
});

export const sendMessageToBot = createAsyncThunk(
  "chat/sendMessageToBot",
  async (message, { rejectWithValue }) => {

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
    const start = Date.now();
    try {
      const response = await fetch(`${BACKEND_URL}/openai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const end = Date.now();
      const responseTime = end - start;
      console.log('responseTime: ', responseTime);


      if (!response.ok) {
        throw new Error("Failed to fetch response from chatbot");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const chatBotSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToBot.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessageToBot.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          text: action.payload.text || action.payload.message || 'AI response',
          from: 'AI',
          ...(action.payload.result && { result: action.payload.result }),
        });
      })
      .addCase(sendMessageToBot.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { addUserMessage } = chatBotSlice.actions;
export default chatBotSlice.reducer;
