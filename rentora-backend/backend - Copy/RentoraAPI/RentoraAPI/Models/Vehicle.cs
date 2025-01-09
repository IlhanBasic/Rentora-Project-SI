using System;
using System.ComponentModel.DataAnnotations;

namespace RentoraAPI.Models
{
	public class Vehicle
	{
		public Guid Id { get; set; }

		[Required(ErrorMessage = "Marka je obavezna.")]
		[StringLength(50, ErrorMessage = "Marka ne može biti duža od 50 karaktera.")]
		public string Brand { get; set; }

		[Required(ErrorMessage = "Model je obavezan.")]
		[StringLength(50, ErrorMessage = "Model ne može biti duži od 50 karaktera.")]
		public string Model { get; set; }

		[Required(ErrorMessage = "Godina proizvodnje je obavezna.")]
		[Range(2000, 2100, ErrorMessage = "Godina proizvodnje mora biti između 2000. i 2100.")]
		public int YearOfManufacture { get; set; }

		[Required(ErrorMessage = "Registracijski broj je obavezan.")]
		[StringLength(20, ErrorMessage = "Registracijski broj ne može biti duži od 20 karaktera.")]
		public string RegistrationNumber { get; set; }

		[Required(ErrorMessage = "Cena po danu je obavezna.")]
		[Range(0.01, double.MaxValue, ErrorMessage = "Cena po danu mora biti pozitivna vrednost.")]
		public double PricePerDay { get; set; }

		[Required(ErrorMessage = "Status je obavezan.")]
		[StringLength(20, ErrorMessage = "Status ne može biti duži od 20 karaktera.")]
		public string Status { get; set; }

		public string Picture { get; set; }

		[StringLength(10, ErrorMessage = "Tip goriva ne može biti duža od 10 karaktera.")]
		public string FuelType { get; set; }

		[Required(ErrorMessage = "Broj vrata je obavezan.")]
		[Range(2, 5, ErrorMessage = "Broj vrata mora biti između 2 i 5.")]
		public int NumOfDoors { get; set; }

		[Required(ErrorMessage = "Menjač je obavezan.")]
		[StringLength(20, ErrorMessage = "Menjač ne može biti duži od 20 karaktera.")]
		public string Transmission { get; set; }

		[Required(ErrorMessage = "Tip vozila je obavezan.")]
		[StringLength(30, ErrorMessage = "Tip vozila ne može biti duži od 30 karaktera.")]
		public string Type { get; set; }
	}
}
