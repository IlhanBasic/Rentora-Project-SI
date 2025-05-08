using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RentoraAPI.Models;
using System.Collections.Generic;
using Location = RentoraAPI.Models.Location;
namespace RentoraAPI.Data
{
	public class RentoraDBContext : IdentityDbContext<ApplicationUser>
	{
		public RentoraDBContext(DbContextOptions<RentoraDBContext> options) : base(options) { }

		protected override void OnModelCreating(ModelBuilder builder)
		{
			base.OnModelCreating(builder);

			// Veza između korisnika i rezervacija sa kaskadnim brisanjem
			builder.Entity<Reservation>()
				.HasOne(r => r.User)
				.WithMany(u => u.Reservations)
				.HasForeignKey(r => r.UserId)
				.IsRequired()
				.OnDelete(DeleteBehavior.Cascade); // Kaskadno brisanje rezervacija kad se obriše korisnik

			builder.Entity<Reservation>()
				.HasOne(r => r.Vehicle)
				.WithMany()
				.HasForeignKey(r => r.VehicleId)
				.OnDelete(DeleteBehavior.NoAction); // Vozilo ne briše rezervaciju

			builder.Entity<Reservation>()
				.HasOne(r => r.StartLocation)
				.WithMany()
				.HasForeignKey(r => r.StartLocationId)
				.OnDelete(DeleteBehavior.NoAction); // Lokacija ne briše rezervaciju

			builder.Entity<Reservation>()
				.HasOne(r => r.EndLocation)
				.WithMany()
				.HasForeignKey(r => r.EndLocationId)
				.OnDelete(DeleteBehavior.NoAction); // Lokacija ne briše rezervaciju

			// Seed roles
			var roles = new List<IdentityRole>
	{
		new IdentityRole
		{
			Id = "8a000e3b-b915-43f1-b90e-b28075ec8cac",
			Name = "User",
			NormalizedName = "USER"
		},
		new IdentityRole
		{
			Id = "415a7c65-81dd-4fe3-9c44-9493db860c4b",
			Name = "Admin",
			NormalizedName = "ADMIN"
		}
	};

			builder.Entity<IdentityRole>().HasData(roles);
		}

		public DbSet<Vehicle> Vehicle { get; set; } = default!;
		public DbSet<Location> Location { get; set; } = default!;
		public DbSet<Reservation> Reservation { get; set; } = default!;
		public DbSet<PasswordResetPIN> PasswordResetPIN { get; set; } = default!;
	}
}