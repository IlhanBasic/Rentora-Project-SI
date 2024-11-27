import InputGroup from "./InputGroup";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "./Loader.jsx";
export default function FormAuth({ type }) {
  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const ctx = useContext(AuthContext);

  function handleNavigate() {
    navigate(`/auth?mode=${type === "Register" ? "Login" : "Register"}`);
  }

  async function authenticate(data, endpoint) {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://localhost:7247/api/Auth/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        console.log(error);
        setIsError("Greška tokom autentifikacije. "+error.message);
        return;
      }
      const result = await response.json();
      if (endpoint === "Login") {
        ctx.login(result.jwtToken);
        window.scrollTo(0,0);
        navigate("/");
      }
      if(endpoint==='Register'){
        authenticate(data,'Login')
      }
    } catch(e) {
      setIsError("Greška servera.");
    } finally {
      setIsLoading(false);
    }
  }

  function validateField(value, regex, errorMsg) {
    if (!regex.test(value)) {
      setIsError(errorMsg);
      return false;
    }
    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setIsError("");
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
        "Neispravan broj telefona",
      ],
      FirstName: [/^[A-Za-zćĆčČđĐžŽšŠ]{2,20}$/, "Neispravno ime"],
      LastName: [/^[A-Za-zćĆčČđĐžŽšŠ]{2,20}$/, "Neispravno prezime"],
    };

    const isRegister = type === "Register";
    const fields = isRegister
      ? ["FirstName", "LastName", "PhoneNumber", "Username", "PasswordHash"]
      : ["Email", "PasswordHash"];

    for (const field of fields) {
      if (
        !validateField(
          data[field],
          validations[field][0],
          validations[field][1]
        )
      )
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
      { inputId: "PasswordHash", inputName: "Password", inputType: "password" },
    ],
    Register: [
      { inputId: "FirstName", inputName: "Ime", inputType: "text" },
      { inputId: "LastName", inputName: "Prezime", inputType: "text" },
      { inputId: "PhoneNumber", inputName: "Telefon", inputType: "text" },
      { inputId: "Username", inputName: "E-mail", inputType: "email" },
      { inputId: "PasswordHash", inputName: "Password", inputType: "password" },
    ],
  };

  return (
    <>
      <form method="POST" className="form-auth" onSubmit={handleSubmit}>
        {inputGroups[type].map(({ inputId, inputName, inputType }) => (
          <InputGroup
            key={inputId}
            inputId={inputId}
            inputName={inputName}
            inputType={inputType}
          />
        ))}
        {isError && <p className="error-message">{isError}</p>}
        <div className="btn-group">
          <button type="submit" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : type === "Register"
              ? "Sign In"
              : "Login"}
          </button>
          <button type="button" onClick={handleNavigate}>
            {type === "Register"
              ? "Already Have An Account?"
              : "Don't Have An Account? Sign Up"}
          </button>
        </div>
      </form>
    </>
  );
}
