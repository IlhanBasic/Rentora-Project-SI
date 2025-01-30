using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using RentoraNUnitTesting.Models;
using RentoraNUnitTesting.Pages;
using System.Collections.Generic;

namespace RentoraNUnitTesting
{
	[TestFixture]
	public class AllTests
	{
		private IWebDriver _driver;

		[SetUp]
		public void SetUp()
		{
			_driver = new ChromeDriver();
			_driver.Manage().Window.Maximize();
			_driver.Navigate().GoToUrl("https://rentora-project-si.onrender.com/");
		}

		[Test]
		[TestCaseSource(nameof(LoginData))] 
		public void TestLoginPage(LoginModel loginData)
		{

		}

		[Test]
		public void TestChangePasswordPage()
		{

		}
		[Test]
		public void TestRentFormHomePage()
		{

		}
		[Test]
		public void TestChooseCarPage()
		{

		}
		[Test]
		public void TestCreatingReservationPage()
		{

		}
		[Test]
		public void TestFindLocationAndUpdatePage()
		{

		}
		[Test]
		public void TestCreateLocationPage()
		{

		}
		[Test]
		public void TestCancelReservationPage()
		{

		}
		[Test]
		public void TestUnauthorizedRoutePage()
		{

		}
		[Test]
		public void TestDeleteReservationPage()
		{

		}
		[TearDown]
		public void CancelDriver()
		{
			_driver.Close(); 
		}

		public static IEnumerable<LoginModel> LoginData()
		{
			yield return new LoginModel { UserName = "ilhanbasic456@gmail.com", Password = "Admin12345@" };
			yield return new LoginModel { UserName = "memovicsead95@gmail.com", Password = "Admin12345@" };
			yield return new LoginModel { UserName = "ilhanbasic456@gmail.com", Password = "Admin123456@" };
		}
	}
}
