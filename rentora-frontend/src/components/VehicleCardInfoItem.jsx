import React from "react";

const VehicleCardInfoItem = ({ icon, altText, value }) => {
  return (
    <div className="info-item">
      <img src={icon} alt={altText} className="info-icon" />
      <span>{value}</span>
    </div>
  );
};

export default VehicleCardInfoItem;
