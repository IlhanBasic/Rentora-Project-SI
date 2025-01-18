// import Header from "../components/Header";
// import VehicleCard from "../components/VehicleCard";
// import Filter from "../components/Filter";
// import { useEffect, useState } from "react";
// import Loader from '../components/Loader.jsx';
// import API_URL from "../API_URL.js";
// import "./Vehicles.css";
// import { useLocation } from "react-router-dom";
// export default function Vehicles() {
//   const [vehicles, setVehicles] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [filteredVehicles, setFilteredVehicles] = useState([]);
//   const [error, setError] = useState(null);
//   const [filterBrands, setFilterBrands] = useState([]);
//   const [filterCarType, setFilterCarType] = useState([]);
//   const location = useLocation();
//   const currentSearchParams = new URLSearchParams(location.search);
//   let availableVehicleLocation = "";
//   if(currentSearchParams && currentSearchParams.get("StartLocation")){
//     availableVehicleLocation = currentSearchParams.get("StartLocation").trim();
//   }
//   useEffect(() => {
//     async function getCars() {
//       try {
//         setIsLoading(true);
//         const response = await fetch(`${API_URL}/Vehicles/all`);
//         if (!response.ok) {
//           setError("Error: Došlo je do greške prilikom preuzimanja vozila");
//           return;
//         }
//         const resData = await response.json();
//         const brands = [...new Set(resData.map((item) => item.brand))];
//         const carType = [...new Set(resData.map((item) => item.type))];
//         setFilterBrands([...brands]);
//         setFilterCarType([...carType]);
//         setVehicles(resData);
//         setFilteredVehicles(
//           resData.filter((vehicle) => vehicle.status === "Dostupno")
//         );
//       } catch (e) {
//         setError("Error: Došlo je do greške od strane servera.");
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     getCars();
//   }, []);

