import { useAppSelector } from './redux';
import type { FeatureFlagsState } from '../app/featureFlags.slice';

export const useFeatureFlag = (key: keyof FeatureFlagsState): boolean => {
  return useAppSelector((state) => state.featureFlags[key]);
};
