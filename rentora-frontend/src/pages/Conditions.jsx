import React from 'react';
import Header from '../components/Header';
import ConditionSection from '../components/ConditionSection.jsx';
import CONDITIONS_DATA from '../data/CONDITIONS_DATA.js';
import './Conditions.css';
export default function Conditions() {
  return (
    <>
      <Header title="Uslovi Rentiranja Vozila" />
      <div className="conditions-container">
        <div className="conditions-list">
          {CONDITIONS_DATA.map((section, index) => (
            <ConditionSection key={index} title={section.title} items={section.items} />
          ))}
        </div>
      </div>
    </>
  );
}
