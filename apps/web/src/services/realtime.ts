import { api } from './api';
import type { AppStore } from '../app/store';
import { addToast } from '../app/ui.slice';
import { setProjectViewers, setTaskEditors } from '../app/presence.slice';
import { env } from '../config/env';
import { logger } from './logger';

type RealtimeEvent =
  | { type: 'task.updated' }
  | { type: 'task.status_changed' }
  | { type: 'approval.created' }
  | { type: 'presence.project'; projectId: string; userNames: string[] }
  | { type: 'presence.task'; taskId: string; userNames: string[] }
  | { type: 'notification'; message: string };

let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;
let started = false;
let activeToken: string | null = null;

const disconnectRealtime = () => {
  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
};

const scheduleReconnect = (store: AppStore, expectedToken: string) => {
  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer);
  }

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    if (store.getState().auth.token === expectedToken) {
      connectRealtime(store, expectedToken);
    }
  }, 3000);
};

const handleEvent = (store: AppStore, event: RealtimeEvent) => {
  switch (event.type) {
    case 'task.updated':
    case 'task.status_changed':
      store.dispatch(api.util.invalidateTags([{ type: 'Tasks', id: 'LIST' }]));
      return;
    case 'approval.created':
      store.dispatch(api.util.invalidateTags(['Approvals']));
      return;
    case 'presence.project':
      store.dispatch(setProjectViewers({ projectId: event.projectId, userNames: event.userNames }));
      return;
    case 'presence.task':
      store.dispatch(setTaskEditors({ taskId: event.taskId, userNames: event.userNames }));
      return;
    case 'notification':
      store.dispatch(addToast({ type: 'info', message: event.message }));
      return;
    default:
      return;
  }
};

const connectRealtime = (store: AppStore, token: string) => {
  try {
    ws = new WebSocket(`${env.WS_URL}?token=${encodeURIComponent(token)}`);
  } catch (error) {
    logger.warn('Realtime socket init failed', error);
    scheduleReconnect(store, token);
    return;
  }

  ws.onopen = () => logger.info('Realtime connected');
  ws.onmessage = (message) => {
    try {
      const event = JSON.parse(message.data as string) as RealtimeEvent;
      handleEvent(store, event);
    } catch (error) {
      logger.warn('Realtime payload parse failed', error);
    }
  };
  ws.onerror = () => {
    logger.warn('Realtime socket errored');
  };
  ws.onclose = () => {
    ws = null;
    if (store.getState().auth.token !== token) {
      logger.info('Realtime disconnected');
      return;
    }

    logger.info('Realtime disconnected; retry scheduled');
    scheduleReconnect(store, token);
  };
};

export const setupRealtime = (store: AppStore): void => {
  if (started) {
    return;
  }

  started = true;
  const syncConnection = () => {
    const token = store.getState().auth.token;

    if (!token) {
      activeToken = null;
      disconnectRealtime();
      return;
    }

    if (token !== activeToken) {
      activeToken = token;
      disconnectRealtime();
      connectRealtime(store, token);
      return;
    }

    if (!ws && reconnectTimer === null) {
      connectRealtime(store, token);
    }
  };

  syncConnection();
  store.subscribe(syncConnection);
};
