﻿namespace RentoraAPI.Models.DTO
{
	public class UserDto
	{
		public string Id { get; set; }
		public string Email { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string PhoneNumber { get; set; }
		public List<string> Roles { get; set; }
	}
}
