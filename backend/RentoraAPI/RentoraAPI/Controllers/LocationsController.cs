using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using RentoraAPI.Data;
using RentoraAPI.Models;

namespace RentoraAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class LocationsController : ControllerBase
	{
		private readonly RentoraDBContext _context;
		private readonly IMemoryCache _cache;
		private readonly string _cacheKey = "LocationList";

		public LocationsController(RentoraDBContext context, IMemoryCache cache)
		{
			_context = context;
			_cache = cache;
		}

		// GET: api/Locations
		[HttpGet]
		public async Task<ActionResult<IEnumerable<Location>>> GetLocation()
		{
			if (!_cache.TryGetValue(_cacheKey, out List<Location> locationList))
			{
				locationList = await _context.Location.ToListAsync() ?? new List<Location>();

				// Set cache options
				var cacheOptions = new MemoryCacheEntryOptions
				{
					AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
					SlidingExpiration = TimeSpan.FromMinutes(2)
				};

				// Save data in cache
				_cache.Set(_cacheKey, locationList, cacheOptions);
			}

			return locationList;
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
				_cache.Remove(_cacheKey); // Invalidate the cache
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
		public async Task<ActionResult<Location>> PostLocation(Location location)
		{
			if (location == null)
			{
				return BadRequest("Podaci o lokaciji su neispravni.");
			}

			_context.Location.Add(location);
			await _context.SaveChangesAsync();
			_cache.Remove(_cacheKey); // Invalidate the cache

			return CreatedAtAction("GetLocation", new { id = location.Id }, location);
		}

		// DELETE: api/Locations/5
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteLocation(Guid id)
		{
			var location = await _context.Location.FindAsync(id);
			if (location == null)
			{
				return NotFound("Lokacija sa zadatim ID-jem nije pronađena.");
			}

			_context.Location.Remove(location);
			await _context.SaveChangesAsync();
			_cache.Remove(_cacheKey); // Invalidate the cache

			return NoContent();
		}

		private bool LocationExists(Guid id)
		{
			return _context.Location.Any(e => e.Id == id);
		}
	}
}
