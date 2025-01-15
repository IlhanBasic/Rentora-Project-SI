import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header.jsx";
import MyRentalCard from "../components/MyRentalCard.jsx";
import Loader from "../components/Loader.jsx";
import API_URL from "../API_URL.js";
import "./MyRentals.css";
export default function MyRentals() {
  const { token, userId, isAdmin, email } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || (token && isAdmin)) {
      navigate("/auth?mode=Login");
      return;
    }
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/Reservations/user/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          if (error.status === 401) {
            setErrorMessage("Error:Prijavite se za pristup");
            return;
          }
          if (error.status === 403) {
            setErrorMessage("Error:Nedozvoljen pristup");
          }
          console.log(error);
          setErrorMessage(`Error: ${error.message}`);
          return;
        }

        const data = await response.json();
        setReservations([...data]);
      } catch (error) {
        setErrorMessage(
          "Error: Greška servera prilikom prikazivanja rezervacija. "
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [token, userId, navigate]);

  return (
    <>
      <div className="profile-control">
        <p>Profil:{email}</p>
        <button onClick={() => navigate("/change-password")}>
          Promeni lozinku
        </button>
      </div>
      <Header title="Moja Rentiranja" />
      <div className="rentals-container">
        {isLoading ? (
          <Loader />
        ) : reservations.length > 0 ? (
          reservations.map((reservation) => {
            const startDateTime = new Date(reservation.startDateTime);
            const endDateTime = new Date(reservation.endDateTime);
            const dayDifference = Math.ceil(
              (endDateTime - startDateTime) / (1000 * 60 * 60 * 24)
            );
            const insurancePrices = {
              basic: 400,
              full: 2000,
              premium: 1000,
              nema: 0
            };
            const childSeatPrices = {
              jedno: 500,
              dva: 1000,
              nema:0
            };
            const baseDeposit = 2000;
            const totalPrice =
              dayDifference > 0
                ? dayDifference * reservation.vehicle.pricePerDay + (insurancePrices[reservation.insurance] *dayDifference )+ childSeatPrices[reservation.childSeat]
                : 0;

            return (
              <MyRentalCard
                vehicleId={reservation.vehicleId}
                reservationId={reservation.id}
                key={reservation.id}
                brand={reservation.vehicle.brand}
                model={reservation.vehicle.model}
                fromDate={startDateTime.toLocaleString()}
                toDate={endDateTime.toLocaleString()}
                fromLocation={`${reservation.startLocation.street} ${reservation.startLocation.streetNumber}, ${reservation.startLocation.city}, ${reservation.startLocation.country}`}
                toLocation={`${reservation.endLocation.street} ${reservation.endLocation.streetNumber}, ${reservation.endLocation.city}, ${reservation.endLocation.country}`}
                src={reservation.vehicle.picture || ""}
                status={reservation.reservationStatus}
                totalPrice={`${totalPrice.toFixed(2)} RSD`}
              />
            );
          })
        ) : !errorMessage && !isLoading ? (
          <p>Još uvek niste napravili rezervaciju.</p>
        ) : (
          <p>Nema rezervacija.</p>
        )}
      </div>
    </>
  );
}
