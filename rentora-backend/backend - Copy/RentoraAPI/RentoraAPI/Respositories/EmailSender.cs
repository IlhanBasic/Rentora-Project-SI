using System;
using System.Threading.Tasks;
using RentoraAPI.Models;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using RentoraAPI.Respositories;
namespace RentoraAPI.Services
{
	public class EmailSender : IEmailSender
	{
		private readonly SmtpSettings _smtpSettings;

		public EmailSender(SmtpSettings smtpSettings)
		{
			_smtpSettings = smtpSettings;
		}

		public async Task SendEmailAsync(string email, string subject, string message)
		{
			var mimeMessage = new MimeMessage();
			mimeMessage.From.Add(new MailboxAddress(_smtpSettings.DisplayName, _smtpSettings.FromEmail));
			mimeMessage.To.Add(MailboxAddress.Parse(email));
			mimeMessage.Subject = subject;
			mimeMessage.Body = new TextPart("html") { Text = message };

			using (var client = new SmtpClient())
			{
				try
				{
					// Provera da li je klijent već povezan pre nego što pokušaš da se povežeš ponovo
					if (!client.IsConnected)
					{
						await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
					}

					// Autentifikacija
					await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);

					// Slanje emaila
					await client.SendAsync(mimeMessage);
				}
				catch (Exception ex)
				{
					// Logovanje greške u konzolu
					throw new InvalidOperationException("Failed to send email.", ex);
				}
				finally
				{
					// Uvek se uveri da je konekcija ispravno prekinuta
					if (client.IsConnected)
					{
						await client.DisconnectAsync(true);
					}
				}
			}
		}
	}
}
