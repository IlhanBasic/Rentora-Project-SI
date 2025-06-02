using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using RentoraNUnitTesting.Models;
using RentoraNUnitTesting.Pages;

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
			//_driver.Navigate().GoToUrl("http://localhost:5173/");
			_driver.Navigate().GoToUrl("https://rentora-project-si.onrender.com/");

		}

		[Test]
		[TestCaseSource(nameof(LoginData))]
		public void TestLoginPage(LoginModel loginData)
		{
			LoginPage login = new LoginPage(_driver);
			login.GoToLoginPage();
			login.Login(loginData.UserName, loginData.Password);
			System.Threading.Thread.Sleep(3000);
			var check = login.IsLoggedIn();
			Assert.IsTrue(check.isExisting && check.isGoodText, "Greska oko provere prijave");
		}


		[Test]
		public void TestChangePasswordPage()
		{
			LoginPage login = new LoginPage(_driver);
			login.GoToLoginPage();
			login.Login("ilhanbasic456@gmail.com", "Admin12345@");
			var check = login.IsLoggedIn();
			Assert.IsTrue(check.isExisting, "Korisnik nije ulogovan nakon uspešnog logovanja.");
			Assert.IsTrue(check.isGoodText, "Tekst na dugmetu nije odgovarajući.");
			if (check.isExisting && check.isGoodText)
			{
				ChangePasswordPage changePasswordPage = new ChangePasswordPage(_driver);
				changePasswordPage.GoToChangePasswordPage();
				changePasswordPage.ChangePassword("Admin12345@", "Admin123456@", "Admin123456@");
				System.Threading.Thread.Sleep(1000);

				var checkChange = changePasswordPage.IsChanged();
				Assert.IsTrue(checkChange, "Nije promenjena šifra");
			}
			else
			{
				Assert.Fail("Login nije uspeo sa datim podacima.");
			}
		}

		[Test]
		public void TestRentFormHomePage()
		{
			RentFormHomePage rentForm = new RentFormHomePage(_driver);
			System.Threading.Thread.Sleep(2000);
			rentForm.SubmitForm("3fa85f64-5717-4562-b3fc-2c963f66afa6", "8d6a745d-62b5-4503-9b74-c1a72d0423a1", "5/5/2025", "6/5/2025", "13:00", "13:00");
			System.Threading.Thread.Sleep(1000);
		}
		[Test]
		public void TestChooseCarPage()
		{
			LoginPage login = new LoginPage(_driver);
			login.GoToLoginPage();
			login.Login("memovicsead95@gmail.com", "Admin12345@");
			System.Threading.Thread.Sleep(2000);
			ChooseCarPage chooseCar = new ChooseCarPage(_driver);
			chooseCar.GoToVehicles();
			System.Threading.Thread.Sleep(1000);
			chooseCar.ChooseCar("4ba15f74-9825-4121-b9f5-8d5fae8d13be", "Mercedes","Limuzina");
			System.Threading.Thread.Sleep(1000);
		}
		[Test]
		public void TestCreatingReservationPage()
		{
			LoginPage login = new LoginPage(_driver);
			login.GoToLoginPage();
			login.Login("memovicsead95@gmail.com", "Admin12345@");
			System.Threading.Thread.Sleep(3000); ChooseCarPage chooseCar = new ChooseCarPage(_driver);
			chooseCar.GoToVehicles();
			System.Threading.Thread.Sleep(1000);
			chooseCar.ChooseCar("4ba15f74-9825-4121-b9f5-8d5fae8d13be", "Mercedes", "Limuzina");
			System.Threading.Thread.Sleep(3000);
			CreatingReservationPage creatingReservationPage = new CreatingReservationPage(_driver);
			creatingReservationPage.CreateReservationByCreditCard("jedno","premium","4242424242424242","3333","3333","12/27");
			System.Threading.Thread.Sleep(1000);
		}
		[Test]
		public void TestRegisterPage()
		{
			RegisterPage registerPage = new RegisterPage(_driver);
			registerPage.GoToRegister();
			registerPage.Register("Adnan", "Jusovic", "0631245670", "adojusovic@gmail.com", "Admin12345@");
			System.Threading.Thread.Sleep(1000);
		}
		[Test]
		public void TestCancelReservationPage()
		{
			LoginPage login = new LoginPage(_driver);
			login.GoToLoginPage();
			login.Login("memovicsead95@gmail.com", "Admin12345@");
			System.Threading.Thread.Sleep(1000);
			CancelReservationPage cancelReservationPage = new CancelReservationPage(_driver);
			cancelReservationPage.GoToProfile();
			cancelReservationPage.Cancel();
			System.Threading.Thread.Sleep(1000);
		}
		[Test]
		public void TestUnauthorizedRoutePage()
		{
			LoginPage login = new LoginPage(_driver);
			login.GoToLoginPage();
			login.Login("memovicsead95@gmail.com", "Admin12345@");
			System.Threading.Thread.Sleep(2000);
			UnauthorizedRoutePage unauthorizedRoutePage = new UnauthorizedRoutePage(_driver);	
			unauthorizedRoutePage.GoToUnauthorizedRoute();
			System.Threading.Thread.Sleep(1000);
		}
		[Test]
		public void TestDeleteReservationPage()
		{
			LoginPage login = new LoginPage(_driver);
			login.GoToLoginPage();
			login.Login("ilhanbasic456@gmail.com", "Admin12345@");
			System.Threading.Thread.Sleep(2000);
			DeleteReservationPage deleteReservationPage = new DeleteReservationPage(_driver);
			deleteReservationPage.GoToAdminDashboard();
			deleteReservationPage.DeleteFirstReservation();
			System.Threading.Thread.Sleep(400);
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
		}
	}
}
