﻿namespace RentoraAPI.Models.DTO
{
	public class ReservationResponseDto
	{
		public Guid Id { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string Email { get; set; }
		public string VehicleBrand { get; set; }
		public string VehicleModel { get; set; }
		public string StartLocation { get; set; }
		public string EndLocation { get; set; }
		public DateTime StartDateTime { get; set; }
		public DateTime EndDateTime { get; set; }
		public string CreditCardNumber { get; set; }
		public string ReservationStatus { get; set; }
		public double ReservationAmount { get; set; }
		public string Insurance {  get; set; }
		public string ChildSeat { get; set; }
	}

}
