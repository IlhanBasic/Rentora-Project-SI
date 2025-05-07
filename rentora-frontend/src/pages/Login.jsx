import InputGroup from "../components/InputGroup.jsx";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import {EmailContext} from "../context/EmailContext.jsx";
import API_URL from "../API_URL.js";
import { ToastContainer } from "react-toastify";
import Header from "../components/Header.jsx";
import ResetPassword from "./ResetPassword.jsx";
export default function Login() {
  const {setEmail} = useContext(EmailContext);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const userEmail = useRef(null);
  const navigate = useNavigate();
  const ctx = useContext(AuthContext);

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessages({});
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

    let validationErrors = {};
    if (!emailRegex.test(data.Email)) {
      validationErrors.Email = "Neispravan e-mail";
    }
    if (!passwordRegex.test(data.PasswordHash)) {
      validationErrors.PasswordHash = "";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrorMessages(validationErrors);
      return;
    }

    authenticate({ username: data.Email, password: data.PasswordHash });
  }
  async function handleResetPassword(){
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(userEmail.current.value === "" || !emailRegex.test(userEmail.current.value)){
      setErrorMessages({Email: "Unesite ispravan email pre resetovanja lozinke"}); 
    }
    else{
      await sendResetPasswordEmail(userEmail.current.value);
    }
  }
  async function sendResetPasswordEmail(email) {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/ApplicationUser/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
  
      if (!response.ok) {
        const error = await response.json();
        setErrorMessages({ global: "Greška: " + error.message });
        return;
      }
      navigate(`/reset-password`); 
      setEmail(email);
    } catch (e) {
      setErrorMessages({ global: e.message });
    } finally {
      setIsLoading(false);
    }
  }
  async function authenticate(data) {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/Auth/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessages({ global: "Greška tokom prijave. " + error.message });
        return;
      }

      const result = await response.json();
      ctx.login(result.jwtToken);
      localStorage.setItem("toastShow", false);
      window.scrollTo(0, 0);
      navigate("/");
    } catch (e) {
      setErrorMessages({ global: "Greška servera." });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
    <Header title="Login"/>
      <form method="POST" className="form-auth" onSubmit={handleSubmit}>
        {["Email", "PasswordHash"].map((inputId) => (
          <div key={inputId}>
            <InputGroup
              emailRef={inputId === "Email" ? userEmail : null}
              inputId={inputId}
              inputName={inputId === "Email" ? "E-mail" : "Lozinka"}
              inputType={inputId === "Email" ? "email" : "password"}
              authType="Login"
            />
            {errorMessages[inputId] && (
              <p className="error-message">{errorMessages[inputId]}</p>
            )}
          </div>
        ))}
        {errorMessages.global && (
          <p className="error-message">{errorMessages.global}</p>
        )}
        <div className="btn-group">
          <button type="submit" id="btn-submit" disabled={isLoading}>
            {isLoading ? "Učitavanje..." : "Prijavi se"}
          </button>
          <button type="button" onClick={() => navigate("/register")}>Nemate nalog? Registrujte se</button>
          <button type="button" onClick={() => handleResetPassword()}>
            Zaboravili ste lozinku ? Restartujte lozinku
          </button>
        </div>
      </form>
      <ToastContainer />
    </>
  );
} 