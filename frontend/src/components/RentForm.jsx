import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RentForm({ locations }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [dataReservation, setDataReservation] = useState(null);
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(
    new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  );

  function isNullOrEmpty(data) {
    return data === null || data === undefined || data.trim() === "";
  }

  // Provera da li je vreme unutar radnog vremena
  function isValidWorkingHours(date, time) {
    const dayOfWeek = new Date(date).getDay(); // 0 - nedelja, 1 - ponedeljak, ...
    const [hours, minutes] = time.split(":").map(Number);

    if (dayOfWeek === 0) {
      // Nedeljom (9:00 - 17:00)
      return hours >= 9 && hours < 17;
    } else if (dayOfWeek === 6) {
      // Subotom (7:00 - 24:00)
      return hours >= 7 && hours < 24;
    } else {
      // Radnim danima (7:00 - 24:00)
      return hours >= 7 && hours < 24;
    }
  }

  useEffect(() => {
    const currentDate = new Date();
    const selectedStartDate = new Date(startDate);
    const selectedEndDate = new Date(endDate);

    if (selectedStartDate < currentDate) {
      setStartDate(currentDate.toISOString().split("T")[0]);
    }

    if (selectedEndDate <= selectedStartDate) {
      const newEndDate = new Date(selectedStartDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      setEndDate(newEndDate.toISOString().split("T")[0]);
    }
  }, [startDate, endDate]);

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (
      isNullOrEmpty(data.startLocation) ||
      isNullOrEmpty(data.startDate) ||
      isNullOrEmpty(data.startTime) ||
      isNullOrEmpty(data.returnLocation) ||
      isNullOrEmpty(data.returnDate) ||
      isNullOrEmpty(data.returnTime)
    ) {
      setErrorMessage("Polja ne smeju biti prazna!");
      return;
    }

    const startDateObj = new Date(data.startDate);
    const returnDateObj = new Date(data.returnDate);
    const currentDate = new Date();

    const maxStartDate = new Date(currentDate);
    maxStartDate.setDate(maxStartDate.getDate() + 7);

    if (startDateObj > maxStartDate) {
      setErrorMessage(
        "Datum preuzimanja ne može biti više od 7 dana u budućnosti!"
      );
      return;
    }

    const maxReturnDate = new Date(startDateObj);
    maxReturnDate.setDate(maxReturnDate.getDate() + 30);

    if (returnDateObj > maxReturnDate) {
      setErrorMessage(
        "Datum vraćanja ne može biti više od 30 dana nakon datuma preuzimanja!"
      );
      return;
    }

    if (startDateObj > returnDateObj) {
      setErrorMessage("Datum preuzimanja ne može biti posle datuma vraćanja!");
      return;
    }
    if (returnDateObj < currentDate) {
      setErrorMessage("Ne možete birati prošle datume!");
      return;
    }

    // Validacija radnog vremena
    if (
      !isValidWorkingHours(data.startDate, data.startTime) ||
      !isValidWorkingHours(data.returnDate, data.returnTime)
    ) {
      setErrorMessage("Vreme mora biti unutar radnog vremena kompanije!");
      return;
    }

    const dataForSend = {
      StartLocation: data.startLocation,
      StartDate: data.startDate,
      StartTime: data.startTime,
      ReturnLocation: data.returnLocation,
      ReturnDate: data.returnDate,
      ReturnTime: data.returnTime,
    };

    const queryParams = new URLSearchParams(dataForSend).toString();
    setIsSubmitted(true);
    navigate("/vehicles?" + queryParams);
  }

  return (
    <form className="rent-form" onSubmit={handleSubmit}>
      {errorMessage && (
        <div className="overlay">
          <p className="error-message">{errorMessage}</p>
        </div>
      )}
      <div className="reservation-row">
        <span>Preuzimanje:</span>
        <div className="form-row">
          <select name="startLocation">
            {locations.length > 0 ? (
              locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.street}, {location.streetNumber}, {location.city},{" "}
                  {location.country}
                </option>
              ))
            ) : (
              <option value="">No locations available</option>
            )}
          </select>
          <label htmlFor="startDate">Odaberite Datum Preuzimanja</label>
          <input
            type="date"
            name="startDate"
            min={
              new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            }
            onChange={(e) => setStartDate(e.target.value)}
            value={startDate}
          />
          <label htmlFor="startTime">Odaberite Vreme Preuzimanja</label>
          <input type="time" name="startTime" />
        </div>
      </div>
      <div className="reservation-row">
        <span>Vraćanje:</span>
        <div className="form-row">
          <select name="returnLocation">
            {locations.length > 0 ? (
              locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.street}, {location.streetNumber}, {location.city},{" "}
                  {location.country}
                </option>
              ))
            ) : (
              <option value="">No locations available</option>
            )}
          </select>
          <label htmlFor="returnDate">Odaberite Datum Vraćanja</label>
          <input
            type="date"
            name="returnDate"
            onChange={(e) => setEndDate(e.target.value)}
            value={endDate}
          />
          <label htmlFor="returnTime">Odaberite Vreme Vraćanja</label>
          <input type="time" name="returnTime" />
        </div>
      </div>

      <button type="submit" disabled={isSubmitted && !errorMessage}>
        Pronađite vozilo
      </button>
    </form>
  );
}
