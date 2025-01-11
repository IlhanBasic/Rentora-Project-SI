import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { getTranslation } from "../data/translation";
import './Modals.css';
export default function AdminModal({ open, close, data }) {
  const ref = useRef();
  
  useEffect(() => {
    if (open) {
      ref.current.showModal();
      document.getElementById("root").style.filter = "blur(5px)";
    } else {
      ref.current.close();
      document.getElementById("root").style.filter = "blur(0)";
    }
  }, [open]);

  return createPortal(
    <motion.dialog
      initial={{ y: -250, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -250, opacity: 0 }}
      transition={{ type: "spring" }}
      ref={ref}
      onClose={close}
      className="modal-admin"
    >
      <div key={data.id} className="table-row">
        <div className="table-info">
          {Object.entries(data).map(([key, value], index) => (
            <div key={index} className="vertical-table-row">
              <strong>{getTranslation(key)}:</strong>
              <span>
                {value} {key === "reservationAmount" && "RSD"}
              </span>
            </div>
          ))}
        </div>

        {data.picture && (
          <div className="table-image-container">
            <img src={data.picture} alt="Table Image" className="table-image" />
          </div>
        )}
      </div>

      <div className="btn-modal-group">
        <button onClick={close} type="button">
          Close
        </button>
      </div>
    </motion.dialog>,
    document.getElementById("modal")
  );
}
