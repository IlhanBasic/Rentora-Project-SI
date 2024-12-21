import { useState,useEffect } from "react";
import { getTranslation } from "../data/translation.js";
function AdminSection({ title, data, onEdit, onDelete, onCancel }) {
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
  const detailsFields = [
    "registrationNumber",
    "picture",
    "fuelType",
    "numOfDoors",
    "transmission",
    "creditCardNumber",
    "firstName",
    "lastName",
    "phoneNumber",
    "email",
    "latitude",
    "longitude",
  ];
  function handleShowDetails() {}

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
export default AdminSection;
