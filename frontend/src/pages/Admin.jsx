import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Modal from "../components/Modal.jsx";
import { getTranslation } from "../data/translation.js";
import API_URL from "../API_URL.js";
function search(data, searchValue) {
  return data.filter((item) => {
    return Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    );
  });
}

function Section({ title, data, onEdit, onDelete, onCancel }) {
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  function handleSubmitSearch(e) {
    e.preventDefault();
    const searchValue = e.target[0].value.trim();
    e.target[0].value = "";

    const results = search(data, searchValue);
    setFilteredData(results);
  }
  function filterVehiclesAvailability(vehicles, status) {
    if (status === "Sve") return vehicles;
    return vehicles.filter((vehicle) => vehicle.status === status);
  }
  function filterReservationsAvailability(reservations, status) {
    if (status === "Sve") return reservations;
    return reservations.filter(
      (reservation) => reservation.reservationStatus === status
    );
  }
  const detailsFields = ["registrationNumber","picture","fuelType","numOfDoors","transmission","creditCardNumber","firstName","lastName","phoneNumber","email","latitude","longitude"];
  function handleShowDetails(){
    
  }

  return (
    <>
      <h1>{title}</h1>
      {title !== "Rezervacije" && (
        <button onClick={() => onEdit(null)}>Dodaj novi red</button>
      )}

      <form className="search-form" onSubmit={handleSubmitSearch}>
        <input className="search-input" type="text" placeholder="Pretraga" />
        <button className="search-button">Pretraži</button>
      </form>
      {
        <div className="results-count">
          <p>Ukupno pronađeno: {filteredData.length}</p>
        </div>
      }
      {title === "Vozila" && (
        <button
          className="filter-button"
          onClick={() =>
            setFilteredData(filterVehiclesAvailability(data, "Dostupno"))
          }
        >
          Prikaži samo dostupna vozila
        </button>
      )}
      {title === "Vozila" && (
        <button
          className="filter-button"
          onClick={() =>
            setFilteredData(filterVehiclesAvailability(data, "Zauzeto"))
          }
        >
          Prikaži samo zauzeta vozila
        </button>
      )}
      {title === "Vozila" && (
        <button
          className="filter-button"
          onClick={() =>
            setFilteredData(filterVehiclesAvailability(data, "Sve"))
          }
        >
          Prikaži sva vozila
        </button>
      )}
      {title === "Rezervacije" && (
        <button
          className="filter-button"
          onClick={() =>
            setFilteredData(filterReservationsAvailability(data, "Aktivna"))
          }
        >
          Prikaži samo aktivne rezervacije
        </button>
      )}
      {title === "Rezervacije" && (
        <button
          className="filter-button"
          onClick={() =>
            setFilteredData(filterReservationsAvailability(data, "Otkazana"))
          }
        >
          Prikaži samo otkazane rezervacije
        </button>
      )}
      {title === "Rezervacije" && (
        <button
          className="filter-button"
          onClick={() =>
            setFilteredData(filterReservationsAvailability(data, "Sve"))
          }
        >
          Prikaži sve rezervacije
        </button>
      )}
      <>
        {filteredData && filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id} className="table-row">
              <div className="vehicle-info">
                {Object.entries(item)
                  .filter(
                    ([key, value]) =>
                      typeof value !== "object" ||
                      value === null ||
                      key === "id"
                  )
                  .map(([key, value], index) => (
                    <div key={index} className="vertical-table-row">
                      <strong>{getTranslation(key)}:</strong>
                      <span>{value}</span>
                    </div>
                  ))}
                  <button onClick={handleShowDetails}>Detalji</button>
              </div>
              {item.picture && (
                <div className="vehicle-image-container">
                  <img
                    src={item.picture}
                    alt="Vehicle"
                    className="vehicle-image"
                  />
                </div>
              )}
              <div className="edit-buttons">
                <>
                  {title !== "Korisnici" && title !== "Rezervacije" && (
                    <button onClick={() => onEdit(item)}>Izmeni</button>
                  )}
                  {title === "Rezervacije" &&
                    item.reservationStatus !== "Otkazana" &&
                    item.reservationStatus !== "Istekla" && (
                      <button onClick={() => onCancel(item.id)}>Otkazi</button>
                    )}
                  {title !== "Rezervacije" && (
                    <button onClick={() => onDelete(item.id)}>Obriši</button>
                  )}
                </>
              </div>
            </div>
          ))
        ) : (
          <p>Nema podataka</p>
        )}
      </>
    </>
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
  }, [token, isAdmin]);

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

        fetchData(endpoint, getSetter(activeSection));
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

  const renderSection = () => {
    switch (activeSection) {
      case "vehicles":
        return (
          <Section
            title="Vozila"
            data={vehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case "reservations":
        return (
          <Section
            title="Rezervacije"
            data={reservations}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        );
      case "users":
        return (
          <Section
            title="Korisnici"
            data={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case "locations":
        return (
          <Section
            title="Lokacije"
            data={locations}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      default:
        return (
          <Section
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
          </div>
        </nav>
        <div className="admin-content-container">{renderSection()}</div>
      </div>
    </>
  );
}
