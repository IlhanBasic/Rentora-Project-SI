using RentoraAPI.Data;
using RentoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Location = RentoraAPI.Models.Location;

namespace RentoraAPI.GraphQL.Services.Locations
{
	public class LocationsRepository
	{
		private readonly IDbContextFactory<RentoraDBContext> _contextFactory;

		// Use IDbContextFactory instead of direct DbContext injection
		public LocationsRepository(IDbContextFactory<RentoraDBContext> contextFactory)
		{
			_contextFactory = contextFactory;
		}

		public async Task<IEnumerable<Location>> GetLocations()
		{
			using var context = await _contextFactory.CreateDbContextAsync();
			return await context.Location.ToListAsync();
		}

		public async Task<Location> GetLocationById(Guid id)
		{
			using var context = await _contextFactory.CreateDbContextAsync();
			return await context.Location.FirstOrDefaultAsync(x => x.Id == id);
		}

		public async Task<Location> Create(Location location)
		{
			using var context = await _contextFactory.CreateDbContextAsync();
			context.Add(location);
			await context.SaveChangesAsync();
			return location;
		}

		public async Task<Location> Update(Location location)
		{
			using var context = await _contextFactory.CreateDbContextAsync();
			context.Update(location);
			await context.SaveChangesAsync();
			return location;
		}

		public async Task<bool> Delete(Guid id)
		{
			using var context = await _contextFactory.CreateDbContextAsync();
			var location = await context.Location.FindAsync(id);
			if (location == null)
			{
				return false;
			}

			context.Location.Remove(location);
			await context.SaveChangesAsync();
			return true;
		}
	}
}