import { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CAROUSEL_DATA from "../data/CAROUSEL_DATA.js";
import "./Carousel.css";

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGroup, setShowGroup] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselLength = CAROUSEL_DATA.length;

  const updateShowGroup = useCallback((index) => {
    const isSmallScreen = window.innerWidth <= 768;
    const itemsToShow = isSmallScreen ? 1 : 3;
    const groupItems = [];
    
    for (let i = 0; i < itemsToShow; i++) {
      const itemIndex = (index + i) % carouselLength;
      groupItems.push(CAROUSEL_DATA[itemIndex]);
    }
    
    setShowGroup(groupItems);
  }, [carouselLength]);

  useEffect(() => {
    updateShowGroup(currentIndex);
    
    const handleResize = () => {
      updateShowGroup(currentIndex);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, updateShowGroup]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        handleSlide('right');
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleSlide = (direction) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    let newIndex;
    
    if (direction === "left") {
      newIndex = (currentIndex - 1 + carouselLength) % carouselLength;
    } else {
      newIndex = (currentIndex + 1) % carouselLength;
    }

    setCurrentIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="carousel-wrapper">
      <div className="carousel-container">
        <button 
          className="nav-button prev"
          onClick={() => handleSlide("left")}
          aria-label="Previous slide"
        >
          <FaChevronLeft />
        </button>
        
        <div className="cards-container">
          {showGroup.map((card, index) => (
            <div
              className={`carousel-card ${index === 1 ? "center" : ""} ${
                isAnimating ? "animating" : ""
              }`}
              key={card.id}
            >
              <div className="card-content">
                <img src={card.src} alt={card.name} />
                <h2>{card.name}</h2>
                <h3>{card.role}</h3>
                <q>{card.message}</q>
                <div className="star-rating">
                  {[...Array(5)].map((_, starIndex) => (
                    <span key={starIndex} className="star">★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="nav-button next"
          onClick={() => handleSlide("right")}
          aria-label="Next slide"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}