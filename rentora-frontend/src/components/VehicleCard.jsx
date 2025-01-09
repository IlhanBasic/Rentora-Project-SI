import React, { useState, useContext } from "react";
import fuelIcon from "/gas-station.png";
import doorIcon from "/car.png";
import yearIcon from "/calendar.png";
import transmissionIcon from "/manual-transmission.png";
import typeIcon from "/convertible.png";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import VehicleCardInfoItem from "./VehicleCardInfoItem";
import { AuthContext } from "../context/AuthContext.jsx";
import "./VehicleCard.css"; 
export default function VehicleCard({ vehicle }) {
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    modalTitle: "Niste ulogovani!",
    modalText: "Molimo prvo se ulogujte da biste napravili rezervaciju",
  });

  const closeModal = () => {
    setModalInfo((prev) => ({ ...prev, isOpen: false }));
    document.getElementById("root").style.filter = "blur(0)";
  };

  const navigate = useNavigate();
  const location = useLocation();
  const currentSearchParams = new URLSearchParams(location.search);

  const { token, isAdmin, isLoggedIn } = useContext(AuthContext);

  const handleReservation = () => {
    if (isLoggedIn && token) {
      if (isAdmin) {
        setModalInfo({
          modalTitle: "Morate biti korisnik da biste rezervisali vozilo za sebe!",
          modalText: "Samo ulogovan korisnik može da pravi rezervacije",
          isOpen: true,
        });
        return;
      }

      window.scrollTo(0, 0);
      navigate({
        pathname: `/vehicles/${vehicle.id}`,
        search: currentSearchParams.toString(),
      });
    } else {
      setModalInfo({
        modalTitle: "Prijava je obavezna 😔!",
        modalText: "Morate se prvo ulogovati da bi rezervisali vozilo!",
        isOpen: true,
      });
    }
  };

  return (
    <>
      <Modal
        open={modalInfo.isOpen}
        close={closeModal}
        title={modalInfo.modalTitle}
        text={modalInfo.modalText}
      />
      <div className="vehicle-card">
        <img
          src={vehicle.picture}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="vehicle-card-img"
        />
        <div className="vehicle-card-title">
          <span>
            {vehicle.brand} {vehicle.model}
          </span>
          <span> | </span>
          <span>{vehicle.pricePerDay} RSD/Dan</span>
        </div>
        <div className="vehicle-card-info">
          <VehicleCardInfoItem icon={fuelIcon} altText="gorivo" value={vehicle.fuelType} />
          <VehicleCardInfoItem icon={doorIcon} altText="vrata" value={vehicle.numOfDoors} />
          <VehicleCardInfoItem icon={yearIcon} altText="godište" value={vehicle.yearOfManufacture} />
          <VehicleCardInfoItem icon={transmissionIcon} altText="menjac" value={vehicle.transmission} />
          <VehicleCardInfoItem icon={typeIcon} altText="tip" value={vehicle.type} />
        </div>
        <button onClick={handleReservation}>REZERVISI</button>
      </div>
    </>
  );
}
