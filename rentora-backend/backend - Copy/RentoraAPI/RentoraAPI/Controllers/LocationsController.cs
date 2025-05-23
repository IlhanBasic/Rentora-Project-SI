﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentoraAPI.Data;
using RentoraAPI.Models;
using Location = RentoraAPI.Models.Location;
namespace RentoraAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class LocationsController : ControllerBase
	{
		private readonly RentoraDBContext _context;

		public LocationsController(RentoraDBContext context)
		{
			_context = context;
		}

		// GET: api/Locations
		[HttpGet]
		public async Task<ActionResult<IEnumerable<Location>>> GetLocation()
		{
			var locationList = await _context.Location.ToListAsync();

			return locationList ?? new List<Location>();
		}

		// GET: api/Locations/5
		[HttpGet("{id}")]
		public async Task<ActionResult<Location>> GetLocation(Guid id)
		{
			var location = await _context.Location.FindAsync(id);

			if (location == null)
			{
				return NotFound("Lokacija sa zadatim ID-jem nije pronađena.");
			}

			return location;
		}

		// PUT: api/Locations/5
		[HttpPut("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> PutLocation(Guid id, Location location)
		{
			if (id != location.Id)
			{
				return BadRequest("Neispravan ID. Molimo proverite ID lokacije.");
			}

			_context.Entry(location).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!LocationExists(id))
				{
					return NotFound("Lokacija sa zadatim ID-jem nije pronađena.");
				}
				else
				{
					return StatusCode(StatusCodes.Status500InternalServerError, "Došlo je do greške prilikom ažuriranja lokacije. Molimo pokušajte ponovo.");
				}
			}

			return NoContent();
		}

		// POST: api/Locations
		[HttpPost]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<ActionResult<Location>> PostLocation(Location location)
		{
			if (location == null)
			{
				return BadRequest("Podaci o lokaciji su neispravni.");
			}

			_context.Location.Add(location);
			await _context.SaveChangesAsync();

			return CreatedAtAction("GetLocation", new { id = location.Id }, location);
		}

		// DELETE: api/Locations/5
		// DELETE: api/Locations/5
		[HttpDelete("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteLocation(Guid id)
		{
			var location = await _context.Location.FindAsync(id);

			if (location == null)
			{
				return NotFound("Lokacija sa zadatim ID-jem nije pronađena.");
			}

			var locations = await _context.Location.ToListAsync();

			// Prevent deleting the last location
			if (locations.Count == 1)
			{
				return BadRequest(new { Message = "To je poslednja lokacija koja ne sme biti obrisana" });
			}

			var vehicles = await _context.Vehicle.ToListAsync();
			var vehiclesByLocation = vehicles.FindAll(v => v.LocationId == id);

			// Optionally handle the vehicles before deleting location, if needed
			foreach (var vehicle in vehiclesByLocation)
			{
				// Set vehicle's location to a default or handle it in another way
				vehicle.LocationId = locations[0].Id;  // Example: Move to first location or handle differently
			}

			_context.Location.Remove(location);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		private bool LocationExists(Guid id)
		{
			return _context.Location.Any(e => e.Id == id);
		}
	}
}
