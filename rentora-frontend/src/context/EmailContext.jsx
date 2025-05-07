import { createContext,useState } from "react";
export const EmailContext = createContext({
  email: "",
  setEmail: () => {},
});

export function EmailProvider({ children }) {
  const [email, setEmail] = useState("");
  const ctxValue = {
    email,
    setEmail,
  };
  return (
    <EmailContext.Provider value={ctxValue}>{children}</EmailContext.Provider>
  );
}
