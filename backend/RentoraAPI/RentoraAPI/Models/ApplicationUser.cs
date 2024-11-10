using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

public class ApplicationUser : IdentityUser
{
	public string FirstName { get; set; }
	public string LastName { get; set; }
	public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
