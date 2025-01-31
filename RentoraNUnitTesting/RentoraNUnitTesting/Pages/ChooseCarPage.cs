using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RentoraNUnitTesting.Pages
{
	public class ChooseCarPage
	{
        IWebDriver _driver;
        public ChooseCarPage(IWebDriver driver)
        {
            _driver = driver;
        }
        public void GoToVehicles()
        {
            _driver.FindElement(By.Id("vehicles")).Click();
        }
        SelectElement location => new SelectElement(_driver.FindElement(By.Id("available-vehicles-by-locations")));
		SelectElement brand => new SelectElement(_driver.FindElement(By.Id("Brend")));
		SelectElement carType => new SelectElement(_driver.FindElement(By.Id("Tip")));
        IWebElement applyButton => _driver.FindElement(By.ClassName("apply-button"));
        IWebElement reserveButton => _driver.FindElement(By.XPath("/html/body/div[3]/div[3]/div/button"));

		public void ChooseCar(string l,string b,string t)
        {
            location.SelectByValue(l);
            brand.SelectByText(b);
            carType.SelectByText(t);
            applyButton.Click();
            System.Threading.Thread.Sleep(4000);
            reserveButton.Click();
        }
    }
}
