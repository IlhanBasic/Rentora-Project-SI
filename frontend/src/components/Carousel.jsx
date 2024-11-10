import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Import icons from react-icons
import CAROUSEL_DATA from "../data/CAROUSEL_DATA.js";

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGroup, setShowGroup] = useState([]);
  const carouselLength = CAROUSEL_DATA.length;

  useEffect(() => {
    updateShowGroup(currentIndex);
  }, [currentIndex]);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev=>{
        return (prev + 1) % carouselLength;
      })
    }, 4000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  const updateShowGroup = (index) => {
    const isSmallScreen = window.innerWidth <= 768;
    const itemsToShow = isSmallScreen ? 1 : 3;

    const start = index;
    const end = (index + itemsToShow) % carouselLength;

    if (end > start) {
      setShowGroup([...CAROUSEL_DATA.slice(start, end)]);
    } else {
      setShowGroup([
        ...CAROUSEL_DATA.slice(start, carouselLength),
        ...CAROUSEL_DATA.slice(0, end),
      ]);
    }
  };

  const handleSlide = (direction) => {
    let newIndex;
    if (direction === "left") {
      newIndex = (currentIndex - 1 + carouselLength) % carouselLength;
    } else if (direction === "right") {
      newIndex = (currentIndex + 1) % carouselLength;
    }

    setCurrentIndex(newIndex);
  };

  return (
    <div className="carousel-container">
      <button onClick={() => handleSlide("left")}>
        <FaChevronLeft />
      </button>
      {showGroup.map((card, index) => (
        <div
          className={`carousel-card ${index === 1 ? "center" : ""}`}
          key={card.id}
        >
          <img src={card.src} alt={card.name} />
          <h1>{card.name}</h1>
          <h3>-{card.role}-</h3>
          <q>{card.message}</q>
          <div className="star-rating">
            {[...Array(5)].map((_, starIndex) => (
              <span key={starIndex} className="star">
                ★
              </span>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => handleSlide("right")}>
        <FaChevronRight />
      </button>
    </div>
  );
}
