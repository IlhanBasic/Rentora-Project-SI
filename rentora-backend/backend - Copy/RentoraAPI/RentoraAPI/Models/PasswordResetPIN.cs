namespace RentoraAPI.Models
{
	public class PasswordResetPIN
	{
		public int Id { get; set; }
		public string Email { get; set; }
		public string PIN { get; set; } 
		public DateTime CreatedAt { get; set; }
		public bool IsUsed { get; set; }
	}
}
