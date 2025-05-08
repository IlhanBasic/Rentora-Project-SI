using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentoraAPI.Data;
using RentoraAPI.Models;
using RentoraAPI.Models.DTO;

namespace RentoraAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ApplicationUserController : ControllerBase
	{
		private readonly UserManager<ApplicationUser> userManager;
		private readonly RentoraDBContext context;
		private readonly Respositories.IEmailSender emailSender;
		public ApplicationUserController(UserManager<ApplicationUser> userManager, RentoraDBContext _context, Respositories.IEmailSender emailSender)
		{
			this.userManager = userManager;
			this.context = _context;
			this.emailSender = emailSender;
		}
		[HttpPost("forgot-password")]
		public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
		{
			var user = await userManager.FindByEmailAsync(model.Email);
			if (user == null)
			{
				return BadRequest(new { Message = "Korisnik ne postoji u bazi !" });
			}

			var token = new Random().Next(100000, 999999).ToString();
			var resetToken = new PasswordResetPIN
			{
				Email = model.Email,
				PIN = token,
				CreatedAt = DateTime.UtcNow,
				IsUsed = false
			};
			context.PasswordResetPIN.Add(resetToken);
			await context.SaveChangesAsync();

			// Pošalji email
			emailSender.SendEmailAsync(model.Email, "Restartovanje lozinke", $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Verifikacija Profila</title>
    <style>
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }}
        .header {{
            text-align: center;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            padding: 25px 20px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 26px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px;
            color: #2c3e50;
        }}
        .greeting {{
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }}
        .button {{
            display: inline-block;
            width: auto;
            min-width: 200px;
            margin: 25px 0;
            text-align: center;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            text-decoration: none;
            font-weight: 600;
            padding: 14px 28px;
            border-radius: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(33, 150, 243, 0.2);
        }}
        .button:hover {{
            background: linear-gradient(135deg, #1976D2, #1565C0);
            transform: translateY(-1px);
            box-shadow: 0 6px 8px rgba(33, 150, 243, 0.3);
        }}
        .message {{
            background-color: #f8f9fa;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #eee;
        }}
        .signature {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }}
        @media (max-width: 600px) {{
            body {{
                padding: 10px;
            }}
            .content {{
                padding: 20px;
            }}
            .button {{
                width: 100%;
                box-sizing: border-box;
            }}
        }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <h1>Restartovanje zaboravljene lozinke</h1>
        </div>
        <div class='content'>
            <div class='greeting'>
                Poštovani,
            </div>
            <div class='message'>
                Vaš pin za promenu lozinke je {token}
            </div>
            <p>Ako niste vi kreirali ovaj nalog, možete ignorisati ovu poruku.</p>
            <div class='signature'>
                <p>Srdačan pozdrav,</p>
                <p><strong>Rentora tim za podršku</strong></p>
            </div>
        </div>
        <div class='footer'>
            &copy; {DateTime.Now.Year} Rentora | Sva prava zadržana
        </div>
    </div>
</body>
</html>");

			return Ok();
		}
		[HttpPost("reset-password")]
		public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
		{
			var resetToken = await context.PasswordResetPIN
				.FirstOrDefaultAsync(t =>
					t.Email == model.Email &&
					t.PIN == model.PIN &&
					!t.IsUsed &&
					t.CreatedAt > DateTime.UtcNow.AddMinutes(-15));

			if (resetToken == null)
			{
				return BadRequest(new { Message = "Pogrešan ili istekao PIN." });
			}

			var user = await userManager.FindByEmailAsync(model.Email);
			if (user == null)
			{
				return BadRequest( new { Message = "Korisnik nije pronađen." });
			}

			// Resetuj lozinku
			var token = await userManager.GeneratePasswordResetTokenAsync(user);
			var result = await userManager.ResetPasswordAsync(user, token, model.NewPassword);

			if (!result.Succeeded)
			{
				return BadRequest(result.Errors);
			}

			// Oznaci token kao iskorišćen
			resetToken.IsUsed = true;
			await context.SaveChangesAsync();

			return Ok();
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
