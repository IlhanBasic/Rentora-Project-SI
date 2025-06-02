import { useContext, useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import InputGroup from "../components/InputGroup.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import API_URL from "../API_URL.js";
import Modal from "../components/Modal.jsx";
export default function ResetPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    modalTitle: "",
    modalText: "",
  });

  const closeModal = () => {
    setModalInfo((prev) => ({ ...prev, isOpen: false }));
    document.getElementById("root").style.filter = "blur(0)";
  };

  const [isLoading, setIsLoading] = useState(false);
  const [successChange, setSuccessChange] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    if (!data) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText: "Izgleda da forma nije ispravno popunjena",
      });
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{2,}$/.test(data["newPassword"])) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText:
          "Nova lozinka mora sadržati barem jedno veliko slovo i broj.",
      });
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{2,}$/.test(data["againPassword"])) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText:
          "Ponovljena lozinka mora sadržati barem jedno veliko slovo i broj.",
      });
      return;
    }

    if (data["newPassword"] !== data["againPassword"]) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText: "Nova i ponovljena lozinka se ne poklapaju!",
      });
      return;
    }

    async function getPassword() {
      const changePasswordData = {
        email: email,
        pin: data["pin"],
        newPassword: data["newPassword"],
      };
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/ApplicationUser/reset-password`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changePasswordData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          setModalInfo({
            isOpen: true,
            modalTitle: "Greška",
            modalText: `Došlo je do greške: ${error.message}`,
          });
          return;
        }

        setSuccessChange(true);
        setModalInfo({
          isOpen: true,
          modalTitle: "Uspešno promenjeno",
          modalText: "Lozinka je uspešno promenjena!",
        });

        setTimeout(() => {
          setModalInfo({
            isOpen: false,
            modalTitle: "",
            modalText: "",
          });
          closeModal();
          navigate("/");
        }, 1500);
      } catch (e) {
        setModalInfo({
          isOpen: true,
          modalTitle: "Greška",
          modalText: e.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
    getPassword();
  }
  async function emailSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    if (!data) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText: "Izgleda da forma nije ispravno popunjena",
      });
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (data["email"] === "" || !emailRegex.test(data["email"])) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText: "Email nije ispravno popunjen!",
      });
    } else {
      setEmailSent(true);
      await sendResetPasswordEmail(email);
    }
  }
  async function sendResetPasswordEmail(email) {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/ApplicationUser/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setErrorMessages({ global: "Greška: " + error.message });
        return;
      }
    } catch (e) {
      setErrorMessages({ global: e.message });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <Modal
        open={modalInfo.isOpen}
        close={closeModal}
        title={modalInfo.modalTitle}
        text={modalInfo.modalText}
      />

      <Header title="Restartovanje lozinke" />
      {!emailSent && (
        <form onSubmit={emailSubmit} className="form-auth" method="post">
          <input
            placeholder="Email"
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-submit">Potvrdi</button>
        </form>
      )}
      {emailSent && !successChange && (
        <div className="center-div">
          <form method="post" className="form-auth" onSubmit={handleSubmit}>
            <InputGroup inputId="pin" inputName="PIN" inputType="text" />
            <InputGroup
              inputId="newPassword"
              inputName="Nova Lozinka"
              inputType="password"
            />
            <InputGroup
              inputId="againPassword"
              inputName="Ponovljena Lozinka"
              inputType="password"
            />
            <button type="submit" id="btn-submit" className="btn-submit">
              {!isLoading ? "Restartuj lozinku" : "Loading..."}
            </button>
          </form>
        </div>
      )}
      {email && successChange && (
        <div>
          <Header title="Uspešna promena lozinke!" />
          <p id="confirmation-text" className="center">
            Bićete preusmereni na početnu stranicu.
          </p>
        </div>
      )}
    </>
  );
}
