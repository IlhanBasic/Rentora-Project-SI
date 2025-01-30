using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RentoraNUnitTesting
{
	public static class SeleniumCustomMethods
	{
		public static void Click (this IWebElement locator)
		{
			locator.Click();
		}
		public static void EnterText(this IWebElement locator, string text)
		{
			locator.SendKeys(text);
		}
		public static void SelectDropDownByText(this IWebElement locator,string text)
		{
			SelectElement dropdown = new SelectElement(locator);
			dropdown.SelectByText(text);
		}
	}
}
