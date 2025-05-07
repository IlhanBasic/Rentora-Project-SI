import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import Mapa from "../components/Mapa";
import RentForm from "../components/RentForm";
import RowOfCards from "../components/RowOfCards";
import { useState, useEffect, useContext } from "react";
import Loader from "../components/Loader.jsx";
import { ToastContainer, toast } from "react-toastify";
import API_URL from "../API_URL.js";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";
export default function HomePage() {
  const { token } = useContext(AuthContext);
  const toastShow = localStorage.getItem("toastShow");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function getLocations() {
      try {
        const response = await fetch(`${API_URL}/Locations`);
        if (!response.ok) setError("Error: Slaba povezanost sa serverom.");
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
  useEffect(() => {
    if (token && toastShow === "false") {
      localStorage.setItem("toastShow", true);
      toast.success("Uspešno ste se prijavili 🎉!", {
        position: "bottom-left",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, []);

  return (
    <>
      <HeroSection>
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <RentForm locations={data} />
        )}
      </HeroSection>
      
      <Header title="Zašto nas izabrati?" />
      <RowOfCards />
      <Header title="Kako rezervisati vozilo?" />
      <div className="how-to-rent-container">
        <p>
          Rezervacija vozila nikada nije bila lakša! Pratite sledeće korake kako
          biste osigurali svoje vozilo u našoj ponudi:
        </p>
        <ol className="reservation-steps">
          <li>
            <strong>Prijavite se:</strong> Prvo, prijavite se na naš sajt. Ako
            nemate nalog, lako možete kreirati novi.
          </li>
          <li>
            <strong>Odaberite lokaciju:</strong> Izaberite željenu lokaciju za
            preuzimanje vozila iz naše široke ponude.
          </li>
          <li>
            <strong>Izaberite vozilo:</strong> Pregledajte dostupna vozila i
            odaberite ono koje najbolje odgovara vašim potrebama.
          </li>
          <li>
            <strong>Odredite datum i vreme:</strong> Unesite datum i vreme kada
            želite da preuzmete i vratite vozilo.
          </li>
          <li>
            <strong>Potvrdite rezervaciju:</strong> Pregledajte sve unete
            informacije i potvrdite svoju rezervaciju.
          </li>
        </ol>
        <p>
          Nakon što završite sa rezervacijom, dobićete potvrdu putem e-pošte sa
          svim detaljima. Uživajte u vožnji!
        </p>
      </div>

      <Header title="Kako do nas?" />
      <Mapa locations={data} />
      <ToastContainer />
    </>
  );
}