//   const applyFilters = (filters) => {
//     const newFilteredVehicles = vehicles.filter((vehicle) => {
//       const selectedPrice = filters.price ? filters.price.split(',').map(Number) : null;
//       return (
//         vehicle.status === "Dostupno" && (availableVehicleLocation !== "" ? vehicle.location === availableVehicleLocation : true) &&
//         (filters.brand ? vehicle.brand === filters.brand : true) &&
//         (filters.type ? vehicle.type === filters.type : true) &&
//         (filters.transmission ? vehicle.transmission === filters.transmission : true) &&
//         (selectedPrice
//           ? vehicle.pricePerDay >= selectedPrice[0] && vehicle.pricePerDay <= selectedPrice[1]
//           : true) &&
//         (filters.fuel ? vehicle.fuelType === filters.fuel : true) &&
//         (filters.doors ? vehicle.numOfDoors === parseInt(filters.doors) : true)
//       );
//     });
//     setFilteredVehicles(newFilteredVehicles);
//   };
//   return (
//     <>
//       <Header title="Odaberite vozilo" />
//       <Filter
//         filterBrands={filterBrands}
//         filterCarType={filterCarType}
//         onFilterChange={applyFilters}
//       />
//       {isLoading && <Loader />}
//       {error && <p className="error-message">{error}</p>}
//       {!isLoading && !error && filteredVehicles.length === 0 && (
//         <p className="center">Nemamo vozilo po tim zahtevima!</p>
//       )}
//       {!isLoading && !error && filteredVehicles.length > 0 && (
//         <div className="vehicles">
//           {filteredVehicles.map((vehicle) => (
//             <VehicleCard key={vehicle.id} vehicle={vehicle} />
//           ))}
//         </div>
//       )}
//     </>
//   );
// }
import Header from "../components/Header";
import VehicleCard from "../components/VehicleCard";
import Filter from "../components/Filter";
import FilterByLocation from "../components/FilterByLocation";
import { useEffect, useState } from "react";
import Loader from "../components/Loader.jsx";
import API_URL from "../API_URL.js";
import "./Vehicles.css";
import { useLocation } from "react-router-dom";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [filterBrands, setFilterBrands] = useState([]);
  const [filterCarType, setFilterCarType] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vehicleStartLocation, setVehicleStartLocation] = useState(null);
  const location = useLocation();
  const currentSearchParams = new URLSearchParams(location.search);
  const startLocation = currentSearchParams.get("StartLocation");
  const availableVehicleLocation = startLocation ? startLocation.trim() : "";
  useEffect(() => {
    async function getLocations() {
      try {
        const response = await fetch(`${API_URL}/Locations`);
        if (!response.ok) {
          setError("Error: Došlo je do greške prilikom preuzimanja lokacija");
          return;
        }
        const resData = await response.json();
        setLocations(resData);
        setVehicleStartLocation(resData[0].id);
      } catch (e) {
        setError("Error: Došlo je do greške od strane servera.");
      }
    }
    getLocations();
  }, []);
  useEffect(() => {
    async function getCars() {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/Vehicles/all`);
        if (!response.ok) {
          setError("Error: Došlo je do greške prilikom preuzimanja vozila");
          return;
        }
        const resData = await response.json();
        const brands = [...new Set(resData.map((item) => item.brand))];
        const carType = [...new Set(resData.map((item) => item.type))];
        setFilterBrands([...brands]);
        setFilterCarType([...carType]);
        setVehicles(resData);
        const initialFiltered = resData.filter((vehicle) => {
          const isAvailable = vehicle.status === "Dostupno";
          let matchesLocation =
            !availableVehicleLocation ||
            vehicle.locationId === availableVehicleLocation;
          if (availableVehicleLocation === "") {
            matchesLocation = vehicle.locationId === vehicleStartLocation;
          }
          return isAvailable && matchesLocation;
        });

        setFilteredVehicles(initialFiltered);
      } catch (e) {
        setError("Error: Došlo je do greške od strane servera.");
      } finally {
        setIsLoading(false);
      }
    }
    getCars();
  }, [availableVehicleLocation, vehicleStartLocation]);

  const applyFilters = (filters) => {
    const newFilteredVehicles = vehicles.filter((vehicle) => {
      const selectedPrice = filters.price
        ? filters.price.split(",").map(Number)
        : null;
        let locationMatch =
        !availableVehicleLocation ||
        vehicle.locationId === availableVehicleLocation;
      if (availableVehicleLocation === "") {
        locationMatch = vehicle.locationId === vehicleStartLocation;
      }
      return (
        vehicle.status === "Dostupno" &&
        locationMatch &&
        (filters.brand ? vehicle.brand === filters.brand : true) &&
        (filters.type ? vehicle.type === filters.type : true) &&
        (filters.transmission
          ? vehicle.transmission === filters.transmission
          : true) &&
        (selectedPrice
          ? vehicle.pricePerDay >= selectedPrice[0] &&
            vehicle.pricePerDay <= selectedPrice[1]
          : true) &&
        (filters.fuel ? vehicle.fuelType === filters.fuel : true) &&
        (filters.doors ? vehicle.numOfDoors === parseInt(filters.doors) : true)
      );
    });
    setFilteredVehicles(newFilteredVehicles);
  };

  return (
    <>
      <Header title="Odaberite vozilo" />
      {!startLocation && (
        <FilterByLocation
          locations={locations}
          setVehicleStartLocation={setVehicleStartLocation}
        />
      )}
      <Filter
        filterBrands={filterBrands}
        filterCarType={filterCarType}
        onFilterChange={applyFilters}
      />
      {isLoading && <Loader />}
      {error && <p className="error-message">{error}</p>}
      {!isLoading && !error && filteredVehicles.length === 0 && (
        <p className="center">Nemamo vozilo po tim zahtevima!</p>
      )}
      {!isLoading && !error && filteredVehicles.length > 0 && (
        <div className="vehicles">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </>
  );
}
