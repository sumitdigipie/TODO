import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "./slices/todoSlice";
import userReducer from "./slices/userSlice";
import sectionsReducer from './slices/sectionsSlice';
import chatBotReducer from './slices/chatBotSlice'
import aiEnhancerReducer from './slices/aiEnhancerSlice'

const store = configureStore({
  reducer: {
    todos: todoReducer,
    users: userReducer,
    sections: sectionsReducer,
    chat: chatBotReducer,
    aiEnhancer: aiEnhancerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
