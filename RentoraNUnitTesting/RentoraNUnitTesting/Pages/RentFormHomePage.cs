using OpenQA.Selenium;
using OpenQA.Selenium.DevTools.V130.Cast;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RentoraNUnitTesting.Pages
{
	public class RentFormHomePage
	{
		IWebDriver _driver;
        public RentFormHomePage(IWebDriver driver)
        {
            _driver = driver ;
        }
        SelectElement startLocation => new SelectElement(_driver.FindElement(By.Name("startLocation")));
        SelectElement endLocation => new SelectElement(_driver.FindElement(By.Name("returnLocation")));
        IWebElement startDate => _driver.FindElement(By.Name("startDate"));
        IWebElement endDate => _driver.FindElement(By.Name("returnDate"));
		IWebElement startTime => _driver.FindElement(By.Name("startTime"));
		IWebElement endTime => _driver.FindElement(By.Name("returnTime"));
        IWebElement submitButton => _driver.FindElement(By.Id("btn-submit"));
        public void SubmitForm(string startL,string endL,string startD,string endD,string startT,string endT)
        {
            startLocation.SelectByValue(startL);
            endLocation.SelectByValue(endL);
            startDate.EnterText(startD);
            endDate.EnterText(endD);
            startTime.EnterText(startT);
            endTime.EnterText(endT);
            submitButton.Click();
        }

	}
}
