import { useMemo } from 'react';
import { useAppSelector } from './redux';

export const useAuth = () => {
  const { token, user } = useAppSelector((state) => state.auth);

  return useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      role: user?.role,
    }),
    [token, user],
  );
};
