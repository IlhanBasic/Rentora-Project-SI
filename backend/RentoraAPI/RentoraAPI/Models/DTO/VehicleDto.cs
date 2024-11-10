namespace RentoraAPI.Models.DTO
{
	public class VehicleDto
	{
		public string Brand { get; set; }
		public string Model { get; set; }
		public int YearOfManufacture { get; set; }
		public string RegistrationNumber { get; set; }
		public double PricePerDay { get; set; }
		public string Status { get; set; }
		public IFormFile Picture { get; set; }  
		public string FuelType { get; set; }
	}
}
