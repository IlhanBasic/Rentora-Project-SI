export default function FilterGroup({ label, options, value, onChange,selectId }) {
  return (
    <div className="filter-group">
      <label>{label}:</label>
      <select id={selectId} onChange={onChange} value={value}>
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
