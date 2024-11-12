import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import Mapa from "../components/Mapa";
import RentForm from "../components/RentForm";
import RowOfCards from "../components/RowofCards";
import { useState, useEffect } from "react";
import Loader from '../components/Loader.jsx';
import { motion, useScroll } from "framer-motion";
export default function HomePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function getLocations() {
      try {
        const response = await fetch('https://localhost:7247/api/Locations');
        if (!response.ok) throw new Error("Network response was not ok");
        const resData = await response.json();
        setData(resData);
        setLoading(false);
      } catch (e) {
        setError("Error: Neuspešno preuzimanje lokacija.");
        setLoading(false);
      }
    }
    getLocations();
  }, []);

  return (
    <>
    
      <HeroSection>
        {loading ? (
          <Loader/>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <RentForm locations={data} />
        )}
      </HeroSection>
      <Header title="Zašto nas izabrati?" />
      <RowOfCards />
      <Header title="Kako do nas?" />
      <Mapa locations={data} />
    </>
  );
}
