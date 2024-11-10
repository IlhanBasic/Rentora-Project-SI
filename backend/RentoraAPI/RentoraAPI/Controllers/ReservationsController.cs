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
		public async Task<ActionResult<IEnumerable<Reservation>>> GetReservation()
		{
			var reservations = await _context.Reservation
				.Include(r => r.User)
				.Include(r => r.Vehicle)
				.Include(r => r.StartLocation)
				.Include(r => r.EndLocation)
				.ToListAsync();

			return reservations;
		}

		// GET: api/Reservations/5
		[HttpGet("{id}")]
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
