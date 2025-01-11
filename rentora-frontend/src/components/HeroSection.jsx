import { useState, useEffect, useRef } from "react";
import bannerImg from "../assets/banner2.jpg";
import { ReactTyped } from "react-typed";
import "./HeroSection.css";
export default function HeroSection({ children }) {
  return (
    <section
      className="hero-banner"
      style={{
        backgroundImage: `url(${bannerImg})`,
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
