using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;

namespace RentoraNUnitTesting.Pages
{
	internal class LoginPage
	{
		private readonly IWebDriver driver;
		private readonly WebDriverWait wait;

		public LoginPage(IWebDriver driver)
		{
			this.driver = driver;
			wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
		}

		public void GoToLoginPage()
		{
			driver.FindElement(By.Id("btn-login")).Click();
		}

		private IWebElement email => driver.FindElement(By.Name("Email"));
		private IWebElement password => driver.FindElement(By.Name("PasswordHash"));
		private IWebElement submitButton => driver.FindElement(By.Id("btn-submit"));

		public void Login(string e, string p)
		{
			email.EnterText(e);
			password.EnterText(p);
			submitButton.Click();
		}

		public (bool isExisting, bool isGoodText) IsLoggedIn()
		{
			try
			{
				wait.Until(drv =>
				{
					try
					{
						var element = drv.FindElement(By.Id("btn-logged"));
						return element.Displayed ? element : null;
					}
					catch (NoSuchElementException)
					{
						return null;
					}
				});

				var loggedInButton = driver.FindElement(By.Id("btn-logged"));
				bool isGoodText = loggedInButton.Text.Trim().Contains("Admin Stranica") || loggedInButton.Text.Trim().Contains("Profil");
				return (true, isGoodText);
			}
			catch (WebDriverTimeoutException)
			{
				Console.WriteLine("Dugme za logovanog korisnika nije pronađeno na vreme.");
				return (false, false);
			}
		}

	}
}
