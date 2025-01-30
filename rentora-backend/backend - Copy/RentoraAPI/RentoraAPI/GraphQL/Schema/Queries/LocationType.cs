using System.ComponentModel.DataAnnotations;

namespace RentoraAPI.GraphQL.Schema.Queries
{
	public class LocationType
	{
		public Guid Id { get; set; }

		public string Street { get; set; }

		public string StreetNumber { get; set; }

		public string City { get; set; }

		public string Country { get; set; }

		public double Latitude { get; set; }

		public double Longitude { get; set; }
		public string Email { get; set; }
		public string PhoneNumber { get; set; }
	}
}
