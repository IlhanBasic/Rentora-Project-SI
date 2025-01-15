using System;
using System.Threading.Tasks;
using RentoraAPI.Models;
using MimeKit;
using MimeKit.Utils;
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
			var mimeMessage = new MimeMessage
			{
				MessageId = MimeUtils.GenerateMessageId(),
			};

			mimeMessage.From.Add(new MailboxAddress(_smtpSettings.DisplayName, _smtpSettings.FromEmail));
			mimeMessage.To.Add(MailboxAddress.Parse(email));
			mimeMessage.Subject = subject;
			mimeMessage.Headers.Add("X-Mailer", "Rentora Email Service");
			mimeMessage.Body = new TextPart("html")
			{
				Text = message,
				
			};

			using (var client = new SmtpClient())
			{
				try
				{
					if (!client.IsConnected)
					{
						await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
					}

					client.CheckCertificateRevocation = true;
					await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);

					await client.SendAsync(mimeMessage);
				}
				catch (Exception ex)
				{
					Console.WriteLine($"Email sending failed: {ex.Message}");
					Console.WriteLine($"StackTrace: {ex.StackTrace}");
					throw new InvalidOperationException("Failed to send email.", ex);
				}
				finally
				{
					if (client.IsConnected)
					{
						await client.DisconnectAsync(true);
					}
				}
			}
		}
	}
}
