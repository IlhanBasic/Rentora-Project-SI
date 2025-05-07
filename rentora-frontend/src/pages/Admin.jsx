import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Modal from "../components/Modal.jsx";
import AdminSection from "./AdminSection";
import API_URL from "../API_URL.js";
import "./Admin.css";

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteModalInfo, setDeleteModalInfo] = useState({
    isOpen: false,
    itemId: null,
    actionType: null,
  });

  function toggleSidebar() {
    setSidebarOpen(prev => !prev);
  }

  const { token, isAdmin, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check screen size on initial load and window resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 992) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    }
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      navigate("/auth?mode=Login");
    }
    else if (!isAdmin) {
      navigate("/unauthorized");
    }
  }, [token, isAdmin, isLoading, navigate]);


  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    modalTitle: "",
    modalText: "",
  });

  const closeModal = () => {
    setModalInfo((prev) => ({ ...prev, isOpen: false }));
    document.getElementById("root").style.filter = "blur(0)";
  };

  const closeDeleteModal = () => {
    setDeleteModalInfo({ isOpen: false, itemId: null, actionType: null });
  };

  // Handle clicks outside the sidebar to close it on mobile
  useEffect(() => {
    function handleClickOutside(event) {
      const sidebar = document.querySelector('.admin-nav-container');
      const hamburger = document.querySelector('.hamburger-admin');
      
      if (sidebarOpen && window.innerWidth < 992 && 
          sidebar && !sidebar.contains(event.target) &&
          hamburger && !hamburger.contains(event.target)) {
        setSidebarOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const [activeSection, setActiveSection] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchData("Vehicles/all", setVehicles);
    fetchData("Reservations", setReservations);
    fetchData("ApplicationUser", setUsers);
    fetchData("Locations", setLocations);
  }, []);

  const fetchData = async (endpoint, setter) => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.log(error);
      setModalInfo({
        modalTitle:
          "Došlo je do greške sa serverom prilikom preuzimanja podataka 🙁!",
        modalText: `Probajte ponovo kasnije.`,
        isOpen: true,
      });
    }
  };

  const handleEdit = (item) => {
    if (item) {
      navigate(`/Admin/${activeSection}/${item.id}`);
    } else {
      navigate(`/Admin/${activeSection}/new`);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModalInfo({
      isOpen: true,
      itemId: id,
      actionType: "delete",
    });
  };

  const handleCancel = (id) => {
    setDeleteModalInfo({
      isOpen: true,
      itemId: id,
      actionType: "cancel",
    });
  };

  const handleDeleteConfirm = async () => {
    const id = deleteModalInfo.itemId;
    const endpoint =
      activeSection === "users" ? "ApplicationUser" : activeSection;
    const url = `${API_URL}/${endpoint}/${id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setModalInfo({
          modalTitle: "Došlo je do greške prilikom brisanja 🙁!",
          modalText: `Pokušajte opet kasnije.`,
          isOpen: true,
        });
      } else {
        fetchData(
          endpoint === "vehicles" ? "Vehicles/all" : endpoint,
          getSetter(activeSection)
        );
        setModalInfo({
          modalTitle: "Uspešno obrisano ✅!",
          modalText: `Prikaz će biti uskoro osvežen.`,
          isOpen: true,
        });
      }
    } catch (error) {
      setModalInfo({
        modalTitle: "Došlo je do greške prilikom brisanja 🙁!",
        modalText: `Pokušajte opet kasnije.`,
        isOpen: true,
      });
    } finally {
      setDeleteModalInfo({ isOpen: false, itemId: null, actionType: null });
    }
  };

  const handleCancelConfirm = async () => {
    const id = deleteModalInfo.itemId;
    const endpoint = "Reservations";
    const url = `${API_URL}/${endpoint}/${id}`;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reservationStatus: "Otkazana" }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel reservation");
      }

      fetchData(endpoint, getSetter(activeSection));
      setModalInfo({
        modalTitle: "Uspešno otkazano ✅!",
        modalText: `Prikaz će biti uskoro osvežen.`,
        isOpen: true,
      });
    } catch (error) {
      setModalInfo({
        modalTitle: "Došlo je do greške prilikom otkazivanja rezervacije 🙁!",
        modalText: `Pokušajte opet kasnije.`,
        isOpen: true,
      });
    } finally {
      setDeleteModalInfo({ isOpen: false, itemId: null, actionType: null });
    }
  };

  const getSetter = (section) => {
    switch (section) {
      case "vehicles":
        return setVehicles;
      case "reservations":
        return setReservations;
      case "users":
        return setUsers;
      case "locations":
        return setLocations;
      default:
        return () => {};
    }
  };

  const RenderSection = () => {
    switch (activeSection) {
      case "vehicles":
        return (
          <AdminSection
            title="Vozila"
            data={vehicles}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        );
      case "reservations":
        return (
          <AdminSection
            title="Rezervacije"
            data={reservations}
            onCancel={handleCancel}
            onDelete={handleDeleteClick}
          />
        );
      case "users":
        return (
          <AdminSection
            title="Korisnici"
            data={users}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        );
      case "locations":
        return (
          <AdminSection
            title="Lokacije"
            data={locations}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        );
      default:
        return (
          <AdminSection
            title="Vozila"
            data={vehicles}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        );
    }
  };

  return (
    <>
      <Modal
        open={modalInfo.isOpen === true}
        close={closeModal}
        title={modalInfo.modalTitle}
        text={modalInfo.modalText}
      />
      <Modal
        open={deleteModalInfo.isOpen}
        close={closeDeleteModal}
        title={
          deleteModalInfo.actionType === "cancel"
            ? "Potvrda otkazivanja"
            : "Potvrda brisanja"
        }
        text={
          deleteModalInfo.actionType === "cancel"
            ? "Da li ste sigurni da želite da otkažete rezervaciju?"
            : "Da li ste sigurni da želite da izvršite brisanje?"
        }
        type="confirm"
        onConfirm={
          deleteModalInfo.actionType === "cancel"
            ? handleCancelConfirm
            : handleDeleteConfirm
        }
      />

      <div className="admin-page-container">
        <button
          className={`hamburger-admin ${sidebarOpen ? "active" : ""}`}
          aria-label="Toggle menu"
          onClick={toggleSidebar}
        ></button>
        
        <nav className={`admin-nav-container ${sidebarOpen ? "active" : ""}`}>
          <div className="fixed-navbar">
            <div className="admin-nav-title">
              <h1>Admin Panel</h1>
              <button
                className="back-home"
                onClick={() => {
                  navigate("/");
                }}
              >
                Početna
              </button>
            </div>
            <ul className="admin-nav-list">
              {[
                { key: "vehicles", label: "Vozila" },
                { key: "reservations", label: "Rezervacije" },
                { key: "users", label: "Korisnici" },
                { key: "locations", label: "Lokacije" },
              ].map(({ key, label }) => (
                <li
                  key={key}
                  id={key}
                  className={`admin-nav-item ${
                    activeSection === key ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveSection(key);
                    if (window.innerWidth < 992) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  {label}
                </li>
              ))}
              <button
              className="change-password"
              onClick={() => navigate("../change-password")}
            >
              Promena lozinke
            </button>
            </ul>
            
          </div>
        </nav>
        
        {/* Overlay for mobile */}
        <div className={`admin-overlay ${sidebarOpen ? "active" : ""}`} onClick={toggleSidebar}></div>
        
        <div className="admin-content-container">
          {RenderSection()}
        </div>
      </div>
    </>
  );
}