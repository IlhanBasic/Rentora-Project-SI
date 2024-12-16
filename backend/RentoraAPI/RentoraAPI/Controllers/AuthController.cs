using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RentoraAPI.Models.DTO;
using RentoraAPI.Models;
using RentoraAPI.Respositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace RentoraAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly UserManager<ApplicationUser> userManager;
		private readonly RoleManager<IdentityRole> roleManager; // Dodano RoleManager
		private readonly ITokenRepository tokenRepository;
		private readonly Respositories.IEmailSender emailSender;

		// Konstruktor sa RoleManager
		public AuthController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, ITokenRepository tokenRepository, Respositories.IEmailSender emailSender)
		{
			this.userManager = userManager;
			this.roleManager = roleManager; // Dodela RoleManager
			this.tokenRepository = tokenRepository;
			this.emailSender = emailSender;
		}

		[HttpPatch]
		[Route("Users/{id}/ChangePassword")]
		public async Task<IActionResult> ChangeUserPassword(string id, [FromBody] ChangePasswordRequestDto changePasswordRequest)
		{
			var user = await userManager.FindByIdAsync(id);
			if (user == null)
			{
				return NotFound(new { Message = "Korisnik nije pronađen." });
			}

			var checkPasswordResult = await userManager.CheckPasswordAsync(user, changePasswordRequest.OldPassword);
			if (!checkPasswordResult)
			{
				return BadRequest(new { Message = "Stare šifre se ne poklapaju." });
			}

			var result = await userManager.ChangePasswordAsync(user, changePasswordRequest.OldPassword, changePasswordRequest.NewPassword);
			if (!result.Succeeded)
			{
				return BadRequest(new { Message = "Greška prilikom promene lozinke.", Errors = result.Errors });
			}

			return Ok(new { Message = "Lozinka je uspešno promenjena." });
		}

		// POST api/auth/Register NOVI
		[HttpPost]
		[Route("Register")]
		public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequestDto)
		{
			// Validate input data
			if (registerRequestDto == null)
			{
				return BadRequest(new { Message = "Podaci za registraciju nisu poslati." });
			}

			if (string.IsNullOrEmpty(registerRequestDto.Username) ||
				string.IsNullOrEmpty(registerRequestDto.Password) ||
				string.IsNullOrEmpty(registerRequestDto.FirstName) ||
				string.IsNullOrEmpty(registerRequestDto.LastName))
			{
				return BadRequest(new { Message = "Sva polja su obavezna." });
			}

			// Validate roles
			if (registerRequestDto.Roles != null && registerRequestDto.Roles.Any())
			{
				foreach (var role in registerRequestDto.Roles)
				{
					if (!await roleManager.RoleExistsAsync(role))
					{
						return BadRequest(new { Message = $"Uloga '{role}' ne postoji. Dozvoljene uloge su: Admin i User." });
					}
				}
			}

			// Check if user already exists
			var existingUser = await userManager.FindByEmailAsync(registerRequestDto.Username);
			if (existingUser != null)
			{
				return BadRequest(new { Message = $"Email '{registerRequestDto.Username}' je već zauzet." });
			}

			// Create new user
			var identityUser = new ApplicationUser
			{
				UserName = registerRequestDto.Username,
				Email = registerRequestDto.Username,
				FirstName = registerRequestDto.FirstName,
				LastName = registerRequestDto.LastName,
				PhoneNumber = registerRequestDto.PhoneNumber
			};

			try
			{
				var identityResult = await userManager.CreateAsync(identityUser, registerRequestDto.Password);
				if (!identityResult.Succeeded)
				{
					return BadRequest(new
					{
						Message = "Registracija korisnika nije uspela.",
						Errors = identityResult.Errors.Select(e => e.Description)
					});
				}

				// Add roles to the user
				if (registerRequestDto.Roles != null && registerRequestDto.Roles.Any())
				{
					var roleResult = await userManager.AddToRolesAsync(identityUser, registerRequestDto.Roles);
					if (!roleResult.Succeeded)
					{
						// If role assignment fails, delete the created user to maintain data integrity
						await userManager.DeleteAsync(identityUser);
						return BadRequest(new { Message = "Došlo je do greške prilikom dodele uloga." });
					}
				}

				// Generate email confirmation token
				var token = await userManager.GenerateEmailConfirmationTokenAsync(identityUser);

				// Use the token directly without re-encoding it
				var confirmationLink = Url.Action(nameof(ConfirmEmail), "Auth",
					new { userId = identityUser.Id, token }, Request.Scheme);

				// Send confirmation email
				await emailSender.SendEmailAsync(identityUser.Email, "Verifikacija profila",
					$"Molimo vas da kliknete na sledeći link kako biste verifikovali svoj profil: <a href='{confirmationLink}'>Verifikacija</a>");

				return Ok(new { Message = "Korisnik je registrovan! Molimo vas da potvrdite svoj email." });
			}
			catch (Exception ex)
			{
				// If any error occurs during user creation, delete the user to maintain data integrity
				if (identityUser != null)
				{
					await userManager.DeleteAsync(identityUser);
				}

				return StatusCode(500, new { Message = "Došlo je do greške na serveru.", Details = ex.Message });
			}
		}

		[HttpGet]
		[Route("ConfirmEmail")]
		public async Task<IActionResult> ConfirmEmail(string userId, string token)
		{
			var user = await userManager.FindByIdAsync(userId);
			if (user == null)
			{
				return BadRequest(new { Message = "Korisnik nije pronađen." });
			}

			var result = await userManager.ConfirmEmailAsync(user, token);
			if (result.Succeeded)
			{
				user.EmailConfirmed = true; 
				await userManager.UpdateAsync(user); 
				return Ok(new { Message = "Email je uspešno potvrđen." });
			}

			return BadRequest(new { Message = "Došlo je do greške prilikom potvrde email-a." });
		}

		// POST api/auth/Login
		[HttpPost]
		[Route("Login")]
		public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequestDto)
		{
			// Find the user by email
			var user = await userManager.FindByEmailAsync(loginRequestDto.Username);
			if (user != null)
			{
				// Check if the email is confirmed
				if (!await userManager.IsEmailConfirmedAsync(user))
				{
					return BadRequest(new { Message = "Email nije potvrđen. Molimo vas da potvrdite svoj email pre nego što se prijavite." });
				}

				// Check password
				var checkPasswordResult = await userManager.CheckPasswordAsync(user, loginRequestDto.Password);
				if (checkPasswordResult)
				{
					// Create JWT token
					var roles = await userManager.GetRolesAsync(user);
					if (roles != null)
					{
						var jwtToken = tokenRepository.CreateJWTToken(user, roles.ToList());
						var response = new LoginResponseDto
						{
							JwtToken = jwtToken
						};
						return Ok(response);
					}
				}
				return BadRequest(new { Message = "Šifra nije ispravna." });
			}
			return BadRequest(new { Message = "Uneta email adresa ne postoji." });
		}

	}
}
