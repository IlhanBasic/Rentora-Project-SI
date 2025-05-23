import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { AuthContext } from "../context/AuthContext.jsx";
import API_URL from "../API_URL.js";
import "./ReservationForm.css";
export default function ReservationForm({
  vehicleId,
  pickupTime,
  setPickupTime,
  pickupDate,
  setPickupDate,
  pickupLocation,
  carLocation,
  setPickupLocation,
  returnTime,
  insurance,
  setInsurance,
  childSeat,
  setChildSeat,
  setReturnTime,
  returnDate,
  setReturnDate,
  returnLocation,
  setReturnLocation,
  paymentMethod,
  setPaymentMethod,
  cardDetails,
  minPickupDate,
  minReturnDate,
  setCardDetails,
}) {
  const { token, userId, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [locations, setLocations] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    modalTitle: "Čestitamo na uspešnoj rezervaciji!",
    modalText: "Vaše vozilo vas čeka na naznačenoj adresi",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [defaultLocation, setDefaultLocation] = useState("");
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setCardDetails({
      cardNumber: "",
      expiryDate: "",
      pin: "",
      cvv: "",
    });
  };

  const handleCardDetailsChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const closeModal = () => {
    setModalInfo((prev) => ({ ...prev, isOpen: false }));
    document.getElementById("root").style.filter = "blur(0)";
  };

  const isNullOrEmpty = (data) => {
    return data === null || data === undefined || data.trim() === "";
  };
  useEffect(() => {
    async function getLocations() {
      try {
        const response = await fetch(`${API_URL}/Locations`);
        if (!response.ok) {
          const error = await response.json();
          setErrorMessage(
            "Error: Greska od strane servera prilikom preuzimanja lokacija !"
          );
          return;
        }
        const resData = await response.json();
        if (resData.length > 0) {
          setDefaultLocation(resData[0].id);
        }
        setLocations(resData);
      } catch (e) {
        setErrorMessage("Error:Greška od strane servera !");
      }
    }
    getLocations();
  }, []);
  const patternCreditCard =
    /^(?:4[0-9]{3} ?[0-9]{4} ?[0-9]{4} ?[0-9]{4}|5[1-5][0-9]{2} ?[0-9]{4} ?[0-9]{4} ?[0-9]{4}|6(?:011|5[0-9]{2}) ?[0-9]{4} ?[0-9]{4} ?[0-9]{4}|3[47][0-9]{3} ?[0-9]{6} ?[0-9]{5}|3(?:0[0-5]|[68][0-9])[0-9]{3} ?[0-9]{4} ?[0-9]{4}|2(?:014|149)[0-9]{3} ?[0-9]{4} ?[0-9]{4})$/;
  const patternCVV = /^\d{3,4}$/;
  const patternCardPin = /^\d{4}$/;
  const patternDateExpire = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (token && role == "Admin") {
      setModalInfo({
        modalTitle: "Morate biti korisnik da biste rezervisali vozilo za sebe!",
        modalText: "Samo ulogovan korisnik može da pravi rezervacije",
        isOpen: true,
      });
      return;
    }

    if (!token) {
      setModalInfo({
        modalTitle: "Rezervacija je obavezna 😔!",
        modalText: "Morate se prvo ulogovati da bi rezervisali vozilo!",
        isOpen: true,
      });
      setTimeout(() => {
        closeModal();
        window.scrollTo(0, 0);
        navigate("/auth?mode=Login");
      }, 2500);
      return;
    }

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const requiredFields = [
      "startDate",
      "returnDate",
      "startTime",
      "returnTime",
      "startLocation",
      "returnLocation",
    ];
    const isAnyFieldEmpty = requiredFields.some((field) =>
      isNullOrEmpty(data[field])
    );

    if (isAnyFieldEmpty) {
      setModalInfo({
        modalTitle: "Greška u unosu 😔!",
        modalText: "Sva obavezna polja moraju biti popunjena.",
        isOpen: true,
      });
      return;
    }
    const currentDate = new Date();
    const selectedPickupDate = new Date(data["startDate"]);
    const selectedReturnDate = new Date(data["returnDate"]);

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(currentDate.getDate() + 7);

    const thirtyDaysLater = new Date(selectedPickupDate);
    thirtyDaysLater.setDate(selectedPickupDate.getDate() + 30);

    if (selectedPickupDate > sevenDaysLater) {
      setPickupDate(currentDate.toISOString().split("T")[0]);
      setModalInfo({
        modalTitle: "Greška u unosu 😔!",
        modalText: "Datum preuzimanja ne može biti više od 7 dana unapred.",
        isOpen: true,
      });
      return;
    }
    if (selectedReturnDate > thirtyDaysLater) {
      setReturnDate(selectedPickupDate.toISOString().split("T")[0]);
      setModalInfo({
        modalTitle: "Greška u unosu 😔!",
        modalText: "Rezervacija vozila ne sme trajati duže od 30 dana.",
        isOpen: true,
      });
      return;
    }
    if (paymentMethod === "card") {
      const cardFields = ["cardNumber", "expiryDate", "pin", "cvv"];
      const isAnyCardFieldEmpty = cardFields.some((field) =>
        isNullOrEmpty(cardDetails[field])
      );

      if (isAnyCardFieldEmpty) {
        setModalInfo({
          modalTitle: "Greška u unosu 😔!",
          modalText: "Sva polja za karticu moraju biti popunjena.",
          isOpen: true,
        });
        return;
      }
      if (!patternCreditCard.test(cardDetails["cardNumber"])) {
        // setErrorMessage("Broj kartice nije u odgovarajućem formatu!");
        setModalInfo({
          modalTitle: "Broj kartice nije u odgovarajućem formatu!",
          modalText: "Kartica mora biti Mastercard ili Visa.",
          isOpen: true,
        });
        return;
      }
      if (!patternDateExpire.test(cardDetails.expiryDate)) {
        setErrorMessage("Datum isteka kartice nije u odgovarajućem formatu!");
        setModalInfo({
          modalTitle: "Datum isteka kartice nije u odgovarajućem formatu!",
          modalText: "Format: MM/YY",
          isOpen: true,
        });
        return;
      }

      const currentYear = new Date().getFullYear().toString().slice(2, 4);
      const currentMonth = new Date().getMonth() + 1;
      const cardExpireYear = parseInt(cardDetails["expiryDate"].split("/")[1]);
      const cardExpireMonth = parseInt(cardDetails["expiryDate"].split("/")[0]);
      if (
        currentYear > cardExpireYear ||
        (currentYear == cardExpireYear && currentMonth > cardExpireMonth)
      ) {
        // setErrorMessage("Vaša kartica je istekla!");
        setModalInfo({
          modalTitle: "Vaša kartica je istekla!",
          modalText: "Morate odabrati karticu koja nije istekla.",
          isOpen: true,
        });
        return;
      }
      if (!patternCVV.test(cardDetails.cvv)) {
        // setErrorMessage("CVV nije u odgovarajućem formatu!");
        setModalInfo({
          modalTitle: "CVV nije u odgovarajućem formatu!",
          modalText: "Primer formata: 1234",
          isOpen: true,
        });
        return;
      }
      if (!patternCardPin.test(cardDetails.pin)) {
        // setErrorMessage("PIN mora sadržati tačno 4 cifre!");
        setModalInfo({
          modalTitle: "PIN mora sadržati tačno 4 cifre!",
          modalText: "Primer pina: 1234",
          isOpen: true,
        });
        return;
      }
    }
    try {
      const startDateTime = new Date(
        `${data["startDate"]}T${data["startTime"]}`
      );
      const endDateTime = new Date(
        `${data["returnDate"]}T${data["returnTime"]}`
      );
      const reservationData = {
        vehicleId: vehicleId,
        startLocationId: data["startLocation"],
        endLocationId: data["returnLocation"],
        userId: userId ?? null,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        creditCardNumber: data["cardNumber"] ?? null,
        reservationStatus: "aktivan",
        insurance:data['insurance'] ?? 'nema',
        childSeat:data['childSeat'] ?? 'nema',
      };
      const responseReservation = await fetch(`${API_URL}/Reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reservationData),
      });

      if (!responseReservation.ok) {
        if (responseReservation.status === 401) {
          // setErrorMessage(
          //   "Greška prilikom rezervacije vozila. Niste ulogovani."
          // );
          setModalInfo({
            modalTitle: "Greška prilikom rezervacije vozila. Niste ulogovani.",
            modalText: "Morate se prvo ulogovati kao korisnik da bi rezervisali vozilo!",
            isOpen: true,
          });
          return;
        }
        if (responseReservation.status === 403) {
          // setErrorMessage(
          //   "Error: Greška prilikom rezervacije vozila. Nema pristup."
          // );
          setModalInfo({
            modalTitle: "Greška prilikom rezervacije vozila. Nema pristup.",
            modalText: "Nema pristup usluzi rezervacije.",
            isOpen: true,
          });
          return;
        }
        setErrorMessage(
          "Error: Greška prilikom rezervacije vozila. Rezervacija nije napravljena."
        );
        setModalInfo({
          modalTitle: "Greška prilikom rezervacije vozila. Nema pristup.",
          modalText: "Nema pristup usluzi rezervacije.",
          isOpen: true,
        });
        return;
      }
      setIsClicked(true);
      setModalInfo({
        modalTitle: "Čestitamo na uspešnoj rezervaciji 🎉!",
        modalText: "Vaše vozilo će Vas čekati na naznačenoj adresi.",
        isOpen: true,
      });

      setTimeout(() => {
        closeModal();
        window.scrollTo(0, 0);
        navigate("/");
      }, 2500);
    } catch (error) {
      setErrorMessage("Error: Greška servera prilikom rezervacije. ");
      return;
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

      <form className="reservation-form" onSubmit={handleSubmit}>
        <h3>Rezervišite vozilo</h3>
        <div>
          <label>Datum preuzimanja:</label>
          <input
            type="date"
            name="startDate"
            value={pickupDate}
            min={minPickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />
          <label>Vreme preuzimanja:</label>
          <input
            type="time"
            name="startTime"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            required
          />
          <label>Mesto preuzimanja:</label>
          <select
            name="startLocation"
            value={carLocation}
          >
            {locations.length > 0 ? (
              locations.map((location) => {
                if (location.id === carLocation) {
                  return (
                    <option key={location.id} value={location.id} selected>
                    {location.street}, {location.streetNumber}, {location.city},{" "}
                    {location.country}
                  </option>
                  )
                }
              })
            ) : (
              <option value="">Lokacije nisu dostupne</option>
            )}
          </select>
        </div>

        <div>
          <label>Datum vraćanja:</label>
          <input
            type="date"
            name="returnDate"
            value={returnDate}
            min={minReturnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
          />
          <label>Vreme vraćanja:</label>
          <input
            type="time"
            name="returnTime"
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            required
          />
          <label>Mesto vraćanja:</label>
          <select
            name="returnLocation"
            value={returnLocation ?? defaultLocation}
            onChange={(e) => setReturnLocation(e.target.value)}
          >
            {locations.length > 0 ? (
              locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.street}, {location.streetNumber}, {location.city},{" "}
                  {location.country}
                </option>
              ))
            ) : (
              <option value="">Lokacije nisu dostupne</option>
            )}
          </select>
        </div>
        <div className="extra-options">
          <label>Sedište za decu (opciono):</label>
          <select
            name="childSeat"
            value={childSeat ?? ""}
            onChange={(e) => setChildSeat(e.target.value)}
          >
            <option selected value="nema">
              Nema sedišta
            </option>
            <option value="jedno">1 Sedište + 500 RSD</option>
            <option value="dva">2 Sedišta + 1000 RSD</option>
          </select>
        </div>
        <div className="extra-options">
          <label>Osiguranje (opciono):</label>
          <select
            name="insurance"
            value={insurance ?? ""}
            onChange={(e) => setInsurance(e.target.value)}
          >
            <option selected value="nema">
              Nema
            </option>
            <option value="basic">Osiguranje (Osnovno) 400 RSD po danu </option>
            <option value="premium">Osiguranje (Premium) 1000 RSD po danu</option>
            <option value="full">Kompletno osiguranje 2000 RSD po danu</option>
          </select>
        </div>
        <div>
          <label>Metoda plaćanja:</label>
          <select name="paymentMethod" onChange={handlePaymentMethodChange}>
            <option value="cash">Gotovina</option>
            <option value="card">Kartica</option>
          </select>
        </div>
        {paymentMethod === "card" && (
          <div>
            <h4>Detalji kartice</h4>
            <div>
              <label>Broj kartice:</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="Unesite broj kartice"
                value={cardDetails.cardNumber}
                onChange={handleCardDetailsChange}
                required
              />
            </div>
            <div>
              <label>Datum isteka:</label>
              <input
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                value={cardDetails.expiryDate}
                onChange={handleCardDetailsChange}
                required
              />
            </div>
            <div>
              <label>PIN:</label>
              <input
                type="password"
                name="pin"
                maxLength={4}
                placeholder="Unesite PIN"
                value={cardDetails.pin}
                onChange={handleCardDetailsChange}
                required
              />
            </div>
            <div>
              <label>CVV:</label>
              <input
                type="text"
                name="cvv"
                maxLength={4}
                placeholder="Unesite CVV"
                value={cardDetails.cvv}
                onChange={handleCardDetailsChange}
                required
              />
            </div>
          </div>
        )}

        {!isClicked && <button id="btn-submit" type="submit">Potvrdi rezervaciju</button>}
        {/* {errorMessage && <p className="error-message">{errorMessage}</p>} */}
      </form>
    </>
  );
}
