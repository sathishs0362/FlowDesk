import { useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';

export const TopLoadingBar = () => {
  const isLoading = useAppSelector((state) =>
    Object.values(state.api.queries).some((query) => query?.status === 'pending'),
  );

  const className = useMemo(
    () => `top-loading-bar ${isLoading ? 'active' : ''}`,
    [isLoading],
  );

  return <div className={className} aria-hidden />;
};
