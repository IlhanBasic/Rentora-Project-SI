import { useRouteError } from "react-router-dom";
import "./Error.css";
export default function ErrorPage() {
  const error = useRouteError();
  let title = "Oops! Došlo je do greške.";
  let text = "Nismo uspeli da obradimo vaš zahtev. Probajte ponovo kasnije.";

  if (error.status === 404) {
    title = "Stranica nije pronađena";
    text = "Molimo odaberite postojeće stranice.";
  } else if (error.status === 400) {
    title = "Loš zahtev";
    text = "Proverite svoj unos i pokušajte ponovo.";
  } else if (error.status === 401) {
    title = "Niste autorizovani";
    text = "Molimo prijavite se da biste pristupili ovoj stranici.";
  } else if (error.status === 403) {
    title = "Zabranjen pristup";
    text = "Nemate dozvolu da vidite ovaj sadržaj.";
  } else if (error.status === 500) {
    title = "Greška na serveru";
    text = "Došlo je do greške na serveru. Pokušajte ponovo kasnije.";
  } else if (error.status === 502) {
    title = "Greška u komunikaciji sa serverom";
    text = "Molimo pokušajte ponovo kasnije.";
  } else if (error.status === 503) {
    title = "Servis nije dostupan";
    text = "Servis trenutno nije dostupan. Molimo pokušajte ponovo kasnije.";
  } else if (error.status === 504) {
    title = "Vreme čekanja na server je isteklo";
    text = "Molimo pokušajte ponovo kasnije.";
  }

  console.log(error);
  return (
    <div className="error-page">
      <div className="error-content">
        <h1>{title} 😢</h1>
        <p>{text}</p>
        <a href="/" className="back-home">
          Nazad na Home
        </a>
      </div>
    </div>
  );
}
