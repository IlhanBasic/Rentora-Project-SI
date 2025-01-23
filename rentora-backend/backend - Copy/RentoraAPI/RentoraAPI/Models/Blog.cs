using System.ComponentModel.DataAnnotations;

namespace RentoraAPI.Models
{
	public enum BlogCategory
	{
		Istorija,
		Saveti,
		Gastronomija,
		Priroda,
		Putovanja
	}

	public class Blog
	{
		public Guid Id { get; set; }
		[Required(ErrorMessage = "Naziv je obavezan.")]
		[StringLength(50, ErrorMessage = "Naziv ne može biti duži od 50 karaktera.")]
		public string Title { get; set; }
		[Required(ErrorMessage = "Sadržaj je obavezan.")]
		[StringLength(100, ErrorMessage = "Sadržaj ne može biti duži od 100 karaktera.")]
		public string Excerpt { get; set; }
		[Required(ErrorMessage = "Kategorija je obavezna.")]
		public BlogCategory Category { get; set; } 
		[Required(ErrorMessage = "Vreme čitanja je obavezno.")]
		public string ReadTime { get; set; }
		[Required(ErrorMessage ="Obaveznan je datum postavljanja")]
		public DateTime Date { get; set; }
		[Required(ErrorMessage ="Mora postojati link do slike")]
		public string ImageUrl { get; set; }
		[Required(ErrorMessage = "Mora postojati link do posta")]
		public string Link { get; set; }
	}
}
