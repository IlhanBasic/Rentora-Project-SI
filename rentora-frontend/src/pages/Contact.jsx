import React, { useEffect, useState } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import "./Contact.css";
import Header from "../components/Header";
import API_URL from "../API_URL";
// const locations = [
//   {
//     id: "4ba15f74-9825-4121-b9f5-8d5fae8d13be",
//     street: "Trg Kralja Petra",
//     streetNumber: "12",
//     city: "Novi Pazar",
//     country: "Srbija",
//     latitude: 43.2028,
//     longitude: 20.5172,
//     email: "rentoraapp@gmail.com",
//     phoneNumber: "313-278",
//   },
//   {
//     id: "6cd9d44f-702f-4118-b20f-d865ed2c231d",
//     street: "Vojvode Mišića",
//     streetNumber: "55",
//     city: "Novi Pazar",
//     country: "Srbija",
//     latitude: 43.2056,
//     longitude: 20.521,
//     email: "rentoraapp@gmail.com",
//     phoneNumber: "723-555",
//   },
//   {
//     id: "7ed9c19b-4b32-495b-b71b-f73509ed722d",
//     street: "Branislava Nušića",
//     streetNumber: "98",
//     city: "Novi Pazar",
//     country: "Srbija",
//     latitude: 43.2034,
//     longitude: 20.5183,
//     email: "rentoraapp@gmail.com",
//     phoneNumber: "225-883",
//   },
//   {
//     id: "8d6a745d-62b5-4503-9b74-c1a72d0423a1",
//     street: "Novi Trg",
//     streetNumber: "34",
//     city: "Novi Pazar",
//     country: "Srbija",
//     latitude: 43.204,
//     longitude: 20.519,
//     email: "rentoraapp@gmail.com",
//     phoneNumber: "667-890",
//   },
//   {
//     id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//     street: "Ulica Stefana Nemanje",
//     streetNumber: "77",
//     city: "Novi Pazar",
//     country: "Srbija",
//     latitude: 43.2022,
//     longitude: 20.5205,
//     email: "rentoraapp@gmail.com",
//     phoneNumber: "228-456",
//   },
// ];

const Contact = () => {
    const [locations,setLocations] = useState([]);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(
          `${API_URL}/locations`
        );
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
          console.log(data);
        } else {
          console.error("Error fetching locations:", response.status);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }
    fetchLocations();
  }, []);
  return (
    <div className="contact-container">
      <Header title="Kontaktirajte Nas" />
      <div className="contact-header">
        <p>
          Pronađite najbližu poslovnicu i rezervišite svoje vozilo već danas
        </p>
      </div>

      <div className="locations-grid">
        <h2>Naše Poslovnice</h2>
        <div className="locations-container">
          {locations.map((location) => (
            <div key={location.id} className="location-card">
              <div className="location-header">
                <MapPin className="location-icon" />
                <h3>
                  {location.street} {location.streetNumber}
                </h3>
              </div>
              <div className="location-details">
                <p>
                  <strong>Grad:</strong> {location.city}
                </p>
                <p>
                  <strong>Telefon:</strong> +381 {location.phoneNumber}
                </p>
                <div className="location-actions">
                  <a
                    href={`mailto:${location.email}`}
                    className="action-link email-link"
                  >
                    <Mail className="small-icon" />
                    <span>Pošaljite email</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-link map-link"
                  >
                    <MapPin className="small-icon" />
                    <span>Prikaži na mapi</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
