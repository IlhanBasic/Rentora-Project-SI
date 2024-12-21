using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using RentoraAPI.Data;
using RentoraAPI.Models;

namespace RentoraAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class VehiclesController : ControllerBase
	{
		private readonly RentoraDBContext _context;

		public VehiclesController(RentoraDBContext context)
		{
			_context = context;
		}
		[HttpGet("all")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<ActionResult<IEnumerable<Vehicle>>> GetAllVehicles()
		{
			try
			{
				var vehicles = await _context.Vehicle.ToListAsync();
				return Ok(vehicles);
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Internal server error");
			}
		}


		[HttpGet]
		public async Task<IActionResult> GetVehicle(int page = 1, int pageSize = 6)
		{
			if (page <= 0 || pageSize <= 0)
			{
				return BadRequest("Page and pageSize must be greater than 0.");
			}

			// Ukupni broj vozila u bazi
			int totalCount = await _context.Vehicle.CountAsync();

			// Paginacija pomoću LINQ-a
			var vehicles = await _context.Vehicle
				.Skip((page - 1) * pageSize) // Preskače prethodne zapise
				.Take(pageSize) // Uzima zapise za trenutnu stranicu
				.ToListAsync();

			// Metapodaci o paginaciji
			var result = new
			{
				TotalCount = totalCount,
				PageSize = pageSize,
				CurrentPage = page,
				TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
				Vehicles = vehicles
			};

			return Ok(result);
		}


		[HttpGet("{id}")]
		public async Task<ActionResult<Vehicle>> GetVehicle(Guid id)
		{
			var vehicle = await _context.Vehicle.FindAsync(id);

			if (vehicle == null)
			{
				return NotFound();
			}

			return vehicle;
		}

		[HttpPut("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin,User")]
		public async Task<IActionResult> PutVehicle(Guid id, Vehicle vehicle)
		{
			if (id != vehicle.Id)
			{
				return BadRequest();
			}

			_context.Entry(vehicle).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!VehicleExists(id))
				{
					return NotFound();
				}
				else
				{
					throw;
				}
			}

			return NoContent();
		}

		[HttpPost]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<ActionResult<Vehicle>> PostVehicle(Vehicle vehicle)
		{
			if (string.IsNullOrWhiteSpace(vehicle.Picture))
			{
				return BadRequest("Slika je obavezna.");
			}

			_context.Vehicle.Add(vehicle);
			await _context.SaveChangesAsync();

			return CreatedAtAction("GetVehicle", new { id = vehicle.Id }, vehicle);
		}

		[HttpDelete("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteVehicle(Guid id)
		{
			var vehicle = await _context.Vehicle.FindAsync(id);
			if (vehicle == null)
			{
				return NotFound();
			}

			_context.Vehicle.Remove(vehicle);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		[HttpPatch("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin,User")]
		public async Task<IActionResult> PatchVehicle(Guid id, VehiclePatchRequestDto vehiclePatchDto)
		{
			if (vehiclePatchDto == null || string.IsNullOrWhiteSpace(vehiclePatchDto.Status))
			{
				return BadRequest("Invalid request data.");
			}

			var vehicle = await _context.Vehicle.FindAsync(id);
			if (vehicle == null)
			{
				return NotFound("Vehicle not found.");
			}

			vehicle.Status = vehiclePatchDto.Status;
			await _context.SaveChangesAsync();

			return Ok(vehicle);
		}

		private bool VehicleExists(Guid id)
		{
			return _context.Vehicle.Any(e => e.Id == id);
		}
	}
}
