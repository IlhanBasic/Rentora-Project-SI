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
					await userManager.DeleteAsync(identityUser);
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
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                padding: 20px;
            }}
            .header {{
                text-align: center;
                background-color: #4CAF50;
                color: white;
                padding: 10px 0;
                font-size: 24px;
                font-weight: bold;
            }}
            .content {{
                margin: 20px 0;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
            }}
            .button {{
                display: block;
                width: 200px;
                margin: 20px auto;
                text-align: center;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                font-weight: bold;
                padding: 10px 15px;
                border-radius: 5px;
            }}
            .button:hover {{
                background-color: #45a049;
            }}
            .footer {{
                text-align: center;
                font-size: 14px;
                color: #666666;
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class='email-container'>
            <div class='header'>Verifikacija Vašeg Profila</div>
            <div class='content'>
                <p>Poštovani {identityUser.FirstName} {identityUser.LastName},</p>
                <p>Hvala vam što ste se registrovali na našu platformu! Kako bismo aktivirali vaš profil, molimo vas da potvrdite svoj email klikom na dugme ispod:</p>
                <a href='{confirmationLink}' class='button'>Verifikujte Svoj Profil</a>
                <p>Ako imate bilo kakva pitanja, slobodno nas kontaktirajte.</p>
                <p>Hvala,</p>
                <p>Vaš tim</p>
            </div>
            <div class='footer'>
                &copy; {DateTime.Now.Year} Vaša Kompanija. Sva prava zadržana.
            </div>
        </div>
    </body>
    </html>");
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
				return new ContentResult
				{
					Content = GenerateHtmlResponse("Korisnik nije pronađen.", "error"),
					ContentType = "text/html"
				};
			}

			var result = await userManager.ConfirmEmailAsync(user, token);
			if (result.Succeeded)
			{
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
