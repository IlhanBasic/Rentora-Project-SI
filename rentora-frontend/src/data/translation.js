import { section } from "framer-motion/client";

export const translations = [
  {
    users: {
      username: "Korisničko ime",
      password: "Lozinka",
      firstName: "Ime",
      lastName: "Prezime",
      phoneNumber: "Broj telefona",
      roles: "Uloge",
    },
  },
  {
    locations: {
      street: "Ulica",
      streetNumber: "Broj ulice",
      city: "Grad",
      country: "Država",
      latitude: "Geografska širina",
      longitude: "Geografska dužina",
    },
  },
  {
    reservations: {
      firstName: "Ime",
      lastName: "Prezime",
      email: "E-mail",
      vehicleBrand: "Marka vozila",
      vehicleModel: "Model vozila",
      startLocation: "Početna lokacija",
      endLocation: "Krajnja lokacija",
      startDateTime: "Početni datum i vreme",
      endDateTime: "Krajnji datum i vreme",
      reservationStatus: "Status rezervacije",
      creditCardNumber: "Broj kreditne kartice",
      reservationAmount: "Iznos rezervacije",
      insurance : "Osiguranje",
      childSeat : "Dečije sedište",
    },
  },
  {
    vehicles: {
      brand: "Marka",
      model: "Model",
      yearOfManufacture: "Godina proizvodnje",
      registrationNumber: "Registarski broj",
      pricePerDay: "Cena po danu",
      status: "Status",
      picture: "Slika",
      fuelType: "Vrsta goriva",
      numOfDoors: "Broj vrata",
      transmission: "Tip menjača",
      type: "Tip vozila",
    },
  },
];
const sections = {
  users: "Korisnika",
  vehicles: "Vozilo",
  reservations: "Rezervaciju",
  locations: "Lokaciju",
};
export function getTranslationSection(section) {
  return sections[section];
}
export const getTranslation = (key) => {
  for (const category of translations) {
    for (const [categoryName, fields] of Object.entries(category)) {
      if (fields[key]) {
        return fields[key];
      }
    }
  }
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
};
