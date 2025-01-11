import { useContext, useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import InputGroup from "../components/InputGroup.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import API_URL from "../API_URL.js";
import "./ChangePassword.css";
export default function ChangePassword() {
  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const { token, userId } = useContext(AuthContext);
  const [successChange, setSuccessChange] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token]);

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    if (data === null || data === undefined) {
      setErrorMessage("Izgleda da forma nije ispravno popunjena");
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{2,}$/.test(data["old-password"])) {
      setErrorMessage("Stara lozinka ne ispunjava pravila");
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{2,}$/.test(data["new-password"])) {
      setErrorMessage("Nova lozinka ne ispunjava pravila");
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{2,}$/.test(data["again-password"])) {
      setErrorMessage("Ponovljena lozinka ne ispunjava pravila");
      return;
    }
    if (data["old-password"] === data["new-password"]) {
      setErrorMessage("Stara i nova lozinka ne smeju biti iste !");
      return;
    }
    if (data["new-password"] !== data["again-password"]) {
      setErrorMessage("Nova i ponovljena lozinka se ne poklapaju!");
      return;
    }
    async function getPassword() {
      const changePasswordData = {
        oldPassword: data["old-password"],
        newPassword: data["new-password"],
      };
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/ApplicationUser/${userId}/ChangePassword`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(changePasswordData),
          }
        );
        if (!response.ok) {
          const error = await response.json();
          setErrorMessage("Error: "+error.message);
          return;
        }
        setSuccessChange(true);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (e) {
        setErrorMessage("Error: Greška od strane servera ! ");
      } finally {
        setIsLoading(false);
      }
    }
    getPassword();
  }
  return (
    <>
      <Header title="Promena lozinke" />
      {!successChange && (
        <div className="center-div">
          <form method="post" className="form-auth" onSubmit={handleSubmit}>
            <InputGroup
              inputId="old-password"
              inputName="Stara Lozinka"
              inputType="password"
            />
            <InputGroup
              inputId="new-password"
              inputName="Nova Lozinka"
              inputType="password"
            />
            <InputGroup
              inputId="again-password"
              inputName="Ponovljena Lozinka"
              inputType="password"
            />
            <button type="submit">
              {!isLoading ? "Promeni lozinku" : "Loading..."}
            </button>
          </form>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      )}
      {successChange && (
        <div>
          <Header title="Uspesna promena lozinke !" />
          <p className="center">Bicete preusmereni na početnu stranicu.</p>
        </div>
      )}
    </>
  );
}
