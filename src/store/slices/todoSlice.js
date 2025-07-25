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
  isLoading: true,
};

export const fetchTodos = createAsyncThunk("todos/fetchTodos", async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const querySnapshot = await getDocs(collectionGroup(db, "tasks"));

  const todos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { todos };
});

export const addTodo = createAsyncThunk("todos/addTodo", async (task) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const newItem = { ...task, currentStep: 0, createdBy: userId };
  const docRef = await addDoc(collection(db, "tasks"), newItem);

  return { id: docRef.id, ...newItem };
});

export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async (taskId) => {
    const userId = auth.currentUser?.uid;
    console.log('taskId :>> ', taskId);
    if (!userId) throw new Error("User not authenticated");

    await deleteDoc(doc(db, "tasks", taskId));
    return taskId;
  }
);

export const updateTodo = createAsyncThunk(
  "todos/updateTodo",
  async ({ taskId, updates }) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const taskDocRef = doc(db, "tasks", taskId);
    await updateDoc(taskDocRef, updates);
    return { taskId, updates };
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
      // .addCase(updateTodo.fulfilled, (state, action) => {
      //   const { sectionId, updates } = action.payload;
      //   const index = state.todoList.findIndex((todo) => todo.sectionId === sectionId);

      //   if (index !== -1) {
      //     return {
      //       ...state,
      //       todoList: state.todoList.map((todo, i) =>
      //         i === index ? { ...todo, ...updates } : todo
      //       ),
      //     };
      //   }
      //   return state;
      // });

      .addCase(updateTodo.fulfilled, (state, action) => {
        const { taskId, updates } = action.payload;
        const index = state.todoList.findIndex((todo) => todo.id === taskId);

        if (index !== -1) {
          state.todoList[index] = {
            ...state.todoList[index],
            ...updates,
          };
        }
      });

  },
});

export default todoSlice.reducer;
