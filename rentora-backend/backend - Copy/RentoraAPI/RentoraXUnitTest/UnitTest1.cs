using Xunit;
using Moq;
using Microsoft.AspNetCore.Identity;
using RentoraAPI.Controllers;
using RentoraAPI.Models.DTO;
using RentoraAPI.Models;
using RentoraAPI.Respositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentoraAPI.Data;

namespace RentoraXUnitTest
{
	public class AuthControllerTests
	{
		[Fact]
		public async Task Login_ReturnsJwtToken_WhenLoginIsSuccessful()
		{
			// Arrange (Given)
			var userManagerMock = new Mock<UserManager<ApplicationUser>>(
				Mock.Of<IUserStore<ApplicationUser>>(), null, null, null, null, null, null, null, null);

			var roleManagerMock = new Mock<RoleManager<IdentityRole>>(
				Mock.Of<IRoleStore<IdentityRole>>(), null, null, null, null);

			var tokenRepositoryMock = new Mock<ITokenRepository>();
			var emailSenderMock = new Mock<RentoraAPI.Respositories.IEmailSender>();

			var testUser = new ApplicationUser { Email = "test@example.com", UserName = "test@example.com" };
			var roles = new List<string> { "User" };
			var jwtToken = "mock-jwt-token";

			userManagerMock.Setup(x => x.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(testUser);
			userManagerMock.Setup(x => x.IsEmailConfirmedAsync(testUser)).ReturnsAsync(true);
			userManagerMock.Setup(x => x.CheckPasswordAsync(testUser, "password")).ReturnsAsync(true);
			userManagerMock.Setup(x => x.GetRolesAsync(testUser)).ReturnsAsync(roles);

			tokenRepositoryMock.Setup(x => x.CreateJWTToken(testUser, roles)).Returns(jwtToken);

			var controller = new AuthController(userManagerMock.Object, roleManagerMock.Object, tokenRepositoryMock.Object, emailSenderMock.Object);

			var loginRequest = new LoginRequestDto { Username = "test@example.com", Password = "password" };

			// Act (When)
			var result = await controller.Login(loginRequest);

			// Assert (Then)
			var okResult = Assert.IsType<OkObjectResult>(result);
			var response = Assert.IsType<LoginResponseDto>(okResult.Value);
			Assert.Equal(jwtToken, response.JwtToken);
		}
		[Fact]
		public async Task GetLocation_ReturnsAllLocations()
		{
			// Arrange
			var options = new DbContextOptionsBuilder<RentoraDBContext>()
				.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
				.Options;

			using var context = new RentoraDBContext(options);
			// Dodajemo test lokacije u "bazu"
			context.Location.AddRange(new List<Location>
			{
				new Location { Id = Guid.NewGuid(), Street = "Knez Mihajlova", City="Beograd", Country="Srbija", Email="rentorabg@gmail.com" , Latitude=44.7866, Longitude=20.4489,PhoneNumber="713299", StreetNumber="19a"},
				new Location { Id = Guid.NewGuid(), Street = "Branka Radicevica", City="Beograd", Country="Srbija", Email="rentorabg2@gmail.com", Latitude=44.7867, Longitude=20.4490, PhoneNumber="713300",StreetNumber="14" }
			});
			await context.SaveChangesAsync();

			var controller = new LocationsController(context);

			// Act
			var result = await controller.GetLocation();

			// Assert
			var okResult = Assert.IsType<ActionResult<IEnumerable<Location>>>(result);
			var locations = Assert.IsAssignableFrom<IEnumerable<Location>>(okResult.Value);
			Assert.Equal(2, (locations as List<Location>).Count); 
		}
	}
}
