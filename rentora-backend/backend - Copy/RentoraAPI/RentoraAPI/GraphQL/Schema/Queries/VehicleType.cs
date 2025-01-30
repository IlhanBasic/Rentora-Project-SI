using System.ComponentModel.DataAnnotations;
using Location = RentoraAPI.Models.Location;
namespace RentoraAPI.GraphQL.Schema.Queries
{
	public class VehicleType
	{
		public Guid Id { get; set; }
		public Guid LocationId { get; set; }

		public string Brand { get; set; }

		public string Model { get; set; }

		public int YearOfManufacture { get; set; }
		public string RegistrationNumber { get; set; }

		public double PricePerDay { get; set; }

		public string Status { get; set; }

		public string Picture { get; set; }

		public string FuelType { get; set; }

		public int NumOfDoors { get; set; }

		public string Transmission { get; set; }

		public string Type { get; set; }
		public Location Location { get; set; }
	}
}
