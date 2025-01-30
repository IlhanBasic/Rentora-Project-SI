using RentoraAPI.GraphQL.Services.Locations;
using RentoraAPI.GraphQL.Services.Vehicles;
using RentoraAPI.Models;
using Location = RentoraAPI.Models.Location;

namespace RentoraAPI.GraphQL.Schema.Mutations
{
    public class Mutation
	{
		private readonly LocationsRepository _locationsRepository;
		private readonly VehicleRepository _vehicleRepository;
		public Mutation(LocationsRepository locationsRepository,VehicleRepository vehicleRepository)
		{
			_locationsRepository = locationsRepository;
			_vehicleRepository = vehicleRepository;
		}
		//Locations
		public async Task<LocationResult> CreateLocation(LocationInputType input)
		{
			var location = new Location()
			{
				Id = Guid.NewGuid(),
				Longitude = input.Longitude,
				Latitude = input.Latitude,
				Email = input.Email,
				PhoneNumber = input.PhoneNumber,
				Street = input.Street,
				City = input.City,
				StreetNumber = input.StreetNumber,
				Country = input.Country,
			};
			location = await _locationsRepository.Create(location);
			var locationResult = new LocationResult()
			{
				Id = location.Id,
				Street = location.Street,
				StreetNumber = location.StreetNumber,
				City = location.City,
				Country = location.Country,
				Latitude = location.Latitude,
				Longitude = location.Longitude,
				PhoneNumber =location.PhoneNumber,
				Email = location.Email
			};
			return locationResult;
			
		}
		public async Task<LocationResult> UpdateLocation(Guid id, LocationInputType input)
		{
			var location = new Location()
			{
				Id = id,
				Longitude = input.Longitude,
				Latitude = input.Latitude,
				Email = input.Email,
				PhoneNumber = input.PhoneNumber,
				Street = input.Street,
				City = input.City,
				StreetNumber = input.StreetNumber,
				Country = input.Country,
			};
			location = await _locationsRepository.Update(location);
			if (location == null)
			{
				throw new GraphQLException(new Error("Location not found", "COURSE_NOT_FOUND"));
			}
			var locationResult = new LocationResult()
			{
				Id = location.Id,
				Street = location.Street,
				StreetNumber = location.StreetNumber,
				City = location.City,
				Country = location.Country,
				Latitude = location.Latitude,
				Longitude = location.Longitude,
				PhoneNumber = location.PhoneNumber,
				Email = location.Email
			};
			return locationResult;

		}
		public async Task<bool> DeleteLocation(Guid id)
		{
			try
			{
				return await _locationsRepository.Delete(id);
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error deleting location: {ex.Message}");
				return false;
			}
		}
		//Vehicles
		public async Task<VehicleResult> CreateVehicle(VehicleInputType input)
		{
			var vehicle = new Vehicle()
			{
				Id = Guid.NewGuid(),
				Brand = input.Brand,
				Model = input.Model,
				YearOfManufacture = input.YearOfManufacture,
				FuelType = input.FuelType,
				LocationId = input.LocationId,
				NumOfDoors	= input.NumOfDoors,
				RegistrationNumber = input.RegistrationNumber,
				Picture = input.Picture,
				PricePerDay = input.PricePerDay,
				Status = input.Status,
				Transmission = input.Transmission,
				Type = input.Type,
			};
			vehicle = await _vehicleRepository.Create(vehicle);
			var vehicleResult = new VehicleResult()
			{
				Id = vehicle.Id,
				Brand = vehicle.Brand,
				Model = vehicle.Model,
				YearOfManufacture = vehicle.YearOfManufacture,
				FuelType = vehicle.FuelType,
				LocationId = vehicle.LocationId,
				NumOfDoors = vehicle.NumOfDoors,
				RegistrationNumber = vehicle.RegistrationNumber,
				Picture = vehicle.Picture,
				PricePerDay = vehicle.PricePerDay,
				Status = vehicle.Status,
				Transmission = vehicle.Transmission,
				Type = vehicle.Type,
			};
			return vehicleResult;

		}
		public async Task<VehicleResult> UpdateVehicle(Guid id, VehicleInputType input)
		{
			var vehicle = new Vehicle()
			{
				Id = id,
				Brand = input.Brand,
				Model = input.Model,
				YearOfManufacture = input.YearOfManufacture,
				FuelType = input.FuelType,
				LocationId = input.LocationId,
				NumOfDoors = input.NumOfDoors,
				RegistrationNumber = input.RegistrationNumber,
				Picture = input.Picture,
				PricePerDay = input.PricePerDay,
				Status = input.Status,
				Transmission = input.Transmission,
				Type = input.Type,
			};
			vehicle = await _vehicleRepository.Update(vehicle);
			var vehicleResult = new VehicleResult()
			{
				Id = vehicle.Id,
				Brand = vehicle.Brand,
				Model = vehicle.Model,
				YearOfManufacture = vehicle.YearOfManufacture,
				FuelType = vehicle.FuelType,
				LocationId = vehicle.LocationId,
				NumOfDoors = vehicle.NumOfDoors,
				RegistrationNumber = vehicle.RegistrationNumber,
				Picture = vehicle.Picture,
				PricePerDay = vehicle.PricePerDay,
				Status = vehicle.Status,
				Transmission = vehicle.Transmission,
				Type = vehicle.Type,
			};
			return vehicleResult;
		}
		public async Task<bool> DeleteVehicle(Guid id)
		{
			try
			{
				return await _vehicleRepository.Delete(id);
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error deleting vehicle: {ex.Message}");
				return false;
			}
		}
	}
}
