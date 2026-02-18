import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return <div className="offline-banner">Offline mode: updates will retry when connection returns.</div>;
};
