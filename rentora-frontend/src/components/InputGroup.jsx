import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./InputGroup.css"; 

export default function InputGroup({ inputId, inputName, inputType, authType }) {
  const passwordInput = useRef(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="input-group">
      <label htmlFor={inputId}>{inputName}</label>
      <div className="input-wrapper">
        <input
          type={inputType === "password" ? (showPassword ? "text" : "password") : inputType}
          name={inputId}
          id={inputId}
          ref={inputId === "PasswordHash" ? passwordInput : null}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        {inputType === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="eye-button"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {authType === "Register" && inputId === "PasswordHash" && (password.length > 0 && !passwordRegex.test(password)) && (
        <p className="error-message">Lozinka: min 6 znakova, jedno veliko slovo i jedan broj</p>
      )}
    </div>
  );
}
