

using HotChocolate.Authorization;
//using Microsoft.AspNetCore.Authorization;
using RentoraAPI.GraphQL.Services.Locations;
using RentoraAPI.GraphQL.Services.Vehicles;
using RentoraAPI.Models;
using System.Net;
using Location = RentoraAPI.Models.Location;
namespace RentoraAPI.GraphQL.Schema.Queries
{
	public class Query
	{
		private readonly LocationsRepository _locationsRepository;
		private readonly VehicleRepository _vehicleRepository;
		public Query(LocationsRepository locationsRepository, VehicleRepository vehicleRepository)
		{
			_locationsRepository = locationsRepository;
			_vehicleRepository = vehicleRepository;
		}
		//Locations

		public async Task<IEnumerable<Location>> GetLocations()
		{
			return await _locationsRepository.GetLocations();
		}

		public async Task<Location> GetLocation(Guid id)
		{
			var location = await _locationsRepository.GetLocationById(id);
			if (location == null)
			{
				throw new GraphQLException(new Error("Location not found", "LOCATION_NOT_FOUND"));
			}

			return location;
		}

		public async Task<IEnumerable<Vehicle>> GetVehicles()
		{
			return await _vehicleRepository.GetVehicles();
		}

		public async Task<Vehicle> GetVehicle(Guid id)
		{
			var location = await _vehicleRepository.GetVehicleById(id);
			if (location == null)
			{
				throw new GraphQLException(new Error("Location not found", "LOCATION_NOT_FOUND"));
			}

			return location;
		}
	}
}