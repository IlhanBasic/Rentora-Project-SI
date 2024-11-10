using System.ComponentModel.DataAnnotations;

namespace RentoraAPI.Models.DTO
{
	public class RegisterRequestDto
	{
		[Required]
		[DataType(DataType.EmailAddress)]
		public string Username { get; set; }

		[Required]
		[DataType(DataType.Password)]
		public string Password { get; set; }

		[Required]
		public string FirstName { get; set; }

		[Required]
		public string LastName { get; set; }

		[Required]
		[DataType(DataType.PhoneNumber)]
		public string PhoneNumber { get; set; }

		public string[] Roles { get; set; }
	}
}
