import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import { getTranslation, getTranslationSection } from "../data/translation.js";
import API_URL from "../API_URL.js";
import "./AdminItemDetails.css";
import { imageDb } from "../FirebaseImagesUpload/Config.js";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { image } from "framer-motion/client";

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
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();
  const [img, setImg] = useState("");

  const closeModal = () => {
    setModalInfo((prev) => ({ ...prev, isOpen: false }));
    document.getElementById("root").style.filter = "blur(0)";
  };
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const url = `${API_URL}/Locations`;
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        setModalInfo({
          modalTitle:
            "Došlo je do greške sa serverom prilikom preuzimanja lokacija 🙁!",
          modalText: "Probajte ponovo kasnije.",
          isOpen: true,
        });
      }
    };
    fetchLocations();
  }, [token]);
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
  }, [id, section, token]);

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
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setItem(data);
      setLoading(false);
    } catch (error) {
      setModalInfo({
        modalTitle:
          "Došlo je do greške sa serverom prilikom preuzimanja podataka 🙁!",
        modalText: "Probajte ponovo kasnije.",
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
          yearOfManufacture: new Date().getFullYear(),
          registrationNumber: "",
          pricePerDay: 0,
          status: "Dostupno",
          picture: "",
          fuelType: "Dizel",
          numOfDoors: 3,
          transmission: "Automatik",
          type: "Limuzina",
          locationId: "",
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

  const validateVehicle = () => {
    const vehicleTypes = ["Limuzina", "Džip", "Hečbek"];
    const transmissionTypes = ["Automatik", "Manuelni"];
    const statusTypes = ["Dostupno", "Zauzeto"];
    const fuelTypes = ["Dizel", "Benzin", "Elektricni", "Hibrid"];
    if (!item.numOfDoors || ![3,5].includes(item.numOfDoors)) {
      throw new Error("Molimo izaberite validan broj vrata");
    }
    if (!item.fuelType || !fuelTypes.includes(item.fuelType.trim())) {
      throw new Error("Molimo izaberite validnu vrstu goriva");
    }
    if (!item.status || !statusTypes.includes(item.status.trim())) {
      throw new Error("Molimo izaberite validnu status vozila");
    }
    if (
      !item.transmission ||
      !transmissionTypes.includes(item.transmission.trim())
    ) {
      throw new Error("Molimo izaberite validnu tip menjača");
    }

    if (!item.type || !vehicleTypes.includes(item.type.trim())) {
      throw new Error("Molimo izaberite validan tip vozila");
    }

    if (
      !item.locationId ||
      !locations.some((location) => location.id === item.locationId)
    ) {
      throw new Error("Molimo izaberite validnu lokaciju vozila");
    }

    if (
      !item.brand?.trim() ||
      item.brand.length < 2 ||
      item.brand.length > 20
    ) {
      throw new Error(
        "Molimo unesite validnu marku vozila (min. 2 karaktera, max. 20 karaktera)"
      );
    }

    if (
      !item.model?.trim() ||
      item.model.length < 2 ||
      item.model.length > 20
    ) {
      throw new Error(
        "Molimo unesite validan model vozila (min. 2 karaktera, max. 20 karaktera)"
      );
    }

    if (
      !item.yearOfManufacture ||
      isNaN(item.yearOfManufacture) ||
      item.yearOfManufacture < 1900 ||
      item.yearOfManufacture > new Date().getFullYear()
    ) {
      throw new Error(
        "Molimo unesite validnu godinu proizvodnje vozila (min. 1900, max. trenutna godina)"
      );
    }

    const regNumberPattern = /^[A-Z]{2}\d{3,5}[A-Z]{2}$/;
    if (
      !item.registrationNumber?.trim() ||
      !regNumberPattern.test(item.registrationNumber)
    ) {
      throw new Error("Molimo unesite validan registarski broj (Npr. NP120AA)");
    }

    if (!item.pricePerDay || isNaN(item.pricePerDay) || item.pricePerDay <= 0) {
      throw new Error("Molimo unesite validnu cenu po danu (broj veći od 0)");
    }
    if (!item.picture?.trim() && img === null) {
      throw new Error("Molimo unesite URL slike");
    }
  };
  const validateLocation = () => {
    if (
      !item.street?.trim() ||
      item.street.length < 2 ||
      item.street.length > 200
    ) {
      throw new Error(
        "Molimo unesite validnu ulicu (min. 2 karaktera, max. 20 karaktera)"
      );
    }
    if (
      !item.streetNumber ||
      item.streetNumber < 1 ||
      item.streetNumber > 9999
    ) {
      throw new Error("Molimo unesite validan broj ulice (1-9999)");
    }
    if (!item.city?.trim() || item.city.length < 2 || item.city.length > 50) {
      throw new Error(
        "Molimo unesite validan grad (min. 2 karaktera, max. 20 karaktera)"
      );
    }
    if (
      !item.country?.trim() ||
      item.country.length < 2 ||
      item.country.length > 50
    ) {
      throw new Error(
        "Molimo unesite validnu državu (min. 2 karaktera, max. 20 karaktera)"
      );
    }
    if (
      !item.latitude ||
      isNaN(item.latitude) ||
      item.latitude < -90 ||
      item.latitude > 90
    ) {
      throw new Error(
        "Molimo unesite validnu geografsku sirinu (min. -90, max. 90)"
      );
    }
    if (
      !item.longitude ||
      isNaN(item.longitude) ||
      item.longitude < -180 ||
      item.longitude > 180
    ) {
      throw new Error(
        "Molimo unesite validnu geografsku dubinu (min. -180, max. 180)"
      );
    }
  };
  const validateUser = () => {
    if (
      !item.username?.trim() ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(item.username)
    ) {
      throw new Error(
        "Molimo unesite validan email (npr. example@example.com)"
      );
    }
    if (
      !item.password ||
      item.password.length < 6 ||
      !/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(item.password)
    ) {
      throw new Error(
        "Molimo unesite lozinku koja uključuje minimum jedno veliko slovo i broj i minimum dužinu 6 karaktera"
      );
    }
    if (
      !item.firstName?.trim() ||
      item.firstName.length < 2 ||
      item.firstName.length > 20
    ) {
      throw new Error(
        "Molimo unesite validno ime (min. 2 karaktera, max. 20 karaktera i samo slova)"
      );
    }
    if (
      !item.lastName?.trim() ||
      item.lastName.length < 2 ||
      item.lastName.length > 20
    ) {
      throw new Error(
        "Molimo unesite validno prezime (min. 2 karaktera, max. 20 karaktera i samo slova)"
      );
    }
    if (
      !item.phoneNumber ||
      !/^(?:\+381\s?6[0123456789]|06[0123456789])\s?\d{3}(?:\s|-)?\d{3,4}(?:\s|-)?\d{1,2}$/.test(
        item.phoneNumber
      )
    ) {
      throw new Error(
        "Molimo unesite validan broj mobilnog telefona (koji pružaju mobilni operateri republike srbije)"
      );
    }
    if (!item.roles || !["Admin", "User"].includes(item.roles)) {
      throw new Error("Molimo unesite validnu ulogu (Admin ili User)");
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]:
        name === "numOfDoors" ||
        name === "pricePerDay" ||
        name === "yearOfManufacture" ||
        name === "latitude" ||
        name === "longitude"
          ? parseFloat(value)
          : value,
    }));
  };
  const handleChangePhoto = (e, key) => {
    setImg(e.target.files[0]);
  };

  const createItem = async () => {
    setSuccessfullChange(true);
    try {
      if (section === "vehicles") {
        validateVehicle();

        if (img) {
          const imgRef = ref(imageDb, `Images/${v4()}`);
          const uploadResult = await uploadBytes(imgRef, img);
          const imageUrl = await getDownloadURL(uploadResult.ref);
          item.picture = imageUrl;
        }
      }

      if (section === "locations") {
        validateLocation();
      }
      if (section === "users") {
        validateUser();
      }

      const endpoint = section === "users" ? "Auth/CreateUser" : apiPoint;
      const url = `${API_URL}/${endpoint}`;

      if (section === "users" && typeof item.roles === "string") {
        item.roles = [item.roles];
      }

      const itemToCreate = img ? { ...item, picture: item.picture } : item;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemToCreate),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Server error");
      }

      setModalInfo({
        modalTitle: "Promene su uspešno završene ✅!",
        modalText: "Bićete automatski preusmereni na /Admin.",
        isOpen: true,
      });
      setTimeout(() => {
        navigate("/Admin");
      }, 2000);
    } catch (error) {
      setModalInfo({
        modalTitle: "Greška ❌!",
        modalText:
          error.message || "Došlo je do greške. Probajte ponovo kasnije.",
        isOpen: true,
      });
    } finally {
      setSuccessfullChange(false);
    }
  };

  const updateItem = async () => {
    setSuccessfullChange(true);
    try {
      if (section === "vehicles") {
        validateVehicle();

        if (img) {
          const imgRef = ref(imageDb, `Images/${v4()}`);
          const uploadResult = await uploadBytes(imgRef, img);
          const imageUrl = await getDownloadURL(uploadResult.ref);
          item.picture = imageUrl;
        }
      }

      if (section === "locations") {
        validateLocation();
      }

      const endpoint = section === "users" ? "ApplicationUser" : apiPoint;
      const url = `${API_URL}/${endpoint}/${id}`;

      const itemToUpdate = img ? { ...item, picture: item.picture } : item;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemToUpdate),
      });

      if (!response.ok) {
        throw new Error(response.statusText || "Server error");
      }

      setModalInfo({
        modalTitle: "Promene su uspešno završene ✅!",
        modalText: "Bićete automatski preusmereni na /Admin.",
        isOpen: true,
      });
      setSuccessfullChange(true);
      setTimeout(() => {
        navigate("/Admin");
      }, 2000);
    } catch (error) {
      setModalInfo({
        modalTitle: "Greška!",
        modalText:
          error.message || "Došlo je do greške. Probajte ponovo kasnije.",
        isOpen: true,
      });
    } finally {
      setSuccessfullChange(false);
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
            : `Izmeni ${getTranslationSection(section)}`}
        </h1>
        <form onSubmit={handleSave} className="admin-item-form">
          {Object.keys(item).map((key) => {
            if (
              (typeof item[key] === "object" &&
                item[key] !== null &&
                !Array.isArray(item[key])) ||
              key === "id" ||
              key === "location"
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
                      value={item[key] || 3}
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
                  ) : key === "locationId" ? (
                    <select
                      name={key}
                      value={item[key] || ""}
                      onChange={handleChange}
                      required
                      className="admin-form-input"
                    >
                      <option value="">Izaberite lokaciju</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {`${location.street}, ${location.streetNumber}, ${location.city}, ${location.country}`}
                        </option>
                      ))}
                    </select>
                  ) : key === "roles" ? (
                    <select
                      name={key}
                      value={item[key] || ["Admin"]}
                      onChange={handleChange}
                      required
                      className="admin-form-input"
                    >
                      <option value="Admin">Admin</option>
                      <option value="User">Korisnik</option>
                    </select>
                  ) : key === "picture" ? (
                    <input
                      type="file"
                      name={key}
                      id={key}
                      // value={item[key] || ""}
                      onChange={(e) => handleChangePhoto(e, key)}
                    />
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
                      min={
                        key === "yearOfManufacture"
                          ? "1900"
                          : key === "pricePerDay"
                          ? "0"
                          : undefined
                      }
                      max={
                        key === "yearOfManufacture"
                          ? new Date().getFullYear().toString()
                          : undefined
                      }
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
