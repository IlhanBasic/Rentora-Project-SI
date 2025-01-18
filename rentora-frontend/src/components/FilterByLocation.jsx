import "./FilterByLocation.css";
export default function FilterByLocation({ locations,setVehicleStartLocation }) {
  return (
    <div className="available-vehicles-by-locations">
      <label htmlFor="available-vehicles-by-locations">Odaberite početnu lokaciju</label>
      <select
        name="available-vehicles-by-locations"
        id="available-vehicles-by-locations"
        onChange={(e) => setVehicleStartLocation(e.target.value)}
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.street},{location.streetNumber}, {location.city},{" "}
            {location.country}
          </option>
        ))}
      </select>
    </div>
  );
}
