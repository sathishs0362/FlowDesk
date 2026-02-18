import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FeatureFlagsState {
  realtimeEnabled: boolean;
  presenceEnabled: boolean;
  analyticsEnabled: boolean;
  offlineQueueEnabled: boolean;
}

const initialState: FeatureFlagsState = {
  realtimeEnabled: import.meta.env.VITE_FLAG_REALTIME !== 'false',
  presenceEnabled: import.meta.env.VITE_FLAG_PRESENCE !== 'false',
  analyticsEnabled: import.meta.env.VITE_FLAG_ANALYTICS !== 'false',
  offlineQueueEnabled: import.meta.env.VITE_FLAG_OFFLINE_QUEUE !== 'false',
};

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    setFeatureFlag: (
      state,
      action: PayloadAction<{ key: keyof FeatureFlagsState; value: boolean }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { setFeatureFlag } = featureFlagsSlice.actions;
export const featureFlagsReducer = featureFlagsSlice.reducer;
