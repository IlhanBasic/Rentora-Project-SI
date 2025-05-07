  import { useState, useEffect } from "react";
  import { getTranslation } from "../data/translation.js";
  import AdminModal from "../components/AdminModal.jsx";
  import "./AdminSection.css";
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
  
  <div className="admin-header">
    <div className="admin-title-container">
      <h1>{title}</h1>
      {title !== "Rezervacije" && (
        <button id="add-button" onClick={() => onEdit(null)}>
          <i className="fas fa-plus"></i> Dodaj novi red
        </button>
      )}
    </div>

    <div className="admin-controls">
      <form className="search-form" onSubmit={handleSubmitSearch}>
        <div className="search-wrapper">
          <i className="fas fa-search"></i>
          <input 
            className="search-input" 
            type="text" 
            placeholder="Pretraži..." 
          />
          <button className="search-button" type="submit">Pretraži</button>
        </div>
      </form>

      <div className="filter-section">
        <div className="results-count">
          <span>Rezultati: </span>
          <strong>{filteredData.length}</strong>
        </div>

        {(title === "Vozila" || title === "Rezervacije") && (
          <div className="filter-buttons">
            {title === "Vozila" ? (
              <>
                <button
                  className="filter-button"
                  onClick={() => setFilteredData(filterVehiclesAvailability(data, "Dostupno"))}
                >
                  <i className="fas fa-check-circle"></i> Dostupna
                </button>
                <button
                  className="filter-button"
                  onClick={() => setFilteredData(filterVehiclesAvailability(data, "Zauzeto"))}
                >
                  <i className="fas fa-times-circle"></i> Zauzeta
                </button>
              </>
            ) : (
              <>
                <button
                  className="filter-button"
                  onClick={() => setFilteredData(filterReservationsAvailability(data, "Aktivna"))}
                >
                  <i className="fas fa-hourglass-half"></i> Aktivne
                </button>
                <button
                  className="filter-button"
                  onClick={() => setFilteredData(filterReservationsAvailability(data, "Otkazana"))}
                >
                  <i className="fas fa-ban"></i> Otkazane
                </button>
              </>
            )}
            <button
              className="filter-button active"
              onClick={() => setFilteredData(title === "Vozila" ? 
                filterVehiclesAvailability(data, "Sve") : 
                filterReservationsAvailability(data, "Sve"))}
            >
              <i className="fas fa-list"></i> Sve
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

  <div className="admin-content">
    {filteredData && filteredData.length > 0 ? (
      <div className="table-container">
        {filteredData.map((item) => (
          <div key={item.id} className="table-card">
            <div className="card-main">
              {item.picture && (
                <div className="card-image">
                  <img src={item.picture} alt="Item" />
                </div>
              )}
              
              <div className="card-details">
                <div className="detail-grid">
                  {Object.entries(item)
                    .filter(([key]) => basicFields.includes(key))
                    .map(([key, value], index) => (
                      <div key={index} className="detail-item">
                        <label>{getTranslation(key)}:</label>
                        <span>
                          {value} {key === "reservationAmount" && "RSD"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="action-button details"
                onClick={() => handleShowDetails(item)}
              >
                <i className="fas fa-info-circle"></i> Detalji
              </button>
              
              <div className="action-buttons">
                {title !== "Korisnici" && title !== "Rezervacije" && (
                  <button 
                    className="action-button edit"
                    onClick={() => onEdit(item)}
                  >
                    <i className="fas fa-edit"></i> Izmeni
                  </button>
                )}
                
                {title === "Rezervacije" &&
                  item.reservationStatus !== "Otkazana" &&
                  item.reservationStatus !== "Istekla" && (
                    <button 
                      className="action-button cancel"
                      onClick={() => onCancel(item.id)}
                    >
                      <i className="fas fa-times"></i> Otkaži
                    </button>
                  )}
                
                <button 
                  className="action-button delete"
                  onClick={() => onDelete(item.id)}
                >
                  <i className="fas fa-trash-alt"></i> Obriši
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="no-results">
        <i className="fas fa-database"></i>
        <p>Nema pronađenih podataka</p>
      </div>
    )}
  </div>
</>
    );
  }

  export default AdminSection;
