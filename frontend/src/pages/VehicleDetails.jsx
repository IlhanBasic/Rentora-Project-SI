import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ReservationForm from "../components/ReservationForm.jsx";
import Loader from "../components/Loader.jsx";

export default function VehicleDetails() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  let startLocation,
    endLocation = "";
  let startDate = new Date();
  let endDate = new Date();
  let startTime = "12:00";
  let endTime = "12:00";

  if (searchParams.get("StartTime") && searchParams.get("ReturnTime")) {
    startTime = searchParams.get("StartTime");
    endTime = searchParams.get("ReturnTime");
  }
  if (searchParams.get("StartDate") && searchParams.get("ReturnDate")) {
    startDate = new Date(searchParams.get("StartDate"));
    endDate = new Date(searchParams.get("ReturnDate"));
  }
  if (searchParams.get("StartLocation") && searchParams.get("ReturnLocation")) {
    startLocation = searchParams.get("StartLocation");
    endLocation = searchParams.get("ReturnLocation");
  }

  const [car, setCar] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    pin: "",
  });
  
  const [pickupTime, setPickupTime] = useState(startTime);
  const [pickupDate, setPickupDate] = useState(startDate.toISOString().split("T")[0]);
  const [pickupLocation, setPickupLocation] = useState(startLocation);
  const [returnTime, setReturnTime] = useState(endTime);
  const [returnDate, setReturnDate] = useState(endDate.toISOString().split("T")[0]);
  const [returnLocation, setReturnLocation] = useState(endLocation);

  const [durationDays, setDurationDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [deposit, setDeposit] = useState(0); // New state for deposit

  useEffect(() => {
    async function fetchVehicle() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://localhost:7247/api/Vehicles/${vehicleId}`
        );
        if (!response.ok) {
          navigate("/vehicles");
        }
        const resData = await response.json();
        setCar(resData);
      } catch (e) {
        setErrorMessage("Greška od strane servera !");
      } finally {
        setIsLoading(false);
      }
    }
    fetchVehicle();
  }, [vehicleId, navigate]);

  useEffect(() => {
    if (pickupDate && returnDate && car.pricePerDay) {
      const startDateObj = new Date(pickupDate);
      const endDateObj = new Date(returnDate);
      const duration =
        endDateObj > startDateObj
          ? Math.floor((endDateObj - startDateObj) / (1000 * 60 * 60 * 24))
          : 0;
      if (duration > 0) {
        setDurationDays(duration);
        const price = duration * car.pricePerDay;
        setTotalPrice(price);
        setDeposit(price * 0.20); 
      } else {
        setDurationDays(0);
        setTotalPrice(0);
        setDeposit(0);
      }
    }
  }, [pickupDate, returnDate, car.pricePerDay]);

  useEffect(() => {
    const currentDate = new Date();
    const selectedPickupDate = new Date(pickupDate);
    const selectedReturnDate = new Date(returnDate);
    if (selectedPickupDate < currentDate) {
      setPickupDate(currentDate.toISOString().split("T")[0]);
    }
    if (selectedReturnDate <= selectedPickupDate) {
      const newReturnDate = new Date(selectedPickupDate);
      newReturnDate.setDate(newReturnDate.getDate() + 1);
      setReturnDate(newReturnDate.toISOString().split("T")[0]);
    }
  }, [pickupDate, returnDate]);

  if (isLoading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <>
      <div className="car-details">
        <img src={car.picture} alt={car.brand} className="car-details-image" />
        <div className="car-info">
          <h2>
            {car.brand} {car.model}
          </h2>
          <p>Cena po danu: {car.pricePerDay} RSD</p>
          <p>Tip goriva: {car.fuelType}</p>
          <p>Broj vrata: {car.numOfDoors}</p>
          <p>Godina proizvodnje: {car.yearOfManufacture}</p>
          <p>Menjač: {car.transmission}</p>
          <p>Tip vozila: {car.type}</p>
        </div>
      </div>
      <h1 className="important">MOLIMO POPUNITE FORMU</h1>
      <ReservationForm
        total={totalPrice} 
        startDate={startDate}
        endDate={endDate}
        vehicleId={vehicleId}
        pickupTime={pickupTime}
        pickupDate={pickupDate}
        pickupLocation={pickupLocation}
        setPickupTime={setPickupTime}
        setPickupDate={setPickupDate}
        setPickupLocation={setPickupLocation}
        returnTime={returnTime}
        returnDate={returnDate}
        returnLocation={returnLocation}
        setReturnTime={setReturnTime}
        setReturnDate={setReturnDate}
        setReturnLocation={setReturnLocation}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cardDetails={cardDetails}
        setCardDetails={setCardDetails}
        minPickupDate={startDate.toISOString().split("T")[0]}
        minReturnDate={pickupDate}
        maxReturnDate={new Date(new Date(pickupDate).getTime() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]}
      />
      {deposit > 0 && (
        <h1 className="important">DEPOZIT: {deposit.toFixed(2)} RSD</h1>
      )}
      {durationDays > 0 && (
        <h1 className="important">UKUPAN IZNOS: {totalPrice.toFixed(2)} RSD</h1>
      )}
    </>
  );
}
