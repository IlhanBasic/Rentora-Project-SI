import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Modal from "../components/Modal.jsx";
import AdminSection from "./AdminSection";
import API_URL from "../API_URL.js";
import "./Admin.css";
export default function AdminPage() {
  const [hamburgerMenu, setHamburgerMenu] = useState(true);
  function handleToggle() {
    setHamburgerMenu((prev) => !prev);
  }
  const { token, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, []);

  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    modalTitle: "",
    modalText: "",
  });

  const closeModal = () => {
    setModalInfo((prev) => ({ ...prev, isOpen: false }));
    document.getElementById("root").style.filter = "blur(0)";
  };

  const [activeSection, setActiveSection] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchData("Vehicles/all", setVehicles);
    fetchData("Reservations", setReservations);
    fetchData("ApplicationUser", setUsers);
    fetchData("Locations", setLocations);
  }, []);

  const fetchData = async (endpoint, setter) => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.log(error);
      setModalInfo({
        modalTitle:
          "Došlo je do greške sa serverom prilikom preuzimanja podataka 🙁!",
        modalText: `Probajte ponovo kasnije.`,
        isOpen: true,
      });
    }
  };

  const handleEdit = (item) => {
    if (item) {
      navigate(`/Admin/${activeSection}/${item.id}`);
    } else {
      navigate(`/Admin/${activeSection}/new`);
    }
  };

  const handleDelete = async (id) => {
    const endpoint =
      activeSection === "users" ? "ApplicationUser" : activeSection;
    const url = `${API_URL}/${endpoint}/${id}`;
    if (window.confirm("Da li ste sigurni da želite da obrišete?")) {
      try {
        await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        fetchData(
          endpoint === "vehicles" ? "Vehicles/all" : endpoint,
          getSetter(activeSection)
        );
        setModalInfo({
          modalTitle: "Uspešno obrisano ✅!",
          modalText: `Prikaz će biti uskoro osvežen.`,
          isOpen: true,
        });
      } catch (error) {
        setModalInfo({
          modalTitle: "Došlo je do greške prilikom brisanja 🙁!",
          modalText: `Pokušajte opet kasnije.`,
          isOpen: true,
        });
      }
    }
  };
  const handleCancel = async (id) => {
    const endpoint = "Reservations";
    const url = `${API_URL}/${endpoint}/${id}`;
    if (
      window.confirm("Da li ste sigurni da želite da otkažete rezervaciju?")
    ) {
      try {
        await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reservationStatus: "Otkazana" }),
        });

        fetchData(endpoint, getSetter(activeSection));
        setModalInfo({
          modalTitle: "Uspešno otkazano ✅!",
          modalText: `Prikaz će biti uskoro osvežen.`,
          isOpen: true,
        });
      } catch (error) {
        setModalInfo({
          modalTitle:
            "Došlo je do greške prilikom otkazivanja rezervacije  🙁!",
          modalText: `Pokušajte opet kasnije.`,
          isOpen: true,
        });
      }
    }
  };
  const getSetter = (section) => {
    switch (section) {
      case "vehicles":
        return setVehicles;
      case "reservations":
        return setReservations;
      case "users":
        return setUsers;
      case "locations":
        return setLocations;
      default:
        return () => {};
    }
  };
  const RenderSection = () => {
    switch (activeSection) {
      case "vehicles":
        return (
          <AdminSection
            title="Vozila"
            data={vehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case "reservations":
        return (
          <AdminSection
            title="Rezervacije"
            data={reservations}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        );
      case "users":
        return (
          <AdminSection
            title="Korisnici"
            data={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case "locations":
        return (
          <AdminSection
            title="Lokacije"
            data={locations}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      default:
        return (
          <AdminSection
            title="Vozila"
            data={vehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
    }
  };

  return (
    <>
      <Modal
        open={modalInfo.isOpen === true}
        close={closeModal}
        title={modalInfo.modalTitle}
        text={modalInfo.modalText}
      />
      <div className="admin-page-container">
        <nav className={`admin-nav-container ${hamburgerMenu ? "active" : ""}`}>
          <div className="fixed-navbar">
            <div className="admin-nav-title">
              <h1>Admin Panel</h1>
              <button
                className="back-home"
                onClick={() => {
                  navigate("/");
                }}
              >
                Početna
              </button>
            </div>
            <ul className="admin-nav-list">
              {[
                { key: "vehicles", label: "Vozila" },
                { key: "reservations", label: "Rezervacije" },
                { key: "users", label: "Korisnici" },
                { key: "locations", label: "Lokacije" },
              ].map(({ key, label }) => (
                <li
                  key={key}
                  className={`admin-nav-item ${
                    activeSection === key ? "active" : ""
                  }`}
                  onClick={() => setActiveSection(key)}
                >
                  {label}
                </li>
              ))}
              <button onClick={() => navigate("../change-password")}>
                Promena lozinke
              </button>
            </ul>
            <button
              className={`hamburger-admin ${hamburgerMenu ? "active" : ""} `}
              aria-label="Toggle menu"
              onClick={handleToggle}
            ></button>
          </div>
        </nav>
        <div className="admin-content-container">{RenderSection()}</div>
      </div>
    </>
  );
}
