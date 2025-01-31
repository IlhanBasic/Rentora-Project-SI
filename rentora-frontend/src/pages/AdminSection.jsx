  import { useState, useEffect } from "react";
  import { getTranslation } from "../data/translation.js";
  import AdminModal from "../components/AdminModal.jsx";
  function AdminSection({ title, data, onEdit, onDelete, onCancel }) {
    const [modalInfo, setModalInfo] = useState({ isOpen: false, data: {} });
    const closeModal = () => {
      setModalInfo((prev) => ({ ...prev, isOpen: false }));
      document.getElementById("root").style.filter = "blur(0)";
    };

    function search(data, searchValue) {
      return data.filter((item) => {
        return Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchValue.toLowerCase())
        );
      });
    }

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
    const basicFields = [
      "fuelType",
      "reservationAmount",
      "numOfDoors",
      "street",
      "streetNumber",
      "city",
      "transmission",
      "firstName",
      "lastName",
      "phoneNumber",
      "email",
      "brand",
      "model",
      "vehicleBrand",
      "vehicleModel",
      "reservationStatus",
      "startDateTime",
      "endDateTime",
      "status"
    ];

    function handleShowDetails(item) {
      setModalInfo((prev) => ({ data: { ...item }, isOpen: true }));
    }

    return (
      <>
        <AdminModal
          open={modalInfo.isOpen}
          close={closeModal}
          data={modalInfo.data}
        />
        <div className="admin-title-container">
          <h1>{title}</h1>
          {title !== "Rezervacije" && (
            <button id="add-button" onClick={() => onEdit(null)}>Dodaj novi red</button>
          )}
        </div>

        <form className="search-form" onSubmit={handleSubmitSearch}>
          <input className="search-input" type="text" placeholder="Pretraga" />
          <button className="search-button">Pretraži</button>
        </form>

        <div className="results-count">
          <p>Ukupno pronađeno: {filteredData.length}</p>
        </div>
        {title === "Vozila" && (
          <div className="filter-buttons">
            <button
              className="filter-button"
              onClick={() =>
                setFilteredData(filterVehiclesAvailability(data, "Dostupno"))
              }
            >
              Prikaži samo dostupna vozila
            </button>
            <button
              className="filter-button"
              onClick={() =>
                setFilteredData(filterVehiclesAvailability(data, "Zauzeto"))
              }
            >
              Prikaži samo zauzeta vozila
            </button>
            <button
              className="filter-button"
              onClick={() =>
                setFilteredData(filterVehiclesAvailability(data, "Sve"))
              }
            >
              Prikaži sva vozila
            </button>
          </div>
        )}

        {title === "Rezervacije" && (
          <>
            <div className="filter-buttons">
              <button
                className="filter-button"
                onClick={() =>
                  setFilteredData(filterReservationsAvailability(data, "Aktivna"))
                }
              >
                Prikaži samo aktivne rezervacije
              </button>
              <button
                className="filter-button"
                onClick={() =>
                  setFilteredData(
                    filterReservationsAvailability(data, "Otkazana")
                  )
                }
              >
                Prikaži samo otkazane rezervacije
              </button>
              <button
                className="filter-button"
                onClick={() =>
                  setFilteredData(filterReservationsAvailability(data, "Sve"))
                }
              >
                Prikaži sve rezervacije
              </button>
            </div>
          </>
        )}
        {filteredData && filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id} className="table-row">
              <div className="table-info">
                {Object.entries(item)
                  .filter(([key]) => basicFields.includes(key))
                  .map(([key, value], index) => (
                    <div key={index} className="vertical-table-row">
                      <strong>{getTranslation(key)}:</strong>
                      <span>
                        {value} {key === "reservationAmount" && "RSD"}
                      </span>
                    </div>
                  ))}
                <button onClick={() => handleShowDetails(item)}>Detalji</button>
              </div>

              {item.picture&& (
                <div className="table-image-container">
                  <img
                    src={item.picture }
                    alt="Table Image"
                    className="table-image"
                  />
                </div>
              )}

              <div className="edit-buttons">
                {title !== "Korisnici" && title !== "Rezervacije" && (
                  <button onClick={() => onEdit(item)}>Izmeni</button>
                )}
                {title === "Rezervacije" &&
                  item.reservationStatus !== "Otkazana" &&
                  item.reservationStatus !== "Istekla" && (
                    <button onClick={() => onCancel(item.id)}>Otkaži</button>
                  )}
                  <button onClick={() => onDelete(item.id)}>Obriši</button>
              </div>
            </div>
          ))
        ) : (
          <p>Nema podataka</p>
        )}
      </>
    );
  }

  export default AdminSection;
