import AdminSection from "./AdminSection";
const RenderSection = () => {
  switch (activeSection) {
    case "vehicles":
      return (
        <AdminSection
          title="Vozila"
          data={vehicles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    case "reservations":
      return (
        <AdminSection
          title="Rezervacije"
          data={reservations}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      );
    case "users":
      return (
        <AdminSection
          title="Korisnici"
          data={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    case "locations":
      return (
        <AdminSection
          title="Lokacije"
          data={locations}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    default:
      return (
        <AdminSection
          title="Vozila"
          data={vehicles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
  }
};
export default RenderSection;
