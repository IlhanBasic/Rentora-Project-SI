using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;

namespace RentoraNUnitTesting.Pages
{
	public class ChangePasswordPage
	{
		private readonly IWebDriver driver;
		private readonly WebDriverWait wait;

		public ChangePasswordPage(IWebDriver driver)
		{
			this.driver = driver;
			wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
		}
		public void GoToChangePasswordPage()
		{
			//driver.Navigate().GoToUrlAsync("http://localhost:5173/change-password");
			driver.Navigate().GoToUrlAsync("https://rentora-project-si.onrender.com/change-password");
		}
		private IWebElement GetOldPasswordField() => driver.FindElement(By.Id("old-password"));
		private IWebElement GetNewPasswordField() => driver.FindElement(By.Id("new-password"));
		private IWebElement GetConfirmPasswordField() => driver.FindElement(By.Id("again-password"));
		private IWebElement GetSubmitButton() => driver.FindElement(By.Id("btn-submit"));

		public void ChangePassword(string oldPass, string newPass, string confirmPass)
		{
			GetOldPasswordField().EnterText(oldPass);
			GetNewPasswordField().EnterText(newPass);
			GetConfirmPasswordField().EnterText(confirmPass);
			GetSubmitButton().Click();
		}

		public bool IsChanged()
		{
			try
			{
				// Čekamo da se prikaže potvrda
				var confirmationElement = wait.Until(drv =>
				{
					try
					{
						var element = drv.FindElement(By.Id("confirmation-text"));
						return element.Displayed ? element : null;
					}
					catch (NoSuchElementException)
					{
						return null;
					}
				});

				// Ako je pronađen element, vraćamo true
				return confirmationElement != null;
			}
			catch (WebDriverTimeoutException)
			{
				// Ako istekne vreme čekanja, vraćamo false
				return false;
			}
		}
	}
}
