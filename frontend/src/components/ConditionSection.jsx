import React from 'react';

const ConditionSection = ({ title, items }) => {
  return (
    <div>
      <h2 className="conditions-subtitle">{title}</h2>
      <ul className="conditions-items">
        {items.map((item, index) => (
          <li key={index} className="conditions-item">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConditionSection;
