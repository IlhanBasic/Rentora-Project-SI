using RentoraAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Location = RentoraAPI.Models.Location;
public class Reservation
{
	public Guid Id { get; set; }
	[Required]
	[ForeignKey("User")]
	public string UserId { get; set; }

	public string? CreditCardNumber { get; set; }

	public Guid VehicleId { get; set; }
	public Guid StartLocationId { get; set; }
	public Guid EndLocationId { get; set; }

	[DataType(DataType.DateTime)]
	public DateTime StartDateTime { get; set; }

	[DataType(DataType.DateTime)]
	public DateTime EndDateTime { get; set; }

	[Required]
	public string ReservationStatus { get; set; }
	public string? Insurance { get; set; }
	public string? ChildSeat { get; set; }

	public virtual ApplicationUser User { get; set; }

	public virtual Vehicle Vehicle { get; set; }
	public virtual Location StartLocation { get; set; }
	public virtual Location EndLocation { get; set; }
}