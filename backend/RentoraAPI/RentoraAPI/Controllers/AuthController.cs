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

namespace RentoraAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly UserManager<ApplicationUser> userManager;
		private readonly RoleManager<IdentityRole> roleManager; // Dodano RoleManager
		private readonly ITokenRepository tokenRepository;

		// Konstruktor sa RoleManager
		public AuthController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, ITokenRepository tokenRepository)
		{
			this.userManager = userManager;
			this.roleManager = roleManager; // Dodela RoleManager
			this.tokenRepository = tokenRepository;
		}

		// GET api/auth/Users
		[HttpGet]
		[Route("Users")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> GetAllUsers()
		{
			var users = await userManager.Users.ToListAsync();

			if (users == null || !users.Any())
			{
				return NotFound(new { Message = "Nema registrovanih korisnika." });
			}

			var userDtos = new List<UserDto>();

			foreach (var user in users)
			{
				var roles = await userManager.GetRolesAsync(user);
				userDtos.Add(new UserDto
				{
					Id = user.Id,
					Email = user.Email,
					Roles = roles.ToList()
				});
			}

			return Ok(userDtos);
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

		[HttpGet]
		[Route("Users/{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin,User")]
		public async Task<IActionResult> GetUserById(string id)
		{
			var user = await userManager.FindByIdAsync(id);
			if (user == null)
			{
				return NotFound(new { Message = "Korisnik nije pronađen." });
			}

			var roles = await userManager.GetRolesAsync(user);
			var userDto = new UserDto
			{
				Id = user.Id,
				Email = user.Email,
				Roles = roles.ToList() // Dodavanje uloga u DTO
			};

			return Ok(userDto);
		}

		// POST api/auth/Register
		[HttpPost]
		[Route("Register")]
		public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequestDto)
		{
			// Proveri da li su sve uloge validne pre nego što kreiramo korisnika
			if (registerRequestDto.Roles != null && registerRequestDto.Roles.Any())
			{
				foreach (var role in registerRequestDto.Roles)
				{
					if (!await roleManager.RoleExistsAsync(role))
					{
						return BadRequest(new { Message = $"Uloga '{role}' ne postoji. Postoje samo uloge Admin i User" });
					}
				}
			}

			var existingUser = await userManager.FindByEmailAsync(registerRequestDto.Username);
			if (existingUser != null)
			{
				return BadRequest(new { Message = $"Email '{registerRequestDto.Username}' je već zauzet." });
			}

			var identityUser = new ApplicationUser
			{
				UserName = registerRequestDto.Username,
				Email = registerRequestDto.Username,
				FirstName = registerRequestDto.FirstName,
				LastName = registerRequestDto.LastName,
				PhoneNumber = registerRequestDto.PhoneNumber
			};

			var identityResult = await userManager.CreateAsync(identityUser, registerRequestDto.Password);
			if (identityResult.Succeeded)
			{
				// Ako su uloge prosle, sada dodeljujemo uloge
				if (registerRequestDto.Roles != null && registerRequestDto.Roles.Any())
				{
					var roleResult = await userManager.AddToRolesAsync(identityUser, registerRequestDto.Roles);
					if (roleResult.Succeeded)
					{
						return Ok(new { Message = "Korisnik je registrovan! Molimo vas da se prijavite." });
					}
					else
					{
						return BadRequest(new { Message = "Došlo je do greške prilikom dodele uloga." });
					}
				}
				return Ok(new { Message = "Korisnik je registrovan! Molimo vas da se prijavite." });
			}
			else
			{
				return BadRequest(new { Message = "Registracija korisnika nije uspela.", Errors = identityResult.Errors });
			}
		}

		// POST api/auth/Login
		[HttpPost]
		[Route("Login")]
		public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequestDto)
		{
			var user = await userManager.FindByEmailAsync(loginRequestDto.Username);
			if (user != null)
			{
				var checkPasswordResult = await userManager.CheckPasswordAsync(user, loginRequestDto.Password);
				if (checkPasswordResult)
				{
					// Kreiranje tokena
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
		[HttpDelete]
		[Route("Users/{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteUser(string id)
		{
			var user = await userManager.FindByIdAsync(id);
			if (user == null)
			{
				return NotFound(new { Message = "Korisnik nije pronađen." });
			}

			// Brisanje korisnika
			var result = await userManager.DeleteAsync(user);
			if (result.Succeeded)
			{
				return Ok(new { Message = "Korisnik je uspešno obrisan." });
			}

			// Ako brisanje nije uspelo, vraćamo grešku
			return BadRequest(new { Message = "Došlo je do greške prilikom brisanja korisnika.", Errors = result.Errors });
		}

	}
}
