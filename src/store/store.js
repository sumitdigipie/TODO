import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "./slices/todoSlice";
import userReducer from "./slices/userSlice";
import sectionsReducer from './slices/sectionsSlice';
import chatBotReducer from './slices/chatBotSlice'

const store = configureStore({
  reducer: {
    todos: todoReducer,
    users: userReducer,
    sections: sectionsReducer,
    chat: chatBotReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
