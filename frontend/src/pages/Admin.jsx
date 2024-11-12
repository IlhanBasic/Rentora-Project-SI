import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Modal from "../components/Modal.jsx";

function Section({ title, data, onEdit, onDelete, isEditable }) {
  return (
    <div>
      <h1>{title}</h1>
      {isEditable && <button onClick={() => onEdit(null)}>Dodaj novi</button>}
      <div>
        {data && data.length > 0 ? (
          data.map((item) => (
            <div key={item.id} className="table-row">
              {Object.entries(item)
                .filter(
                  ([key, value]) => typeof value !== "object" || value === null
                )
                .map(([key, value], index) => (
                  <div key={index} className="vertical-table-row">
                    <strong>{key}:</strong>
                    <span>{value}</span>
                  </div>
                ))}
              <div className="edit-buttons">
                {isEditable && (
                  <>
                    {title !== "Korisnici" && (
                      <button onClick={() => onEdit(item)}>Izmeni</button>
                    )}
                    <button onClick={() => onDelete(item.id)}>Obriši</button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Nema podataka</p>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { token, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
    if (token && !isAdmin) {
      navigate("/");
    }
  }, [token]);

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
    fetchData("Vehicles", setVehicles);
    fetchData("Reservations", setReservations);
    fetchData("Auth/Users", setUsers);
    fetchData("Locations", setLocations);
  }, []);

  const fetchData = async (endpoint, setter) => {
    try {
      const response = await fetch(`https://localhost:7247/api/${endpoint}`);
      const data = await response.json();
      setter(data);
    } catch (error) {
      setModalInfo({
        modalTitle:
          "Došlo je do greške sa serverom prilikom preuzimanja podataka 🙁!",
        modalText: `Error: ${error.message}. Probajte ponovo kasnije.`,
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
    const endpoint = activeSection === "users" ? "Auth/Users" : activeSection;
    const url = `https://localhost:7247/api/${endpoint}/${id}`;
    if (window.confirm("Da li ste sigurni da želite da obrišete?")) {
      try {
        await fetch(url, {
          method: "DELETE",
        });
        setModalInfo({
          modalTitle: "Uspešno obrisano ✅!",
          modalText: `Prikaz će biti uskoro osvežen.`,
          isOpen: true,
        });
        fetchData(endpoint, getSetter(activeSection));
      } catch (error) {
        setModalInfo({
          modalTitle: "Došlo je do greške prilikom brisanja 🙁!",
          modalText: `Error: ${error.message}. Pokušajte opet kasnije.`,
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

  const renderSection = () => {
    const isEditable = ["vehicles", "locations", "users"].includes(
      activeSection
    );
    switch (activeSection) {
      case "vehicles":
        return (
          <Section
            title="Vozila"
            data={vehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditable={isEditable}
          />
        );
      case "reservations":
        return (
          <Section
            title="Rezervacije"
            data={reservations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditable={false}
          />
        );
      case "users":
        return (
          <Section
            title="Korisnici"
            data={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditable={isEditable}
          />
        );
      case "locations":
        return (
          <Section
            title="Lokacije"
            data={locations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditable={isEditable}
          />
        );
      default:
        return (
          <Section
            title="Vozila"
            data={vehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditable={isEditable}
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
        <nav className="admin-nav-container">
          <div className="fixed-navbar">
            <div className="admin-nav-title">
              <h1>Admin Panel</h1>
              <button
                className="back-home"
                onClick={() => {
                  navigate("/");
                }}
              >
                Home
              </button>
            </div>
            <ul className="admin-nav-list">
              {["vehicles", "reservations", "users", "locations"].map(
                (section) => (
                  <li
                    key={section}
                    className={`admin-nav-item ${
                      activeSection === section ? "active" : ""
                    }`}
                    onClick={() => setActiveSection(section)}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </li>
                )
              )}
              <button onClick={()=>navigate('../change-password')}>Promena lozinke</button>
            </ul>
          </div>
        </nav>
        <div className="admin-content-container">{renderSection()}</div>
      </div>
    </>
  );
}
