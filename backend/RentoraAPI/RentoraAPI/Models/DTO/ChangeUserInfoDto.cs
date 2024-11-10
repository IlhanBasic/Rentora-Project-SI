namespace RentoraAPI.Models.DTO
{
	public class ChangeUserInfoDto
	{
		public string NewEmail { get; set; }
		public string NewPassword { get; set; }
		public List<string> Roles { get; set; } 
	}
}
