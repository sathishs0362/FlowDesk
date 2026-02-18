import { useEffect } from 'react';
import { removeToast } from '../../app/ui.slice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';

export const ToastContainer = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(removeToast(toasts[0].id));
    }, 3500);

    return () => clearTimeout(timer);
  }, [dispatch, toasts]);

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};
