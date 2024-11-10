using System;
using System.ComponentModel.DataAnnotations;

namespace RentoraAPI.Models.DTO
{
	public class ReservationRequestDto
	{
		[Required]
		public Guid VehicleId { get; set; }

		[Required]
		public Guid StartLocationId { get; set; }

		[Required]
		public Guid EndLocationId { get; set; }

		[Required]
		public string UserId { get; set; } 


		[Required]
		public DateTime StartDateTime { get; set; }

		[Required]
		public DateTime EndDateTime { get; set; }
		[Required]
		public string ReservationStatus { get; set; }

		[CreditCard]
		public string? CreditCardNumber { get; set; }
	}
}
