import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  collectionGroup,
} from "firebase/firestore";
import { db, auth } from "../../firebase";

const initialState = {
  todoList: [],
  isLoading: false,
  email: "",
};

export const fetchTodos = createAsyncThunk("todos/fetchTodos", async () => {
  const userId = auth.currentUser?.uid;
  const email = auth.currentUser?.email;
  if (!userId) throw new Error("User not authenticated");

  const querySnapshot = await getDocs(collectionGroup(db, "tasks"));

  const todos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { todos, email };
});

export const addTodo = createAsyncThunk("todos/addTodo", async (task) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const newItem = { ...task, status: "Todo", currentStep: 0 };
  const docRef = await addDoc(
    collection(db, "tickets", userId, "tasks"),
    newItem
  );

  return { id: docRef.id, ...newItem };
});

export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async (taskId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    await deleteDoc(doc(db, "tickets", userId, "tasks", taskId));
    return taskId;
  }
);

export const updateTodo = createAsyncThunk(
  "todos/updateTodo",
  async ({ id, updates }) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    await updateDoc(doc(db, "tickets", userId, "tasks", id), updates);
    return { id, updates };
  }
);

const todoSlice = createSlice({
  name: "todos",
  initialState,
  extraReducers: (builder) => {
    builder
      //Fetch TODO
      .addCase(fetchTodos.pending, (state) => {
        return {
          ...state,
          isLoading: true,
        };
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        const { email, todos } = action.payload;
        return {
          ...state,
          isLoading: false,
          todoList: todos,
          email,
        };
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.isLoading = false;
        return {
          ...state,
          isLoading: false,
        };
      })

      //Add new task
      .addCase(addTodo.fulfilled, (state, action) => {
        return {
          ...state,
          todoList: [...state.todoList, action.payload],
        };
      })

      //Delete task
      .addCase(deleteTodo.fulfilled, (state, action) => {
        const deleteTodoList = state.todoList.filter(
          (todo) => todo.id !== action.payload
        );

        return {
          ...state,
          todoList: deleteTodoList,
        };
      })

      //Update task
      .addCase(updateTodo.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.todoList.findIndex((todo) => todo.id === id);

        if (index !== -1) {
          return {
            ...state,
            todoList: state.todoList.map((todo, i) =>
              i === index ? { ...todo, ...updates } : todo
            ),
          };
        }

        return state;
      });
  },
});

export default todoSlice.reducer;
