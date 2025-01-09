import { useState, useEffect, useRef } from "react";
import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";
import { ReactTyped } from "react-typed";
import "./HeroSection.css";
export default function HeroSection({ children }) {
  const banners = [banner1, banner2, banner3];
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % banners.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const currentPhoto = banners[currentPhotoIndex];

  return (
    <section
      className="hero-banner"
      style={{
        backgroundImage: `url(${currentPhoto})`,
        backgroundSize: "cover",
      }}
    >
      <div className="overlay">
        <div className="banner-content">
          <h1>
            <ReactTyped strings={["Vožnja Počinje Ovde !"]} typeSpeed={100} />
          </h1>

          <br />
          <p>
            Pregledajte našu bogatu flotu automobila i odaberite najbolju opciju
            za svoje putovanje. Brza rezervacija i konkurentne cene!
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
