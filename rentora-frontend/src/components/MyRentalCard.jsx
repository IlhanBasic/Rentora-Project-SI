import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; 
import Modal from "./Modal.jsx";
import API_URL from "../API_URL.js";
export default function MyRentalCard({
  vehicleId,
  reservationId,
  brand,
  model,
  fromDate,
  toDate,
  fromLocation,
  toLocation,
  status,
  totalPrice,
  src,
}) {
  const { token } = useContext(AuthContext);
  const [reservationStatus, setReservationStatus] = useState(status);
  const [isCanceled, setIsCanceled] = useState(false);
  const [modalInfo, setModalInfo] = useState({ modalTitle: "", modalText: "", isOpen: false });
  const navigate = useNavigate();


  const canCancel = new Date(toDate) - Date.now() > 24 * 60 * 60 * 1000;

  const updateReservationStatus = async (status) => {
    try {
      const response = await fetch(`${API_URL}/Reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ reservationStatus: status }),
      });

      if (!response.ok) throw new Error("Failed to update reservation status");

      setReservationStatus(status);
    } catch (error) {
      console.error("Error updating reservation status:", error.message);
    }
  };

  // Helper function to update vehicle status via API
  const updateVehicleStatus = async (status) => {
    try {
      const response = await fetch(`${API_URL}/Vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update vehicle status");
    } catch (error) {
      console.error("Error updating vehicle status:", error.message);
    }
  };


  const closeModal = () => {
    setModalInfo({ modalTitle: "", modalText: "", isOpen: false });
    document.getElementById("root").style.filter = "blur(0)";
  };


  useEffect(() => {
    if (!token) {
      navigate("/auth?mode=Login");
      return;
    }

    const checkReservationStatus = async () => {
      if (new Date() > new Date(toDate) && reservationStatus === "Aktivna" && !isCanceled) {
        await updateReservationStatus("Istekla");
      }
    };

    checkReservationStatus();
  }, [reservationId, toDate, reservationStatus, isCanceled, token, navigate]);


  const handleCancelRequest = () => {
    setModalInfo({
      modalTitle: canCancel ? "Da li ste sigurni da želite da otkažete rezervaciju?" : "Rezervacija ne može biti otkazana!",
      modalText: canCancel ? "Vozilo će biti dodeljeno drugom vozaču." : "Besplatno otkazivanje dostupno je do 24 časa pre vraćanja vozila.",
      isOpen: true,
    });
  };

  const handleCancel = async () => {
    if (!canCancel) return;

    await updateReservationStatus("Otkazana");
    await updateVehicleStatus("Dostupno");

    setIsCanceled(true);
    closeModal();
  };

  return (
    <>
      <Modal
        type={canCancel ? "confirm" : ""}
        open={modalInfo.isOpen}
        close={closeModal}
        title={modalInfo.modalTitle}
        text={modalInfo.modalText}
        onConfirm={canCancel ? handleCancel : closeModal}
      />
      <div className={`rental-card ${reservationStatus === "Otkazana" ? "cancel" : ""}`}>
        <img src={src} alt={`${brand} ${model}`} className="rental-card-image" />
        <div className="rental-card-details">
          <h3><strong>{brand} {model}</strong></h3>
          <h3><strong>Od:</strong> {fromDate}</h3>
          <h3><strong>Do:</strong> {toDate}</h3>
          <h3><strong>Preuzet:</strong> {fromLocation}</h3>
          <h3><strong>Vraćen:</strong> {toLocation}</h3>
        </div>
        <div className="rental-card-summary">
          <h3><strong>Status:</strong> {isCanceled ? "Otkazana" : reservationStatus}</h3>
          {reservationStatus === "Aktivna" && !isCanceled && (
            <button onClick={handleCancelRequest} className="cancel-button">Otkaži rezervaciju</button>
          )}
          <h3><strong>Total price:</strong> {totalPrice}</h3>
        </div>
      </div>
    </>
  );
}
