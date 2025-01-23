using System;
using System.ComponentModel.DataAnnotations;

namespace RentoraAPI.Models
{
	public class Location
	{
		public Guid Id { get; set; }

		[Required(ErrorMessage = "Naziv ulice je obavezan.")]
		[StringLength(100, ErrorMessage = "Naziv ulice ne može biti duži od 100 karaktera.")]
		public string Street { get; set; }

		[Required(ErrorMessage = "Broj ulice je obavezan.")]
		[StringLength(5, ErrorMessage = "Broj ulice ne može biti duži od 5 karaktera.")]
		public string StreetNumber { get; set; }

		[Required(ErrorMessage = "Grad je obavezan.")]
		[StringLength(100, ErrorMessage = "Grad ne može biti duži od 100 karaktera.")]
		public string City { get; set; }

		[Required(ErrorMessage = "Država je obavezna.")]
		[StringLength(100, ErrorMessage = "Država ne može biti duža od 100 karaktera.")]
		public string Country { get; set; }

		[Required(ErrorMessage = "Geografska širina je obavezna.")]
		[Range(-90, 90, ErrorMessage = "Geografska širina mora biti između -90 i 90.")]
		public double Latitude { get; set; }

		[Required(ErrorMessage = "Geografska dužina je obavezna.")]
		[Range(-180, 180, ErrorMessage = "Geografska dužina mora biti između -180 i 180.")]
		public double Longitude { get; set; }
		[EmailAddress]
		public string Email { get; set; }
		[Phone]
		public string PhoneNumber { get; set; }
	}
}
