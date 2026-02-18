import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './app/store';
import { setupAxiosInterceptors } from './services/axios';
import { AppErrorBoundary } from './components/error/AppErrorBoundary';
import { setupRealtime } from './services/realtime';
import './index.css';

setupAxiosInterceptors(store);
setupRealtime(store);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </AppErrorBoundary>
  </StrictMode>,
);
