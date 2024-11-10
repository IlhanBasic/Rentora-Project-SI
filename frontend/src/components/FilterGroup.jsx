export default function FilterGroup({ label, options, value, onChange }) {
  return (
    <div className="filter-group">
      <label>{label}:</label>
      <select onChange={onChange} value={value}>
        <option value="">Sve opcije</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
}
