using OpenQA.Selenium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RentoraNUnitTesting.Pages
{
	public class RegisterPage
	{
		IWebDriver _driver;
        public RegisterPage(IWebDriver driver)
        {
            _driver = driver;
        }
        public void GoToRegister()
        {
            _driver.FindElement(By.XPath("/html/body/div[3]/nav/div/button[2]")).Click();
        }
        IWebElement firstNameInput => _driver.FindElement(By.Name("FirstName"));
		IWebElement lastNameInput => _driver.FindElement(By.Name("LastName"));
		IWebElement phoneNumberInput => _driver.FindElement(By.Name("PhoneNumber"));
		IWebElement emailInput => _driver.FindElement(By.Name("Username"));
		IWebElement passwordInput => _driver.FindElement(By.Name("PasswordHash"));
		IWebElement confirmPasswordInput => _driver.FindElement(By.Name("ConfirmPassword"));
        IWebElement submitButton => _driver.FindElement(By.XPath("/html/body/div[3]/form/div[7]/button[1]"));

		public void Register(string fName,string lName,string phone, string email, string Password)
        {
            firstNameInput.EnterText(fName);
            lastNameInput.EnterText(lName);
            phoneNumberInput.EnterText(phone);
            emailInput.EnterText(email);
            passwordInput.EnterText(Password);
            confirmPasswordInput.EnterText(Password);
            submitButton.Click();
		}
        
    }
}
