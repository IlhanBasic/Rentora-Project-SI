using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using System;

namespace RentoraNUnitTesting.Pages
{
	public class CreateLocationPage
	{
		private readonly IWebDriver _driver;
		private readonly WebDriverWait _wait;

		public CreateLocationPage(IWebDriver driver)
		{
			_driver = driver;
			_wait = new WebDriverWait(_driver, TimeSpan.FromSeconds(15));
			_driver.Manage().Window.Maximize();
		}

		public void GoToAdminDashboard()
		{
			_wait.Until(d => d.FindElement(By.Id("btn-logged"))).Click();
		}

		public void CreateLocation(string street, string streetNumber, string city, string country, string email, string phoneNumber)
		{
			((IJavaScriptExecutor)_driver).ExecuteScript("window.focus();");

			// Navigate to location creation
			_wait.Until(d => d.FindElement(By.Id("locations"))).Click();
			_wait.Until(d => d.FindElement(By.Id("add-button"))).Click();

			// Fill form
			EnterText(By.Name("street"), street);
			EnterText(By.Name("streetNumber"), streetNumber);
			EnterText(By.Name("email"), email);
			EnterText(By.Name("city"), city);
			EnterText(By.Name("country"), country);
			EnterText(By.Name("phoneNumber"), phoneNumber);

			// Map interaction
			InteractWithMap();

			// Submit
			_wait.Until(d => d.FindElement(By.Id("btn-submit"))).Click();
		}

		private void EnterText(By selector, string text)
		{
			var element = _wait.Until(d => d.FindElement(selector));
			element.Clear();
			element.SendKeys(text);
		}

		private void InteractWithMap()
		{
			var mapContainer = _wait.Until(d => d.FindElement(By.ClassName("ol-viewport")));

			// Center map in view
			((IJavaScriptExecutor)_driver).ExecuteScript(
				"arguments[0].scrollIntoView({behavior: 'auto', block: 'center', inline: 'center'});",
				mapContainer
			);

			// Let map stabilize
			System.Threading.Thread.Sleep(1000);

			// Click near center of visible map area
			ClickOnMap(mapContainer, 33, 22);
		}

		private void ClickOnMap(IWebElement mapElement, int offsetX, int offsetY)
		{
			try
			{
				// Try with standard Selenium click
				new Actions(_driver)
					.MoveToElement(mapElement, offsetX, offsetY)
					.Click()
					.Perform();
			}
			catch (MoveTargetOutOfBoundsException)
			{
				// Fallback to JavaScript click
				((IJavaScriptExecutor)_driver).ExecuteScript(
					"var evt = new MouseEvent('click', {" +
					$"clientX: arguments[0].getBoundingClientRect().left + {offsetX}," +
					$"clientY: arguments[0].getBoundingClientRect().top + {offsetY}," +
					"bubbles: true});" +
					"arguments[0].dispatchEvent(evt);",
					mapElement
				);
			}
		}
	}
}