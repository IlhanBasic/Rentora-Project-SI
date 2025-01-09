import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
export default function RootLayout() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  function getTokenDuration() {
    const storedExpirationDate = localStorage.getItem("expiration");
    const expirationDate = new Date(storedExpirationDate);
    const now = new Date();
    const duration = expirationDate.getTime() - now.getTime();
    return duration;
  }
  function getAuthToken() {
    if (!token) {
      return null;
    }

    const tokenDuration = getTokenDuration();

    if (tokenDuration < 0) {
      return "EXPIRED";
    }

    return token;
  }
  useEffect(() => {
    if (!token) {
      return;
    }

    if (token === "EXPIRED") {
      navigate("/");
      return;
    }

    const tokenDuration = getTokenDuration();

    setTimeout(() => {
      navigate("/");
    }, tokenDuration);
  }, [token]);
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
