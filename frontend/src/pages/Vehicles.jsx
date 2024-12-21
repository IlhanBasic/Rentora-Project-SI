import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import VehicleCard from "../components/VehicleCard";
import Filter from "../components/Filter";
import Loader from "../components/Loader.jsx";
import API_URL from "../API_URL.js";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterBrands, setFilterBrands] = useState([]);
  const [filterCarType, setFilterCarType] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false); // Sprečavanje paralelnih zahteva

  const fetchVehicles = useCallback(async () => {
    if (isFetching || !hasMore) return;
  
    setIsFetching(true);
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/Vehicles?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error("Došlo je do greške prilikom preuzimanja vozila.");
      }
  
      const resData = await response.json();
      const vehiclesData = resData.vehicles; 
  
      if (!Array.isArray(vehiclesData)) {
        throw new Error("Invalid data format");
      }
  
      if (vehiclesData.length === 0) {
        setHasMore(false);
        return;
      }
      const availableVehicles = vehiclesData.filter((vehicle) => vehicle.status === "Dostupno");
      console.log(availableVehicles);
      setVehicles((prevVehicles) => [
        ...prevVehicles,
        ...availableVehicles.filter((v) => !prevVehicles.some((pv) => pv.id === v.id)),
      ]);
  
      const brands = [...new Set(availableVehicles.map((item) => item.brand))];
      const carType = [...new Set(availableVehicles.map((item) => item.type))];
  
      setFilterBrands((prev) => [...new Set([...prev, ...brands])]);
      setFilterCarType((prev) => [...new Set([...prev, ...carType])]);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [page, vehicles, hasMore, isFetching]);
  

  useEffect(() => {
    fetchVehicles();
  }, [page]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100 &&
      !isFetching &&
      hasMore
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [isFetching, hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <Header title="Odaberite vozilo" />
      <Filter filterBrands={filterBrands} filterCarType={filterCarType} />
      <div className="vehicles">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
      {isLoading && <Loader />}
      {error && <p className="error-message">{error}</p>}
      {!hasMore && <p className="center">Nema više vozila za prikaz!</p>}
    </>
  );
}
