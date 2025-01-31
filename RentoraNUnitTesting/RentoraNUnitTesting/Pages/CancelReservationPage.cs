using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RentoraNUnitTesting.Pages
{
	public class CancelReservationPage
	{
		IWebDriver _driver;
        public CancelReservationPage(IWebDriver driver)
        {
            _driver = driver;
        }
        IWebElement profileButton => _driver.FindElement(By.Id("btn-logged"));
        IWebElement cancelButton => _driver.FindElement(By.XPath("/html/body/div[3]/div[2]/div/div[2]/button"));
        IWebElement confirmButton => _driver.FindElement(By.Id("yes"));

		public void GoToProfile()
        {
			System.Threading.Thread.Sleep(2000);
			profileButton.Click();
        }
        public void Cancel()
        {
			System.Threading.Thread.Sleep(2000);
			cancelButton.Click();
            System.Threading.Thread.Sleep(2000);
            confirmButton.Click(); 
        }

    }
}
