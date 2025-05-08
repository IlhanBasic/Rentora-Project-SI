namespace RentoraAPI.Models.DTO
{
	public class ResetPasswordDto
	{
		public string Email { get; set; }
		public string PIN { get; set; }
		public string NewPassword { get; set; }
	}
}
