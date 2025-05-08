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
using Microsoft.AspNetCore.Identity.Data;

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
		[HttpPost]
		[Route("CreateUser")]
		public async Task<IActionResult> CreateUser([FromBody] RegisterRequestDto registerRequestDto)
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
						return BadRequest(new { Message = $"Uloga '{role}' ne postoji. Dozvoljene uloge su: Admin,User,Guest." });
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
				PhoneNumber = registerRequestDto.PhoneNumber,
				EmailConfirmed = true 
			};

			try
			{
				var identityResult = await userManager.CreateAsync(identityUser, registerRequestDto.Password);
				if (!identityResult.Succeeded)
				{
					await userManager.DeleteAsync(identityUser);
					return BadRequest(new
					{
						Message = "Registracija korisnika nije uspela.",
						Errors = identityResult.Errors.Select(e => e.Description)
					});
				}

				if (registerRequestDto.Roles != null && registerRequestDto.Roles.Any())
				{
					var roleResult = await userManager.AddToRolesAsync(identityUser, registerRequestDto.Roles);
					if (!roleResult.Succeeded)
					{
						await userManager.DeleteAsync(identityUser);
						return BadRequest(new { Message = "Došlo je do greške prilikom dodele uloga." });
					}
				}

				return Ok(new { Message = "Korisnik je uspešno kreiran i email je automatski potvrđen." });
			}
			catch (Exception e)
			{
				return NotFound();
			}
		}

		// POST api/auth/Register NOVI
		[HttpPost]
		[Route("Register")]
		public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequestDto)
		{
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
						return BadRequest(new { Message = $"Uloga '{role}' ne postoji. Dozvoljene uloge su: Admin,User,Guest." });
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
					await userManager.DeleteAsync(identityUser);
					return BadRequest(new
					{
						Message = "Registracija korisnika nije uspela.",
						Errors = identityResult.Errors.Select(e => e.Description)
					});
				}

				if (registerRequestDto.Roles != null && registerRequestDto.Roles.Any())
				{
					var roleResult = await userManager.AddToRolesAsync(identityUser, registerRequestDto.Roles);
					if (!roleResult.Succeeded)
					{
						await userManager.DeleteAsync(identityUser);
						return BadRequest(new { Message = "Došlo je do greške prilikom dodele uloga." });
					}
				}

				var token = await userManager.GenerateEmailConfirmationTokenAsync(identityUser);

				var confirmationLink = Url.Action(nameof(ConfirmEmail), "Auth",
					new { userId = identityUser.Id, token }, Request.Scheme);

				await emailSender.SendEmailAsync(identityUser.Email, "Verifikacija profila",
				$@"
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
            <h1>Verifikacija Vašeg Profila</h1>
        </div>
        <div class='content'>
            <div class='greeting'>
                Poštovani {identityUser.FirstName} {identityUser.LastName},
            </div>
            <div class='message'>
                Hvala vam što ste se registrovali na našu platformu! Da bismo osigurali sigurnost vašeg naloga, potrebno je da verifikujete svoju email adresu.
            </div>
            <p>Molimo vas da kliknete na dugme ispod kako biste potvrdili svoj email:</p>
            <center>
                <a href='{confirmationLink}' class='button'>Verifikujte Svoj Profil</a>
            </center>
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
				return Ok(new { Message = "Korisnik je registrovan! Molimo vas da potvrdite svoj email." });
			}
			catch (Exception ex)
			{
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
				return new ContentResult
				{
					Content = GenerateHtmlResponse("Korisnik nije pronađen.", "error"),
					ContentType = "text/html"
				};
			}

			var result = await userManager.ConfirmEmailAsync(user, token);
			if (result.Succeeded)
			{
				await userManager.RemoveFromRolesAsync(user, ["Guest"]);
				var roleResult = await userManager.AddToRolesAsync(user, ["User"]);
				if (!roleResult.Succeeded)
				{
					await userManager.DeleteAsync(user);
					return BadRequest(new { Message = "Došlo je do greške prilikom dodele uloga." });
				}
				user.EmailConfirmed = true;
				await userManager.UpdateAsync(user);
				return new ContentResult
				{
					Content = GenerateHtmlResponse("Email je uspešno potvrđen!", "success"),
					ContentType = "text/html"
				};
			}

			return new ContentResult
			{
				Content = GenerateHtmlResponse("Došlo je do greške prilikom potvrde email-a.", "error"),
				ContentType = "text/html"
			};
		}

		private string GenerateHtmlResponse(string message, string status)
		{
			var successColor = "#4CAF50";
			var errorColor = "#f44336";

			return $@"
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Email Confirmation</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
            }}
            .container {{
                text-align: center;
                max-width: 500px;
                margin: 20px;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .message {{
                font-size: 20px;
                font-weight: bold;
                color: {(status == "success" ? successColor : errorColor)};
                margin-bottom: 20px;
            }}
            .icon {{
                font-size: 50px;
                margin-bottom: 20px;
                color: {(status == "success" ? successColor : errorColor)};
            }}
            .footer {{
                font-size: 14px;
                color: #666666;
                margin-top: 20px;
            }}
            a {{
                color: {(status == "success" ? successColor : errorColor)};
                text-decoration: none;
                font-weight: bold;
            }}
            a:hover {{
                text-decoration: underline;
            }}
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='icon'>{(status == "success" ? "✔" : "✖")}</div>
            <div class='message'>{message}</div>
            <div class='footer'>
                <p>Vratite se na <a href='https://rentora-project-si.onrender.com/auth?mode=Login'>početnu stranicu</a>.</p>
            </div>
        </div>
    </body>
    </html>";
		}

		// POST api/auth/Login
		[HttpPost]
		[Route("Login")]
		public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequestDto)
		{
			var user = await userManager.FindByEmailAsync(loginRequestDto.Username);
			if (user != null)
			{
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
