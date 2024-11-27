// Filter.jsx
import React, { useState } from "react";
import FilterGroup from "./FilterGroup";

const transmissions = ["Automatik", "Manuelni"];
const prices = [
  { label: "3500-4500 RSD", value: [3500, 4500] },
  { label: "4500-5500 RSD", value: [4500, 5500] },
  { label: "13500-14500 RSD", value: [13500, 14500] },
];
const fuels = ["Dizel", "Hibrid", "Električno", "Benzin"];
const doors = [3, 5];

export default function Filter({ onFilterChange, filterCarType, filterBrands }) {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [selectedDoors, setSelectedDoors] = useState("");

  const handleFilterChange = () => {
    onFilterChange({
      brand: selectedBrand,
      type: selectedType,
      transmission: selectedTransmission,
      price: selectedPrice,
      fuel: selectedFuel,
      doors: selectedDoors,
    });
  };

  const filterOptions = [
    { label: "Brend", options: filterBrands, value: selectedBrand, onChange: setSelectedBrand },
    { label: "Tip", options: filterCarType, value: selectedType, onChange: setSelectedType },
    { label: "Menjač", options: transmissions, value: selectedTransmission, onChange: setSelectedTransmission },
    { label: "Cena po danu", options: prices, value: selectedPrice, onChange: setSelectedPrice },
    { label: "Gorivo", options: fuels, value: selectedFuel, onChange: setSelectedFuel },
    { label: "Broj vrata", options: doors, value: selectedDoors, onChange: setSelectedDoors },
  ];

  return (
    <div className="filter">
      <h2>Filtrirajte vozila prema:</h2>

      {filterOptions.map(({ label, options, value, onChange }) => (
        <FilterGroup
          key={label}
          label={label}
          options={options}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ))}

      <button onClick={handleFilterChange} className="apply-button">
        Primeni filtere
      </button>
    </div>
  );
}
