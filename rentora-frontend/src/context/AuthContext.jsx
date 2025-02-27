import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({
  email: "",
  isLoggedIn: false,
  isAdmin: false,
  userId: null,
  userRole: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const updateAuthState = (token) => {
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const role =
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        const id =
          decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        const name =
          decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ];
        const exp = decodedToken.exp;
        if (exp * 1000 < Date.now()) {
          logout();
          return;
        }
        setEmail(name);
        setIsLoggedIn(true);
        setUserId(id);
        setUserRole(role);
        setIsAdmin(role === "Admin");
      } catch (error) {
        // Ako dekodiranje tokena ne uspe, resetuj stanje
        logout();
      }
    } else {
      setEmail("");
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserId(null);
      setUserRole(null);
    }
  };

  useEffect(() => {
    updateAuthState(token);
    // Nakon inicijalnog učitavanja, postavi loading na false
    setIsLoading(false);

    const handleStorageChange = (event) => {
      if (
        (event.key === "token" || event.key === "expiration") &&
        !event.newValue
      ) {
        logout();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // Pokreće se jednom pri mount-u

  useEffect(() => {
    updateAuthState(token);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    localStorage.setItem("expiration", expiration.toISOString());
    setToken(newToken);
    updateAuthState(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    setToken(null);
    updateAuthState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        userId,
        userRole,
        token,
        email,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
