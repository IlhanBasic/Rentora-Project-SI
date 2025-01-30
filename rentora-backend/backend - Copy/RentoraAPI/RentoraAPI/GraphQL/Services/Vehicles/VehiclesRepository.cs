using RentoraAPI.Data;
using RentoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Location = RentoraAPI.Models.Location;
using Microsoft.AspNetCore.Http.HttpResults;

namespace RentoraAPI.GraphQL.Services.Vehicles
{
    public class VehicleRepository
    {
        private readonly IDbContextFactory<RentoraDBContext> _contextFactory;

        // Use IDbContextFactory instead of direct DbContext injection
        public VehicleRepository(IDbContextFactory<RentoraDBContext> contextFactory)
        {
            _contextFactory = contextFactory;
        }

        public async Task<IEnumerable<Vehicle>> GetVehicles()
        {
            using var context = await _contextFactory.CreateDbContextAsync();
            return await context.Vehicle.ToListAsync();
        }

        public async Task<Vehicle> GetVehicleById(Guid id)
        {
            using var context = await _contextFactory.CreateDbContextAsync();
            var location = await context.Vehicle.FirstOrDefaultAsync(x => x.Id == id);
            if (location == null)
            {
                return null;
            }
            return location;
        }

        public async Task<Vehicle> Create(Vehicle vehicle)
        {
            using var context = await _contextFactory.CreateDbContextAsync();
            context.Add(vehicle);
            await context.SaveChangesAsync();
            return vehicle;
        }

        public async Task<Vehicle> Update(Vehicle vehicle)
        {
            using var context = await _contextFactory.CreateDbContextAsync();
            context.Update(vehicle);
            await context.SaveChangesAsync();
            return vehicle;
        }

        public async Task<bool> Delete(Guid id)
        {
            using var context = await _contextFactory.CreateDbContextAsync();
            var vehicle = await context.Vehicle.FindAsync(id);
            if (vehicle == null)
            {
                return false;
            }

            context.Vehicle.Remove(vehicle);
            await context.SaveChangesAsync();
            return true;
        }
    }
}