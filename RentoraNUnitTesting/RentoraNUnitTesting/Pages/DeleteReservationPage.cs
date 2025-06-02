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
			RemoveAdminOverlay();
			_wait.Until(driver => driver.FindElement(By.Id("reservations"))).Click();
			var firstRow = _wait.Until(driver => driver.FindElement(By.CssSelector(".table-row:first-child")));
			var deleteButton = _driver.FindElement(By.XPath("/html/body/div[3]/div/div[2]/div[2]/div/div[1]/div[2]/div/button"));
			_wait.Until(driver => deleteButton.Displayed && deleteButton.Enabled);
			deleteButton.Click();
			var confirmButton = _wait.Until(driver => driver.FindElement(By.XPath("//button[@id='yes']")));
			confirmButton.Click();
		}
		private void RemoveAdminOverlay()
		{
			try
			{
				// Nađi overlay sa klasom 'admin-overlay active'
				var overlay = _wait.Until(d =>
				{
					var element = d.FindElement(By.CssSelector(".admin-overlay.active"));
					return element.Displayed ? element : null;
				});

				if (overlay != null)
				{
					overlay.Click();  // Klik na overlay
									  // Ili klik negde drugde ako je overlay neklikabilan:
									  // ((IJavaScriptExecutor)_driver).ExecuteScript("document.body.click();");

					// Sačekaj da overlay nestane
					_wait.Until(d => !d.FindElement(By.CssSelector(".admin-overlay.active")).Displayed);
				}
			}
			catch (WebDriverTimeoutException)
			{
				// Overlay se nije pojavio ili je nestao - ignoriši
			}
			catch (NoSuchElementException)
			{
				// Overlay nije prisutan - ignoriši
			}
		}

	}
}