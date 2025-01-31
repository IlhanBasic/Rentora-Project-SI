using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RentoraNUnitTesting.Pages
{
	public class CreatingReservationPage
	{
		IWebDriver _driver;
        public CreatingReservationPage(IWebDriver driver)
        {
            _driver = driver;
        }
        SelectElement childSeatSelect => new SelectElement(_driver.FindElement(By.Name("childSeat")));
		SelectElement insuranceSelect => new SelectElement(_driver.FindElement(By.Name("insurance")));
        SelectElement payOpitonSelect => new SelectElement(_driver.FindElement(By.Name("paymentMethod")));
        IWebElement cardNumberInput => _driver.FindElement(By.Name("cardNumber"));
		IWebElement expirtyDateInput => _driver.FindElement(By.Name("expiryDate"));

		IWebElement pinInput => _driver.FindElement(By.Name("pin"));

		IWebElement cvvInput => _driver.FindElement(By.Name("cvv"));

        IWebElement submitButton => _driver.FindElement(By.Id("btn-submit"));

		public void CreateReservationByCreditCard(string childSeat,string insurance,string cardNumber,string pin,string cvv, string date)
        {
            childSeatSelect.SelectByValue(childSeat);
            insuranceSelect.SelectByValue(insurance);
            payOpitonSelect.SelectByValue("card");
            System.Threading.Thread.Sleep(200);
            cardNumberInput.EnterText(cardNumber);
            expirtyDateInput.EnterText(date);
            pinInput.EnterText(pin);
            cvvInput.EnterText(cvv);
            submitButton.Click(); 
        }
        public void CreateReservationByCash(string childSeat, string insurance)
        {
			childSeatSelect.SelectByValue(childSeat);
			insuranceSelect.SelectByValue(insurance);
			payOpitonSelect.SelectByValue("cash");
			System.Threading.Thread.Sleep(200);
			submitButton.Click();
		}
    }
}
