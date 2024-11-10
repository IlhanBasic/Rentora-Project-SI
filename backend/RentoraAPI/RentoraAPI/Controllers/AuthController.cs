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
		private readonly ITokenRepository tokenRepository;

		public AuthController(UserManager<ApplicationUser> userManager, ITokenRepository tokenRepository)
		{
			this.userManager = userManager;
			this.tokenRepository = tokenRepository;
		}
		// GET api/auth/Users
		[HttpGet]
		[Route("Users")]
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

		[HttpPut("Users/{id}")]
		// [Authorize(Roles = "Admin")]
		public async Task<IActionResult> ChangeUserInfo(string id, [FromBody] UserDto userDto)
		{
			// Pronađi korisnika po ID-u
			var user = await userManager.FindByIdAsync(id);
			if (user == null)
			{
				return NotFound(new { Message = "Korisnik nije pronađen." });
			}

			// Ažuriraj email (username) korisnika
			if (!string.IsNullOrEmpty(userDto.Email) && userDto.Email != user.Email)
			{
				var existingUser = await userManager.FindByEmailAsync(userDto.Email);
				if (existingUser != null)
				{
					return BadRequest(new { Message = $"Email '{userDto.Email}' je već zauzet." });
				}

				user.Email = userDto.Email;
				user.UserName = userDto.Email;
			}

			// Ažuriraj uloge
			if (userDto.Roles != null && userDto.Roles.Any())
			{
				var currentRoles = await userManager.GetRolesAsync(user);
				var roleResult = await userManager.RemoveFromRolesAsync(user, currentRoles); // Ukloni trenutne uloge
				if (!roleResult.Succeeded)
				{
					return BadRequest(new { Message = "Neuspešno uklanjanje trenutnih uloga.", Errors = roleResult.Errors });
				}

				roleResult = await userManager.AddToRolesAsync(user, userDto.Roles); // Dodaj nove uloge
				if (!roleResult.Succeeded)
				{
					return BadRequest(new { Message = "Neuspešno dodeljivanje novih uloga.", Errors = roleResult.Errors });
				}
			}

			// Sačuvaj promene
			var identityResult = await userManager.UpdateAsync(user);
			if (!identityResult.Succeeded)
			{
				return BadRequest(new { Message = "Greška prilikom ažuriranja korisnika.", Errors = identityResult.Errors });
			}

			return Ok(new { Message = "Informacije o korisniku su uspešno ažurirane." });
		}

		[HttpGet]
		[Route("Users/{id}")]
		public async Task<IActionResult> GetUserById(string id)
		{
			var user = await userManager.FindByIdAsync(id);
			if (user == null)
			{
				return NotFound(new { Message = "Korisnik nije pronađen." });
			}

			var roles = await userManager.GetRolesAsync(user); // Dobijanje uloga korisnika
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
				if (registerRequestDto.Roles != null && registerRequestDto.Roles.Any())
				{
					var roleResult = await userManager.AddToRolesAsync(identityUser, registerRequestDto.Roles);
					if (roleResult.Succeeded)
					{
						return Ok(new { Message = "Korisnik je registrovan! Molimo vas da se prijavite." });
					}
					else
					{
						return BadRequest(new { Message = "Neuspešno dodeljivanje uloga.", Errors = roleResult.Errors });
					}
				}
				return Ok(new { Message = "Korisnik je registrovan bez uloga! Molimo vas da se prijavite." });
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

		[HttpDelete("Users/{id}")]
		// [Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteUser(string id)
		{
			// Pronađi korisnika po ID-u
			var user = await userManager.FindByIdAsync(id);
			if (user == null)
			{
				return NotFound(new { Message = "Korisnik nije pronađen." });
			}

			// Obriši korisnika
			var result = await userManager.DeleteAsync(user);
			if (!result.Succeeded)
			{
				return BadRequest(new { Message = "Greška prilikom brisanja korisnika.", Errors = result.Errors });
			}

			return Ok(new { Message = "Korisnik je uspešno obrisan." });
		}

		// DELETE api/auth/DeleteReaders
		[HttpDelete]
		[Route("DeleteReaders")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteReaders()
		{
			var users = userManager.Users.ToList();
			var readers = new List<ApplicationUser>(); 
			var failedDeletions = new List<string>();

			foreach (var user in users)
			{
				var roles = await userManager.GetRolesAsync(user);
				if (roles.Contains("User"))
				{
					readers.Add((ApplicationUser)user); 
				}
			}

			if (readers.Count == 0)
			{
				return NotFound(new { Message = "Nema korisnika sa ulogom 'User'." });
			}

			foreach (var user in readers)
			{
				var identityResult = await userManager.DeleteAsync(user);
				if (!identityResult.Succeeded)
				{
					failedDeletions.Add(user.Email);
				}
			}

			if (failedDeletions.Count > 0)
			{
				return BadRequest(new { Message = "Greška prilikom brisanja sledećih korisnika:", FailedUsers = failedDeletions });
			}

			return Ok(new { Message = "Svi korisnici sa ulogom 'User' su uspešno obrisani." });
		}

		// DELETE api/auth/DeleteUser
		[HttpDelete]
		[Route("DeleteUser")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteUser([FromBody] CheckEmailRequest request)
		{
			if (string.IsNullOrEmpty(request.Email))
			{
				return BadRequest(new { Message = "Email je obavezan." });
			}

			var user = await userManager.FindByEmailAsync(request.Email);
			if (user == null)
			{
				return NotFound(new { Message = "Korisnik sa datim emailom ne postoji." });
			}

			var identityResult = await userManager.DeleteAsync(user);
			if (!identityResult.Succeeded)
			{
				return BadRequest(new { Message = "Greška prilikom brisanja korisnika.", Errors = identityResult.Errors });
			}

			return Ok(new { Message = "Korisnik je uspešno obrisan." });
		}
	}
}