using System.ComponentModel.DataAnnotations;

namespace RentoraAPI.Models.DTO
{
	public class CheckEmailRequest
	{
		[Required(ErrorMessage = "Email je obavezan")]
		[DataType(DataType.EmailAddress)]
		public string Email { get; set; }
	}
}
