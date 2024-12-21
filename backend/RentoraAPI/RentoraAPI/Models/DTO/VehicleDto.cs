namespace RentoraAPI.Models.DTO
{
	public class VehicleDto
	{
		public Guid Id { get; set; }
		public string Brand { get; set; }
		public string Model { get; set; }
		public int YearOfManufacture { get; set; }
		public string RegistrationNumber { get; set; }
		public double PricePerDay { get; set; }
		public string Status { get; set; }
		public string Transmission {  get; set; }
		public string Picture { get; set; }  
		public string FuelType { get; set; }
	}
}
