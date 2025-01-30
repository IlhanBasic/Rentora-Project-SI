import React from 'react';
import { Lock } from 'lucide-react';
import './Unauthorized.css';

export default function Unauthorized() {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <Lock size={64} />
        </div>
        <h1 className="unauthorized-title">Pristup Zabranjen</h1>
        <p className="unauthorized-message">
          Nažalost, nemate potrebna ovlašćenja za pristup ovoj stranici. 
          Molimo vas da se prijavite sa odgovarajućim kredencijalima ili 
          kontaktirajte administratora za više informacija.
        </p>
        <button 
          onClick={() => window.history.back()} 
          className="back-button"
        >
          Nazad na prethodnu stranicu
        </button>
      </div>
    </div>
  );
}