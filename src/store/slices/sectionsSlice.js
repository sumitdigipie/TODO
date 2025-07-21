import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  collection,
  updateDoc,
  addDoc,
  getDocs,
  Timestamp,
  query,
  orderBy,
  writeBatch,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';

const initialState = {
  sections: [],
  loading: true,
  error: null,
};

export const fetchSections = createAsyncThunk(
  'sections/fetchSections',
  async (_, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'sections'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addSection = createAsyncThunk(
  'sections/addSection',
  async ({ status }, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'sections'), orderBy('order', 'desc'));
      const snapshot = await getDocs(q);
      const lastOrder = snapshot.docs[0]?.data().order ?? -1;
      const newOrder = lastOrder + 1;

      const docRef = await addDoc(collection(db, 'sections'), {
        status,
        order: newOrder,
        createdAt: Timestamp.now(),
      });

      await updateDoc(docRef, {
        sectionId: docRef.id,
      });

      return {
        id: docRef.id,
        status,
        order: newOrder,
        createdAt: Timestamp.now(),
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


export const deleteSection = createAsyncThunk(
  'sections/deleteSection',
  async (id, { rejectWithValue }) => {
    try {
      const sectionRef = doc(db, 'sections', id);
      await deleteDoc(sectionRef);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSectionOrder = createAsyncThunk(
  'sections/updateSectionOrder',
  async (sections, { rejectWithValue }) => {
    try {
      const batch = writeBatch(db);
      sections.forEach((section) => {
        const sectionRef = doc(db, 'sections', section.sectionId);
        batch.update(sectionRef, { order: section.order });
      });

      await batch.commit();
      return sections;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSectionName = createAsyncThunk(
  'sections/updateSectionName',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const sectionRef = doc(db, 'sections', id);
      await updateDoc(sectionRef, { status });
      return { id, status };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const sectionsSlice = createSlice({
  name: 'sections',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchSections.pending, (state) => {
        return {
          ...state,
          loading: true,
          error: null
        }
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        return {
          ...state,
          loading: false,
          sections: action.payload,
        }
      })
      .addCase(fetchSections.rejected, (state, action) => {
        return {
          ...state,
          loading: false,
          error: action.payload
        }
      })
      .addCase(addSection.fulfilled, (state, action) => {
        state.sections.push(action.payload);
      })

      .addCase(updateSectionName.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const section = state.sections.find((s) => s.id === id);
        if (section) {
          section.status = status;
        }
      })
      .addCase(updateSectionOrder.fulfilled, (state, action) => {
        state.sections = action.payload;
      })
      .addCase(deleteSection.pending, (state) => {
        return {
          ...state
        }
      })
      .addCase(deleteSection.fulfilled, (state, action) => {
        const sectionDelete = state.sections.filter((section) => section.sectionId !== action.payload);
        return {
          ...state,
          sections: sectionDelete
        }
      })
      .addCase(deleteSection.rejected, (state, action) => {
        return {
          ...state,
          loading: false,
        }
      })

  },
});

export default sectionsSlice.reducer;
