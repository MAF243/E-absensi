const USER_KEY = 'user';
const TOKEN_KEY = 'token';

export const getCurrentUser = () => {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    clearSession();
    return null;
  }
};

export const saveCurrentUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const saveSession = ({ user, token }) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  saveCurrentUser(user);
};

export const clearSession = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};
