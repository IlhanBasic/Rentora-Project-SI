using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentoraAPI.Data;
using RentoraAPI.Models;
using RentoraAPI.Models.DTO;
using RentoraAPI.Services;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace RentoraAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ReservationsController : ControllerBase
	{
		private readonly RentoraDBContext _context;
		private readonly Respositories.IEmailSender _emailSender;
		public ReservationsController(RentoraDBContext context, Respositories.IEmailSender emailSender)
		{
			_context = context;
			_emailSender = emailSender;
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
				Insurance = r.Insurance,
				ChildSeat = r.ChildSeat,
				ReservationStatus = r.ReservationStatus,
				ReservationAmount = CalculateReservationAmount(
				r.StartDateTime,
				r.EndDateTime,
				r.Vehicle?.PricePerDay ?? 0,
				r.Insurance ?? "none",
				r.ChildSeat ?? "nema"
			)

			}).ToList();

			return Ok(reservationDtos);
		}

		private double CalculateReservationAmount(DateTime startDateTime, DateTime endDateTime, double pricePerDay, string insurance, string childSeat)
		{
			// Cene osiguranja
			var insurancePrices = new Dictionary<string, double>
		{
			{ "basic", 400 },
			{ "full", 2000 },
			{ "premium", 1000 },
			{ "none", 0 }
		};

			// Cene dečijih sedišta
			var childSeatPrices = new Dictionary<string, double>
		{
			{ "jedno", 500 },
			{ "dva", 1000 },
			{ "nema", 0 }
		};

			// Trajanje rentiranja u danima (minimalno 1 dan)
			var rentalDuration = (endDateTime - startDateTime).TotalDays;
			if (rentalDuration < 1) rentalDuration = 1;

			// Cena za osiguranje i sedišta
			var insurancePrice = insurancePrices.ContainsKey(insurance.ToLower()) ? insurancePrices[insurance.ToLower()] : 0;
			var childSeatPrice = childSeatPrices.ContainsKey(childSeat.ToLower()) ? childSeatPrices[childSeat.ToLower()] : 0;

			// Ukupna cena
			var totalAmount = rentalDuration * pricePerDay + insurancePrice + childSeatPrice;

			return Math.Round(totalAmount, 0);
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
				return NotFound(new { Message = "Nisu pronađene rezervacije." });
			}

			return Ok(reservations);
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

			var user = await _context.Users.FindAsync(requestDto.UserId);
			if (user == null)
			{
				return NotFound("Korisnik nije pronađen.");
			}

			var vehicle = await _context.Vehicle.FindAsync(requestDto.VehicleId);
			if (vehicle == null)
			{
				return NotFound("Vozilo nije pronađeno.");
			}

			// Dohvati lokacije iz baze
			var startLocation = await _context.Location.FindAsync(requestDto.StartLocationId);
			var endLocation = await _context.Location.FindAsync(requestDto.EndLocationId);

			if (startLocation == null || endLocation == null)
			{
				return NotFound("Jedna ili obe lokacije nisu pronađene.");
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
				Insurance = requestDto.Insurance,
				ChildSeat = requestDto.ChildSeat,
				ReservationStatus = "Aktivna",
				CreditCardNumber = requestDto.CreditCardNumber
			};

			_context.Reservation.Add(reservation);

			// Ažuriraj status vozila
			vehicle.LocationId = requestDto.EndLocationId;
			vehicle.Status = "Zauzeto";

			await _context.SaveChangesAsync();

			// Slanje e-maila korisniku
			await _emailSender.SendEmailAsync(user.Email, "Potvrda rezervacije vozila",
				$@"
<!DOCTYPE html>
<html lang='sr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Potvrda rezervacije</title>
    <style>
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }}
        .header {{
            text-align: center;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            padding: 25px 20px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 26px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px;
            color: #2c3e50;
        }}
        .message {{
            background-color: #f8f9fa;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <h1>Potvrda rezervacije</h1>
        </div>
        <div class='content'>
            <p>Poštovani {user.FirstName} {user.LastName},</p>
            <div class='message'>
                Vaša rezervacija vozila je uspešno potvrđena!<br>
                Detalji rezervacije:<br>
                - Vozilo: {vehicle.Brand} {vehicle.Model}<br>
                - Datum preuzimanja: {requestDto.StartDateTime:dd.MM.yyyy HH:mm}<br>
                - Datum vraćanja: {requestDto.EndDateTime:dd.MM.yyyy HH:mm}<br>
                - Lokacija preuzimanja: {startLocation.Street} {startLocation.StreetNumber}, {startLocation.City}<br>
                - Lokacija vraćanja: {endLocation.Street} {endLocation.StreetNumber}, {endLocation.City}
            </div>
            <p>Hvala što koristite Rentora uslugu!</p>
        </div>
        <div class='footer'>
            &copy; {DateTime.Now.Year} Rentora | Sva prava zadržana
        </div>
    </div>
</body>
</html>");

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
			var admins = from ur in _context.UserRoles
						 join r in _context.Roles on ur.RoleId equals r.Id
						 join u in _context.Users on ur.UserId equals u.Id
						 where r.Name == "Admin"
						 select new
						 {
							 UserId = u.Id,
                             FirstName = u.FirstName,
                             LastName = u.LastName,
							 Email = u.Email
						 };

			var adminList = admins.ToList();

			var reservation = await _context.Reservation
				.Include(r => r.User)
                .Include(r=>r.Vehicle)
                .Include(r=>r.StartLocation)
                .Include(r=>r.EndLocation)
				.FirstOrDefaultAsync(r => r.Id == id);
			if (reservation == null)
			{
				return NotFound("Rezervacija sa zadatim ID-jem nije pronađena.");
			}
			if(reservationPatchDto.ReservationStatus == "Otkazana")
			{
				try
				{
					await _emailSender.SendEmailAsync(reservation.User.Email, "Otkazivanje rezervacije vozila",
						$@"
<!DOCTYPE html>
<html lang='sr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Potvrda rezervacije</title>
    <style>
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }}
        .header {{
            text-align: center;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            padding: 25px 20px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 26px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px;
            color: #2c3e50;
        }}
        .message {{
            background-color: #f8f9fa;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <h1>Otkazivanje rezervacije</h1>
        </div>
        <div class='content'>
            <p>Poštovani {reservation.User.FirstName} {reservation.User.LastName},</p>
            <div class='message'>
                Vaša rezervacija vozila je otkazana.
            </div>
            <p>Ukoliko niste vi otkazali moguće da su to učinili Administratori na Vaš zahtev.</p>
			<p>Hvala što koristite Rentora uslugu!</p>
        </div>
        <div class='footer'>
            &copy; {DateTime.Now.Year} Rentora | Sva prava zadržana
        </div>
    </div>
</body>
</html>");
					foreach(var a in adminList)
					{
						await _emailSender.SendEmailAsync(a.Email, "Otkazivanje rezervacije vozila",
						$@"
<!DOCTYPE html>
<html lang='sr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Potvrda rezervacije</title>
    <style>
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }}
        .header {{
            text-align: center;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            padding: 25px 20px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 26px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px;
            color: #2c3e50;
        }}
        .message {{
            background-color: #f8f9fa;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <h1>Otkazivanje rezervacije - {reservation.User.Email}</h1>
        </div>
        <div class='content'>
            <p>Poštovani {a.FirstName} {a.LastName},</p>
            <div class='message'>
               Korisnik {reservation.User.Email} je otkazao rezervaciju.
            </div>
            <p>Proverite Dashboard.</p>
            <p>
            Detalji rezervacije:<br>
                - Id: {reservation.Id}<br>
                - Vozilo: {reservation.Vehicle.Brand} {reservation.Vehicle.Model}<br>
                - Datum preuzimanja: {reservation.StartDateTime:dd.MM.yyyy HH:mm}<br>
                - Datum vraćanja: {reservation.EndDateTime:dd.MM.yyyy HH:mm}<br>
                - Lokacija preuzimanja: {reservation.StartLocation.Street} {reservation.StartLocation.StreetNumber}, {reservation.StartLocation.City}<br>
                - Lokacija vraćanja: {reservation.EndLocation.Street} {reservation.EndLocation.StreetNumber}, {reservation.EndLocation.City}
            </p>
        </div>
        <div class='footer'>
            &copy; {DateTime.Now.Year} Rentora | Sva prava zadržana
        </div>
    </div>
</body>
</html>");
					}
				}
				catch (Exception ex)
				{
					Console.WriteLine(ex.ToString());
				}
			}
			reservation.ReservationStatus = reservationPatchDto.ReservationStatus;
			var vehicle = await _context.Vehicle.FindAsync(reservation.VehicleId);
			if (vehicle != null)
			{
				vehicle.LocationId = reservation.EndLocationId;
				vehicle.Status = reservation.ReservationStatus == "Istekla" || reservation.ReservationStatus == "Otkazana" ? "Dostupno" : "Zauzeto";
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
			var reservation = await _context.Reservation
				.Include(r => r.User)
				.FirstOrDefaultAsync(r => r.Id == id);

			if (reservation == null)
			{
				return NotFound("Rezervacija sa zadatim ID-jem nije pronađena.");
			}

			try
			{
				await _emailSender.SendEmailAsync(reservation.User.Email, "Brisanje rezervacije vozila",
					$@"
<!DOCTYPE html>
<html lang='sr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Potvrda rezervacije</title>
    <style>
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }}
        .header {{
            text-align: center;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            padding: 25px 20px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 26px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px;
            color: #2c3e50;
        }}
        .message {{
            background-color: #f8f9fa;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <h1>Brisanje rezervacije</h1>
        </div>
        <div class='content'>
            <p>Poštovani {reservation.User.FirstName} {reservation.User.LastName},</p>
            <div class='message'>
                Vaša rezervacija vozila je obrisana od strane Administratora
            </div>
            <p>Hvala što koristite Rentora uslugu!</p>
        </div>
        <div class='footer'>
            &copy; {DateTime.Now.Year} Rentora | Sva prava zadržana
        </div>
    </div>
</body>
</html>");
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex.ToString());
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
