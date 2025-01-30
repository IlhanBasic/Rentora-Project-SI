using OpenQA.Selenium;

namespace RentoraNUnitTesting.Pages
{
	public class ChangePasswordPage
	{
		private IWebDriver driver;
		public ChangePasswordPage(IWebDriver driver)
		{
			this.driver = driver;
			Task.Delay(3000);
			this.driver.Navigate().GoToUrl("https://rentora-project-si.onrender.com/change-password");
		}
		IWebElement oldPassword => driver.FindElement(By.XPath("/html/body/div[3]/div/form/div[1]/div/input"));
		IWebElement newPassword => driver.FindElement(By.XPath("/html/body/div[3]/div/form/div[2]/div/input"));
		IWebElement confirmPassword => driver.FindElement(By.XPath("/html/body/div[3]/div/form/div[3]/div/input"));
		IWebElement submitButton => driver.FindElement(By.ClassName("btn-submit"));
		IWebElement confirmationText => driver.FindElement(By.ClassName("center"));
		public void ChangePassword(string oldPass, string newPass, string confirmPass)
		{
			oldPassword.EnterText(oldPass);
			newPassword.EnterText(newPass);
			confirmPassword.EnterText(confirmPass);
			submitButton.Click();
		}
		public bool isChanged()
		{
			return confirmationText.Displayed;
		}
	}
}
