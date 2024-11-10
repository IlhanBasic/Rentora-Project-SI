import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  isAdmin: false,
  userId: null,
  userRole: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const updateAuthState = (token) => {
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const id = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      const exp = decodedToken.exp;

      if (exp * 1000 < Date.now()) {
        logout();
        return;
      }

      setIsLoggedIn(true);
      setUserId(id);
      setUserRole(role);
      setIsAdmin(role === 'Admin');
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserId(null);
      setUserRole(null);
    }
  };

  useEffect(() => {
    updateAuthState(token);

    const handleStorageChange = (event) => {
      if ((event.key === 'token' || event.key === 'expiration') && !event.newValue) {
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    localStorage.setItem('expiration', expiration.toISOString());
    setToken(newToken);
    updateAuthState(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    setToken(null);
    updateAuthState(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, userId, userRole, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
