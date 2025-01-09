import React from 'react';
import { motion } from 'framer-motion';
const ConditionSection = ({ title, items }) => {
  const listVariant = {
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4, 
        bounce: 0.5
      },
    },
    hidden: { opacity: 0 },
  };
  const itemVariant = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hidden: { opacity: 0, y: 20, transition: { duration: 0.5 } },
  };

  return (
    <div>
      <h2 className="conditions-subtitle">{title}</h2>
      <motion.ul
        className="conditions-items"
        initial="hidden"
        animate="visible"
        variants={listVariant}
      >
        {items.map((item, index) => (
          <motion.li
            key={index}
            className="conditions-item"
            variants={itemVariant}
          >
            {item}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

export default ConditionSection;
