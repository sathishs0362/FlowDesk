const AUTH_TOKEN_KEY = 'flowdesk_auth_token';
const AUTH_USER_KEY = 'flowdesk_auth_user';

type PersistMode = 'local' | 'memory';

const getMode = (): PersistMode => {
  return import.meta.env.VITE_AUTH_STORAGE === 'memory' ? 'memory' : 'local';
};

export const authStorage = {
  getToken(): string | null {
    if (getMode() === 'memory') {
      return null;
    }
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  setAuth(token: string, userJson: string): void {
    if (getMode() === 'memory') {
      return;
    }
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, userJson);
  },
  clear(): void {
    if (getMode() === 'memory') {
      return;
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
  getUserJson(): string | null {
    if (getMode() === 'memory') {
      return null;
    }
    return localStorage.getItem(AUTH_USER_KEY);
  },
};
