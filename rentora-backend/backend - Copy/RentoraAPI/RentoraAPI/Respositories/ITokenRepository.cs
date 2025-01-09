using Microsoft.AspNetCore.Identity;

namespace RentoraAPI.Respositories
{
	public interface ITokenRepository
	{
		string CreateJWTToken(IdentityUser user, List<string> roles);
	}

}
