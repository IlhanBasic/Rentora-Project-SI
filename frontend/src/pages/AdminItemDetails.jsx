import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import { getTranslation, getTranslationSection } from "../data/translation.js";
import API_URL from "../API_URL.js";
import "./AdminItemDetails.css";  
export default function AdminItemDetails() {
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    modalTitle: "",
    modalText: "",
  });
  const [successfullChange, setSuccessfullChange] = useState(false);
  const { token } = useContext(AuthContext);
  const { section, id } = useParams();
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiPoint, setApiPoint] = useState("Vehicles");
  const navigate = useNavigate();
  const closeModal = () => {
    setModalInfo((prev) => ({ ...prev, isOpen: false }));
    document.getElementById("root").style.filter = "blur(0)";
  };

  useEffect(() => {
    let newApiPoint;

    switch (section) {
      case "locations":
        newApiPoint = "Locations";
        break;
      case "reservations":
        newApiPoint = "Reservations";
        break;
      case "users":
        newApiPoint = "ApplicationUser";
        break;
      default:
        newApiPoint = "Vehicles";
        break;
    }

    setApiPoint(newApiPoint);

    if (id !== "new") {
      fetchData(newApiPoint);
    } else {
      setLoading(false);
      initializeNewItem();
    }
  }, [id, section]);

  const fetchData = async (updatedApiPoint) => {
    try {
      const url = `${API_URL}/${updatedApiPoint}${id ? `/${id}` : ""}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        setModalInfo({
          modalTitle:
            "Došlo je do greške sa serverom prilikom preuzimanja podataka 🙁!",
          modalText: `Probajte ponovo kasnije.`,
          isOpen: true,
        });
      }
      const data = await response.json();
      setItem(data);
      setLoading(false);
    } catch (error) {
      setModalInfo({
        modalTitle:
          "Došlo je do greške sa serverom prilikom preuzimanja podataka 🙁!",
        modalText: `Probajte ponovo kasnije.`,
        isOpen: true,
      });
      setLoading(false);
    }
  };

  const initializeNewItem = () => {
    switch (section) {
      case "users":
        setItem({
          username: "",
          password: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          roles: [""],
        });
        break;
      case "vehicles":
        setItem({
          brand: "",
          model: "",
          yearOfManufacture: 0,
          registrationNumber: "",
          pricePerDay: 0,
          status: "Dostupno",
          picture: "",
          fuelType: "Dizel",
          numOfDoors: 3,
          transmission: "Automatik",
          type: "Limuzina",
        });
        break;
      case "reservations":
        setItem({
          userId: "",
          creditCardNumber: "",
          vehicleId: "",
          startLocationId: "",
          endLocationId: "",
          startDateTime: "",
          endDateTime: "",
          reservationStatus: "",
        });
        break;
      case "locations":
        setItem({
          street: "",
          streetNumber: "",
          city: "",
          country: "",
          latitude: 0,
          longitude: 0,
        });
        break;
      default:
        setItem({});
        break;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]:
        name === "pricePerDay" ||
        name === "yearOfManufacture" ||
        name === "latitude" ||
        name === "longitude"
          ? parseFloat(value)
          : name === "numOfDoors" ||
            name === "fuelType" ||
            name === "transmissionType" ||
            name === "vehicleType" ||
            name === "status"
          ? value // For these fields, just assign the selected value
          : value,
    }));
  };

  const createItem = async () => {
    const endpoint = section === "users" ? "Auth/Register" : apiPoint;
    const url = `https://localhost:7247/api/${endpoint}`;

    if (section === "users" && typeof item.roles === "string") {
      item.roles = [item.roles];
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const error = await response.json();
        setModalInfo({
          modalTitle:
            "Došlo je do greške sa serverom prilikom čuvanja podataka 🙁!",
          modalText: `Probajte ponovo kasnije. Error: ${error.message}`,
          isOpen: true,
        });
      } else {
        setModalInfo({
          modalTitle: "Promene su uspešno završene ✅!",
          modalText: `Bićete automatski preusmereni na /Admin.`,
          isOpen: true,
        });
        setSuccessfullChange(true);
        setTimeout(() => {
          navigate(`/Admin`);
        }, 2000);
      }
    } catch (error) {
      setModalInfo({
        modalTitle:
          "Došlo je do greške sa serverom prilikom čuvanja podataka 🙁!",
        modalText: `Error: ${error.message}. Probajte ponovo kasnije.`,
        isOpen: true,
      });
    }
  };

  const updateItem = async () => {
    const endpoint = section === "users" ? "ApplicationUser" : apiPoint;
    const url = `${API_URL}/${endpoint}/${id}`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        setModalInfo({
          modalTitle:
            "Došlo je do greške sa serverom prilikom čuvanja promena 🙁!",
          modalText: `Error: ${response.statusText}. Probajte ponovo kasnije.`,
          isOpen: true,
        });
      } else {
        setModalInfo({
          modalTitle: "Promene su uspešno završene ✅!",
          modalText: `Bićete automatski preusmereni na /Admin.`,
          isOpen: true,
        });
        setSuccessfullChange(true);
        setTimeout(() => {
          navigate(`/Admin`);
        }, 2000);
      }
    } catch (error) {
      setModalInfo({
        modalTitle:
          "Došlo je do greške sa serverom prilikom čuvanja promena 🙁!",
        modalText: `Error: ${error.message}. Probajte ponovo kasnije.`,
        isOpen: true,
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (id === "new") {
      createItem();
    } else {
      updateItem();
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Modal
        open={modalInfo.isOpen}
        close={closeModal}
        title={modalInfo.modalTitle}
        text={modalInfo.modalText}
      />
      <div className="admin-item-details">
        <h1 className="admin-title">
          {id === "new"
            ? `Dodaj ${getTranslationSection(section)}`
            : `Izmeni ${section}`}
        </h1>
        <form onSubmit={handleSave} className="admin-item-form">
          {Object.keys(item).map((key) => {
            if (
              typeof item[key] === "object" &&
              item[key] !== null &&
              !Array.isArray(item[key])
            ) {
              return null;
            }

            return (
              <div className="admin-form-group" key={key}>
                <label className="admin-form-label">
                  {getTranslation(key)}
                  {key === "numOfDoors" ? (
                    <select
                      name={key}
                      value={item[key] || "3"} 
                      onChange={handleChange}
                      required
                      className="admin-form-input"
                    >
                      <option value="3">3</option>
                      <option value="5">5</option>
                    </select>
                  ) : key === "fuelType" ? (
                    <select
                      name={key}
                      value={item[key] || "Dizel"} 
                      onChange={handleChange}
                      required
                      className="admin-form-input"
                    >
                      <option value="Dizel">Dizel</option>
                      <option value="Benzin">Benzin</option>
                      <option value="Elektricno">Elektricno</option>
                      <option value="Hibrid">Hibrid</option>
                    </select>
                  ) : key === "transmission" ? (
                    <select
                      name={key}
                      value={item[key] || "Automatik"}
                      onChange={handleChange}
                      required
                      className="admin-form-input"
                    >
                      <option value="Automatik">Automatik</option>
                      <option value="Manuelni">Manuelni</option>
                    </select>
                  ) : key === "type" ? (
                    <select
                      name={key}
                      value={item[key] || "Limuzina"}
                      onChange={handleChange}
                      required
                      className="admin-form-input"
                    >
                      <option value="Limuzina">Limuzina</option>
                      <option value="Džip">Džip</option>
                      <option value="Hečbek">Hečbek</option>
                      <option value="Kabriolet">Kabriolet</option>
                    </select>
                  ) : key === "status" ? (
                    <select
                      name={key}
                      value={item[key] || "Dostupno"} 
                      onChange={handleChange}
                      required
                      className="admin-form-input"
                    >
                      <option value="Dostupno">Dostupno</option>
                      <option value="Zauzeto">Zauzeto</option>
                    </select>
                  ) : (
                    <input
                      type={
                        typeof item[key] === "number"
                          ? "number"
                          : key === "password"
                          ? "password"
                          : key === "username"
                          ? "email"
                          : "text"
                      }
                      name={key}
                      value={item[key] || ""}
                      onChange={handleChange}
                      required={key === "creditCardNumber" ? false : true}
                      className="admin-form-input"
                    />
                  )}
                </label>
              </div>
            );
          })}

          <button
            disabled={successfullChange}
            type="submit"
            className="admin-submit-button"
          >
            Sačuvaj
          </button>
        </form>
      </div>
    </>
  );
}
