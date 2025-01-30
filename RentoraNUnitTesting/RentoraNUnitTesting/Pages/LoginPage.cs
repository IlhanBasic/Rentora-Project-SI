using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RentoraNUnitTesting.Pages
{
	internal class LoginPage
	{
        private readonly IWebDriver driver;
        public LoginPage(IWebDriver driver)
        {
            this.driver = driver;
		}
		public void GoToLoginPage()
		{
			this.driver.FindElement(By.XPath("/html/body/div[3]/nav/div/button[1]")).Click();
		}
        private IWebElement email => driver.FindElement(By.XPath("/html/body/div[3]/form/div[1]/div/div/input"));
        private IWebElement password => driver.FindElement(By.XPath("/html/body/div[3]/form/div[2]/div/div/input"));
        private IWebElement submitButton => driver.FindElement(By.XPath("/html/body/div[3]/form/div[3]/button[1]"));
        private IWebElement checkButton => driver.FindElement(By.XPath("/html/body/div[3]/nav/div/button[1]"));
        public void Login(string e,string p)
        {
            email.EnterText(e);
			password.EnterText(p);
			submitButton.Click();
        }
		public (bool isExisting,bool isGoodText) IsLoggedIn()
		{
			try
			{
				return (checkButton.Displayed, checkButton.Text.Trim().Contains("Prijavi Se"));
			}
			catch (WebDriverTimeoutException)
			{
				Console.WriteLine("Element nije pronađen u vremenskom okviru.");
				return (false,false);
			}
		}


	}
}
