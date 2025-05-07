import InputGroup from "../components/InputGroup.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../API_URL.js";
import Header from "../components/Header.jsx";
export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessages({});
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const validations = {
      Username: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Neispravan e-mail"],
      PasswordHash: [/^(?=.*[A-Z])(?=.*\d).{6,}$/, ""],
      ConfirmPassword: [
        /^(?=.*[A-Z])(?=.*\d).{6,}$/,
        "Lozinka mora sadržati jedno veliko slovo i jedan broj i minimum dužinu 6 karaktera",
      ],
      FirstName: [/^[A-Za-zćĆčČđĐžŽšŠ]{2,20}$/, "Neispravno ime."],
      LastName: [/^[A-Za-zćĆčČđĐžŽšŠ]{2,20}$/, "Neispravno prezime."],
      PhoneNumber: [
        /^(?:\+381\s?6[0123456789]|06[0123456789])\s?\d{3}(?:\s|-)?\d{3,4}(?:\s|-)?\d{1,2}$/,
        "Neispravan broj telefona.",
      ],
    };

    let validationErrors = {};
    for (const [key, [regex, errorMsg]] of Object.entries(validations)) {
      if (!regex.test(data[key])) {
        validationErrors[key] = errorMsg;
      }
    }

    if (data.PasswordHash !== data.ConfirmPassword) {
      validationErrors.ConfirmPassword = "Lozinke se ne podudaraju.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrorMessages(validationErrors);
      return;
    }

    const sendingData = {
      username: data.Username,
      password: data.PasswordHash,
      firstName: data.FirstName,
      lastName: data.LastName,
      phoneNumber: data.PhoneNumber,
      roles: ["Guest"],
    };

    register(sendingData);
  }

  async function register(data) {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/Auth/Register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessages({
          global: "Greška tokom registracije. " + error.message,
        });
        return;
      }

      setErrorMessages({});
      localStorage.setItem("toastLogin", true);
      navigate("/login");
    } catch (e) {
      setErrorMessages({ global: "Greška servera." });
    } finally {
      setIsLoading(false);
    }
  }

  const inputGroups = [
    { inputId: "FirstName", inputName: "Ime", inputType: "text" },
    { inputId: "LastName", inputName: "Prezime", inputType: "text" },
    { inputId: "PhoneNumber", inputName: "Telefon", inputType: "text" },
    { inputId: "Username", inputName: "E-mail", inputType: "email" },
    { inputId: "PasswordHash", inputName: "Šifra", inputType: "password" },
    {
      inputId: "ConfirmPassword",
      inputName: "Ponovljena Šifra",
      inputType: "password",
    },
  ];

  return (
    <>
    <Header title="Registracija"/>
      <form method="POST" className="form-auth" onSubmit={handleSubmit}>
        {inputGroups.map(({ inputId, inputName, inputType }) => (
          <div key={inputId}>
            <InputGroup
              inputId={inputId}
              inputName={inputName}
              inputType={inputType}
              authType="Register"
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
            {isLoading ? "Učitavanje..." : "Registruj se"}
          </button>
          <button type="button" onClick={() => navigate("/login")}>
            Već imate nalog?
          </button>
        </div>
      </form>
    </>
  );
}
