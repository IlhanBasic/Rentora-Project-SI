using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentoraAPI.Data;
using RentoraAPI.Models;
using RentoraAPI.Models.DTO;
using System.Security.Claims;

namespace RentoraAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ReservationsController : ControllerBase
	{
		private readonly RentoraDBContext _context;

		public ReservationsController(RentoraDBContext context)
		{
			_context = context;
		}

		// GET: api/Reservations
		[HttpGet]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<ActionResult<IEnumerable<ReservationResponseDto>>> GetReservation()
		{
			var reservations = await _context.Reservation
				.Include(r => r.User)
				.Include(r => r.Vehicle)  
				.Include(r => r.StartLocation)
				.Include(r => r.EndLocation)
				.ToListAsync();

			var reservationDtos = reservations.Select(r => new ReservationResponseDto
			{
				Id = r.Id,
				FirstName = r.User.FirstName,
				LastName = r.User.LastName,
				Email = r.User.Email,
				VehicleBrand = r.Vehicle.Brand,
				VehicleModel = r.Vehicle.Model,
				StartLocation = r.StartLocation.Street + "," + r.StartLocation.City,
				EndLocation = r.EndLocation.Street + "," + r.EndLocation.City,
				StartDateTime = r.StartDateTime,
				EndDateTime = r.EndDateTime,
				CreditCardNumber = r.CreditCardNumber,
				ReservationStatus = r.ReservationStatus,
				ReservationAmount = CalculateReservationAmount(r.StartDateTime, r.EndDateTime, r.Vehicle?.PricePerDay ?? 0) // Koristimo cenu iz vozila
			}).ToList();

			return Ok(reservationDtos);
		}

		private double CalculateReservationAmount(DateTime startDateTime, DateTime endDateTime, double pricePerDay)
		{
			var rentalDuration = (endDateTime - startDateTime).TotalDays;
			if (rentalDuration < 1) rentalDuration = 1;
			return Math.Round(rentalDuration * pricePerDay,0);
		}

		// GET api/reservations/user/{userId}
		[HttpGet]
		[Route("user/{userId}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin,User")]
		public async Task<IActionResult> GetReservationsByUserId(string userId)
		{
			var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier); // This gets the user's ID from the token

			if (currentUserId != userId && !User.IsInRole("Admin"))
			{
				return Forbid(); // Return 403 if the user is not the owner of the reservations or an admin
			}

			var reservations = await _context.Reservation
				.Where(r => r.UserId == userId)
				.Include(r => r.Vehicle)
				.Include(r => r.StartLocation)
				.Include(r => r.EndLocation)
				.ToListAsync();

			if (reservations == null || !reservations.Any())
			{
				return NotFound(new { Message = "No reservations found for this user." });
			}

			return Ok(reservations);
		}
		// GET: api/Reservations/5
		[HttpGet("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin,User")]
		public async Task<ActionResult<Reservation>> GetReservation(Guid id)
		{
			var reservation = await _context.Reservation
				.Include(r => r.User)
				.Include(r => r.Vehicle)
				.FirstOrDefaultAsync(r => r.Id == id);

			if (reservation == null)
			{
				return NotFound("Rezervacija sa zadatim ID-jem nije pronađena.");
			}

			return reservation;
		}

		// PUT: api/Reservations/5
		[HttpPut("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin,User")]
		public async Task<IActionResult> PutReservation(Guid id, Reservation reservation)
		{
			if (id != reservation.Id)
			{
				return BadRequest("Neispravan ID. Molimo proverite ID rezervacije.");
			}

			_context.Entry(reservation).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!ReservationExists(id))
				{
					return NotFound("Rezervacija sa zadatim ID-jem nije pronađena.");
				}
				else
				{
					return StatusCode(StatusCodes.Status500InternalServerError, "Došlo je do greške prilikom ažuriranja rezervacije. Molimo pokušajte ponovo.");
				}
			}

			return NoContent();
		}

		// POST: api/Reservations
		[HttpPost]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "User")]
		public async Task<ActionResult<Reservation>> PostReservation(ReservationRequestDto requestDto)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest("Podaci o rezervaciji su neispravni.");
			}

			var reservation = new Reservation
			{
				Id = Guid.NewGuid(),
				UserId = requestDto.UserId,
				VehicleId = requestDto.VehicleId,
				StartLocationId = requestDto.StartLocationId,
				EndLocationId = requestDto.EndLocationId,
				StartDateTime = requestDto.StartDateTime,
				EndDateTime = requestDto.EndDateTime,
				ReservationStatus = "Aktivna",
				CreditCardNumber = requestDto.CreditCardNumber
			};

			_context.Reservation.Add(reservation);

			var vehicle = await _context.Vehicle.FindAsync(requestDto.VehicleId);
			if (vehicle != null)
			{
				vehicle.Status = "Zauzeto"; // Update status to Reserved
			}

			await _context.SaveChangesAsync();
			return CreatedAtAction("GetReservation", new { id = reservation.Id }, reservation);
		}

		// PATCH: api/Reservations/5
		[HttpPatch("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "User,Admin")]
		public async Task<IActionResult> PatchReservation(Guid id, [FromBody] ReservationPatchDto reservationPatchDto)
		{
			if (reservationPatchDto == null || string.IsNullOrWhiteSpace(reservationPatchDto.ReservationStatus))
			{
				return BadRequest("Neispravni podaci u zahtevu.");
			}

			var reservation = await _context.Reservation.FindAsync(id);
			if (reservation == null)
			{
				return NotFound("Rezervacija sa zadatim ID-jem nije pronađena.");
			}

			reservation.ReservationStatus = reservationPatchDto.ReservationStatus;
			var vehicle = await _context.Vehicle.FindAsync(reservation.VehicleId);
			if (vehicle != null)
			{
				vehicle.Status = reservation.ReservationStatus == "Završena" || reservation.ReservationStatus == "Otkazana" ? "Dostupno" : "Zauzeto";
			}

			await _context.SaveChangesAsync();
			return Ok(reservation);
		}

		// DELETE: api/Reservations/5
		[HttpDelete("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteReservation(Guid id)
		{
			var reservation = await _context.Reservation.FindAsync(id);
			if (reservation == null)
			{
				return NotFound("Rezervacija sa zadatim ID-jem nije pronađena.");
			}

			_context.Reservation.Remove(reservation);
			var vehicle = await _context.Vehicle.FindAsync(reservation.VehicleId);
			if (vehicle != null)
			{
				vehicle.Status = "Dostupno";
			}

			await _context.SaveChangesAsync();
			return NoContent();
		}

		private bool ReservationExists(Guid id)
		{
			return _context.Reservation.Any(e => e.Id == id);
		}
	}
}
