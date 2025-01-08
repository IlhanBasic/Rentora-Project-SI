import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "./Modals.css";
export default function Modal({ open, close, title, text, type, onConfirm }) {
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
      className="modal"
    >
      <h1>{title}</h1>
      <p>{text}</p>
      {type !== "confirm" && <button onClick={close}>Close</button>}
      {type === "confirm" && (
        <div className="btn-modal-group">
          <button
            onClick={() => {
              onConfirm(); // Direktno poziva handleCancel
            }}
            type="button"
          >
            Da
          </button>
          <button onClick={close} type="button">
            Ne
          </button>
        </div>
      )}
    </motion.dialog>,
    document.getElementById("modal")
  );
}
