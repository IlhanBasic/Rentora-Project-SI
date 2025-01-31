using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;

namespace RentoraNUnitTesting.Pages
{
	public class DeleteReservationPage
	{
		private readonly IWebDriver _driver;
		private readonly WebDriverWait _wait;

		public DeleteReservationPage(IWebDriver driver)
		{
			_driver = driver;
			_wait = new WebDriverWait(_driver, TimeSpan.FromSeconds(10));
			_driver.Manage().Window.Maximize();
		}
		public void GoToAdminDashboard()
		{
			_wait.Until(d => d.FindElement(By.Id("btn-logged"))).Click();
		}

		public void DeleteFirstReservation()
		{
			_wait.Until(driver => driver.FindElement(By.Id("reservations"))).Click();
			var firstRow = _wait.Until(driver => driver.FindElement(By.CssSelector(".table-row:first-child")));
			var deleteButton = _driver.FindElement(By.XPath("/html/body/div[3]/div/div/div[4]/div[2]/button"));
			_wait.Until(driver => deleteButton.Displayed && deleteButton.Enabled);
			deleteButton.Click();
			var confirmButton = _wait.Until(driver => driver.FindElement(By.XPath("//button[@id='yes']")));
			confirmButton.Click();
		}

	}
}