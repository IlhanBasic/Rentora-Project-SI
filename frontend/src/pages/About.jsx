import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import DinamicCard from "../components/DinamicCard.jsx";
import Carousel from "../components/Carousel.jsx";
import aboutImg from "../assets/person.jpg";
import { ABOUT_DATA } from "../data/ABOUT_DATA.js"; 

export default function About() {
  const [successInfo, setSuccessInfo] = useState({
    numberOfHappyUsers: 0,
    numberOfYears: 0,
    numberOfLocations: 0,
  });

  useEffect(() => {
    const targetValues = {
      numberOfHappyUsers: ABOUT_DATA.numberOfHappyUsers,
      numberOfYears: ABOUT_DATA.numberOfYears,
      numberOfLocations: ABOUT_DATA.numberOfLocations,
    };

    const interval2 = setInterval(() => {
      if (successInfo.numberOfLocations < targetValues.numberOfLocations) {
        setSuccessInfo((prev) => ({
          ...prev,
          numberOfLocations: Math.min(
            prev.numberOfLocations + 1,
            targetValues.numberOfLocations
          ),
        }));
      } else {
        clearInterval(interval2);
      }
    }, 350);

    const interval1 = setInterval(() => {
      if (successInfo.numberOfHappyUsers < targetValues.numberOfHappyUsers) {
        setSuccessInfo((prev) => ({
          ...prev,
          numberOfHappyUsers: Math.min(
            prev.numberOfHappyUsers + 150,
            targetValues.numberOfHappyUsers
          ),
        }));
      } else {
        clearInterval(interval1);
      }
    }, 250);

    const interval3 = setInterval(() => {
      if (successInfo.numberOfYears < targetValues.numberOfYears) {
        setSuccessInfo((prev) => ({
          ...prev,
          numberOfYears: Math.min(
            prev.numberOfYears + 1,
            targetValues.numberOfYears
          ),
        }));
      } else {
        clearInterval(interval3);
      }
    }, 350);

    return () => {
      clearInterval(interval2);
      clearInterval(interval1);
      clearInterval(interval3);
    };
  }, []);

  return (
    <>
      <Header title="O nama" />
      <div className="about-main">
        <img src={aboutImg} alt="slika1" />
        <div className="about-general-info">
          <h1>{ABOUT_DATA.companyInfo.title}</h1>
          <p>{ABOUT_DATA.companyInfo.mission}</p>
        </div>
      </div>
      <div className="dinamic-info">
        <DinamicCard
          title="Zadovoljnih Korisnika"
          number={successInfo.numberOfHappyUsers}
        />
        <DinamicCard
          title="Godina poslovanja"
          number={successInfo.numberOfYears}
        />
        <DinamicCard
          title="Broj lokacija"
          number={successInfo.numberOfLocations}
        />
      </div>
      <Header title="Šta drugi kažu o nama" />
      <Carousel />
    </>
  );
}
