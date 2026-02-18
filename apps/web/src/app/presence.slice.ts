import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PresenceState {
  projectViewers: Record<string, string[]>;
  taskEditors: Record<string, string[]>;
}

const initialState: PresenceState = {
  projectViewers: {},
  taskEditors: {},
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setProjectViewers: (
      state,
      action: PayloadAction<{ projectId: string; userNames: string[] }>,
    ) => {
      state.projectViewers[action.payload.projectId] = action.payload.userNames;
    },
    setTaskEditors: (state, action: PayloadAction<{ taskId: string; userNames: string[] }>) => {
      state.taskEditors[action.payload.taskId] = action.payload.userNames;
    },
  },
});

export const { setProjectViewers, setTaskEditors } = presenceSlice.actions;
export const presenceReducer = presenceSlice.reducer;
