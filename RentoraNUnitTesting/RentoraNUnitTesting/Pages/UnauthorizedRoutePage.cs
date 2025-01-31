using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RentoraNUnitTesting.Pages
{
	public class UnauthorizedRoutePage
	{
		IWebDriver _driver;
        public UnauthorizedRoutePage(IWebDriver driver)
        {
            _driver = driver;
        }
        public void GoToUnauthorizedRoute()
        {
            _driver.Navigate().GoToUrlAsync("https://rentora-project-si.onrender.com/Admin");
        }
    }
}
