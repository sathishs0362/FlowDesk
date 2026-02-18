export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  WS_URL: import.meta.env.VITE_WS_URL ?? 'ws://localhost:5000/ws',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL ?? 'info',
} as const;
