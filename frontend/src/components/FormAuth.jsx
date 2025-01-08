import InputGroup from "./InputGroup";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "./Loader.jsx";
import API_URL from "../API_URL.js"
import "./FormAuth.css";
export default function FormAuth({ type }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const navigate = useNavigate();
  const ctx = useContext(AuthContext);

  function handleNavigate() {
    navigate(`/auth?mode=${type === "Register" ? "Login" : "Register"}`);
  }

  async function authenticate(data, endpoint) {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/Auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        setErrorMessages({ global: "Greška tokom autentifikacije. " + error.message });
        return;
      }
      const result = await response.json();
      if (endpoint === "Login") {
        ctx.login(result.jwtToken);
        window.scrollTo(0, 0);
        navigate("/");
      }
      if (endpoint === 'Register') {
        window.scrollTo(0,0);
        setErrorMessages({
          
        });
        navigate('/auth?mode=login');
      }
    } catch (e) {
      setErrorMessages({ global: "Greška servera." });
    } finally {
      setIsLoading(false);
    }
  }

  function validateField(value, regex, errorMsg) {
    if (!regex.test(value)) {
      return errorMsg;
    }
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessages({});
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const validations = {
      Email: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Neispravan e-mail",
      ],
      PasswordHash: [
        /^(?=.*[A-Z])(?=.*\d).{2,}$/,
        "Lozinka mora sadržati jedno veliko slovo i jedan broj",
      ],
      Username: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Neispravan e-mail",
      ],
      PhoneNumber: [
        /^(?:\+381\s?6[34]|0[67]4)\s?\d{3}(?:\s|-)?\d{3,4}(?:\s|-)?\d{1,2}$/,
        "Neispravan broj telefona. Telefon moze biti u formatu +381643123456 ili 0643123456",
      ],
      FirstName: [/^[A-Za-zćĆčČđĐžŽšŠ]{2,20}$/, "Neispravno ime. Ime mora biti između 2 i 20 slova i osim slova nisu dozvoljeni drugi karakteri."],
      LastName: [/^[A-Za-zćĆčČđĐžŽšŠ]{2,20}$/, "Neispravno prezime. Prezime mora biti između 2 i 20 slova i osim slova nisu dozvoljeni drugi karakteri."],
    };

    const isRegister = type === "Register";
    const fields = isRegister
      ? ["FirstName", "LastName", "PhoneNumber", "Username", "PasswordHash"]
      : ["Email", "PasswordHash"];

    let validationErrors = {};
    for (const field of fields) {
      const error = validateField(data[field], validations[field][0], validations[field][1]);
      if (error) {
        validationErrors[field] = error;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrorMessages(validationErrors);
      return;
    }

    const sendingData = isRegister
      ? {
          username: data.Username,
          password: data.PasswordHash,
          firstName: data.FirstName,
          lastName: data.LastName,
          phoneNumber: data.PhoneNumber,
          roles: ["User"],
        }
      : { username: data.Email, password: data.PasswordHash };

    authenticate(sendingData, type);
  }

  const inputGroups = {
    Login: [
      { inputId: "Email", inputName: "E-mail", inputType: "email" },
      { inputId: "PasswordHash", inputName: "Lozinka", inputType: "password" },
    ],
    Register: [
      { inputId: "FirstName", inputName: "Ime", inputType: "text" },
      { inputId: "LastName", inputName: "Prezime", inputType: "text" },
      { inputId: "PhoneNumber", inputName: "Telefon", inputType: "text" },
      { inputId: "Username", inputName: "E-mail", inputType: "email" },
      { inputId: "PasswordHash", inputName: "Šifra", inputType: "password" },
    ],
  };

  return (
    <>
      <form method="POST" className="form-auth" onSubmit={handleSubmit}>
        {inputGroups[type].map(({ inputId, inputName, inputType }) => (
          <div key={inputId}>
            <InputGroup
              inputId={inputId}
              inputName={inputName}
              inputType={inputType}
            />
            {errorMessages[inputId] && (
              <p className="error-message">{errorMessages[inputId]}</p>
            )}
          </div>
        ))}
        {errorMessages.global && <p className="error-message">{errorMessages.global}</p>}
        <div className="btn-group">
          <button type="submit" disabled={isLoading}>
            {isLoading
              ? "Učitavanje..."
              : type === "Register"
              ? "Registruj se"
              : "Prijavi se"}
          </button>
          <button type="button" onClick={handleNavigate}>
            {type === "Register"
              ? "Već imate nalog?"
              : "Nemate nalog? Registrujte se"}
          </button>
        </div>
      </form>
    </>
  );
}
