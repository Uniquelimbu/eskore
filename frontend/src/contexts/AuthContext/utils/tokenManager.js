/**
 * Token management utilities
 */

export const getStoredToken = () => {
  return localStorage.getItem('token');
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const clearStoredToken = () => {
  localStorage.removeItem('token');
};

export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('AuthContext: Error parsing stored user:', error);
    localStorage.removeItem('user');
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const clearStoredUser = () => {
  localStorage.removeItem('user');
};

export const getStoredTeamId = () => {
  return localStorage.getItem('lastTeamId');
};

export const setStoredTeamId = (teamId) => {
  if (teamId) {
    localStorage.setItem('lastTeamId', teamId.toString());
  } else {
    localStorage.removeItem('lastTeamId');
  }
};

export const clearStoredTeamId = () => {
  localStorage.removeItem('lastTeamId');
};

export const clearAllAuthStorage = () => {
  clearStoredToken();
  clearStoredUser();
  clearStoredTeamId();
};