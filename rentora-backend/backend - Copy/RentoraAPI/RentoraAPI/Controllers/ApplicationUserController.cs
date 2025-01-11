using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RentoraAPI.Models.DTO;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RentoraAPI.Controllers
{
    [Route("api/[controller]")]
	[ApiController]
	public class ApplicationUserController : ControllerBase
	{
		private readonly UserManager<ApplicationUser> userManager;

		public ApplicationUserController(UserManager<ApplicationUser> userManager)
		{
			this.userManager = userManager;
		}
		[HttpPatch]
		[Route("{id}/ChangePassword")]
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

		// GET api/users
		[HttpGet]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> GetAllUsers()
		{
			var users = await userManager.Users.ToListAsync();

			if (users == null || !users.Any())
			{
				return NotFound(new { Message = "Nema registrovanih korisnika." });
			}

			var userDtos = users.Select(user => new UserDto
			{
				Id = user.Id,
				FirstName = user.FirstName,
				LastName = user.LastName,
				PhoneNumber = user.PhoneNumber,
				Email = user.Email,
				Roles = userManager.GetRolesAsync(user).Result.ToList()
			}).ToList();

			return Ok(userDtos);
		}

		// GET api/users/{id}
		[HttpGet("{id}")]
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
				FirstName = user.FirstName,
				LastName = user.LastName,
				PhoneNumber = user.PhoneNumber,
				Email = user.Email,
				Roles = roles.ToList()
			};

			return Ok(userDto);
		}

		// DELETE api/users/{id}
		[HttpDelete("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteUser(string id)
		{
			var user = await userManager.FindByIdAsync(id);
			if (user == null)
			{
				return NotFound(new { Message = "Korisnik nije pronađen." });
			}

			var result = await userManager.DeleteAsync(user);
			if (result.Succeeded)
			{
				return Ok(new { Message = "Korisnik je uspešno obrisan." });
			}

			return BadRequest(new { Message = "Došlo je do greške prilikom brisanja korisnika.", Errors = result.Errors });
		}
		// PUT api/users/{id}
		[HttpPut("{id}")]
		[Authorize(AuthenticationSchemes = "Bearer")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
		{
			// Proveravamo da li korisnik postoji
			var user = await userManager.FindByIdAsync(id);
			if (user == null)
			{
				return NotFound(new { Message = "Korisnik nije pronađen." });
			}

			// Ažuriramo email (ako je dostavljen)
			if (!string.IsNullOrEmpty(updateUserDto.Email) && updateUserDto.Email != user.Email)
			{
				var emailExists = await userManager.FindByEmailAsync(updateUserDto.Email);
				if (emailExists != null)
				{
					return BadRequest(new { Message = "Email adresa je već u upotrebi." });
				}
				user.Email = updateUserDto.Email;
			}

			// Ažuriramo uloge (ako su dostavljene)
			if (updateUserDto.Roles != null && updateUserDto.Roles.Any())
			{
				var currentRoles = await userManager.GetRolesAsync(user);
				var result = await userManager.RemoveFromRolesAsync(user, currentRoles);
				if (!result.Succeeded)
				{
					return BadRequest(new { Message = "Došlo je do greške prilikom uklanjanja starih uloga." });
				}

				result = await userManager.AddToRolesAsync(user, updateUserDto.Roles);
				if (!result.Succeeded)
				{
					return BadRequest(new { Message = "Došlo je do greške prilikom dodele novih uloga." });
				}
			}

			// Spremamo promene u bazi
			var updateResult = await userManager.UpdateAsync(user);
			if (updateResult.Succeeded)
			{
				var roles = await userManager.GetRolesAsync(user);
				var userDto = new UserDto
				{
					Id = user.Id,
					Email = user.Email,
					Roles = roles.ToList()
				};
				return Ok(userDto);  // Vraćamo ažurirane informacije o korisniku
			}

			return BadRequest(new { Message = "Došlo je do greške prilikom ažuriranja korisnika.", Errors = updateResult.Errors });
		}

	}
}
