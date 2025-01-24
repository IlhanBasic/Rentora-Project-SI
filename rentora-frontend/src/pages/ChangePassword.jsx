import { useContext, useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import InputGroup from "../components/InputGroup.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import API_URL from "../API_URL.js";
import Modal from "../components/Modal.jsx";
import "./ChangePassword.css";

export default function ChangePassword() {
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
  const { token, userId } = useContext(AuthContext);
  const [successChange, setSuccessChange] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    console.log("Modal state updated:", modalInfo);
  }, [modalInfo]);

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

    if (!/^(?=.*[A-Z])(?=.*\d).{2,}$/.test(data["old-password"])) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText: "Stara lozinka mora sadržati barem jedno veliko slovo i broj.",
      });
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{2,}$/.test(data["new-password"])) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText: "Nova lozinka mora sadržati barem jedno veliko slovo i broj.",
      });
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{2,}$/.test(data["again-password"])) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText: "Ponovljena lozinka mora sadržati barem jedno veliko slovo i broj.",
      });
      return;
    }

    if (data["old-password"] === data["new-password"]) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText: "Stara i nova lozinka ne smeju biti iste!",
      });
      return;
    }

    if (data["new-password"] !== data["again-password"]) {
      setModalInfo({
        isOpen: true,
        modalTitle: "Greška",
        modalText: "Nova i ponovljena lozinka se ne poklapaju!",
      });
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
          navigate("/");
        }, 1500);
      } catch (e) {
        setModalInfo({
          isOpen: true,
          modalTitle: "Greška",
          modalText: "Greška na serveru! Pokušajte ponovo kasnije.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    getPassword();
  }

  return (
    <>
      <Modal
        open={modalInfo.isOpen}
        close={closeModal}
        title={modalInfo.modalTitle}
        text={modalInfo.modalText}
      />

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
            <button type="submit" className="btn-submit">
              {!isLoading ? "Promeni lozinku" : "Loading..."}
            </button>
          </form>
        </div>
      )}
      {successChange && (
        <div>
          <Header title="Uspešna promena lozinke!" />
          <p className="center">Bićete preusmereni na početnu stranicu.</p>
        </div>
      )}
    </>
  );
}

