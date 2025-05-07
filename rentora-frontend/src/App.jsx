import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Error from "./pages/Error.jsx";
import RootLayout from "./pages/Root.jsx";
import Conditions from "./pages/Conditions.jsx";
import About from "./pages/About.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import VehicleDetails from "./pages/VehicleDetails.jsx";
import AuthenticationPage from "./pages/Authentication";
import VehicleLayout from "./pages/VehicleLayout.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import Admin from "./pages/Admin.jsx";
import MyRentals from "./pages/MyRentals.jsx";
import AdminItemDetails from "./pages/AdminItemDetails.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { EmailProvider } from "./context/EmailContext.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import Contact from "./pages/Contact.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <Error />,
      children: [
        { index: true, element: <Home /> },
        // { path: "auth", element: <AuthenticationPage /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "conditions", element: <Conditions /> },
        { path: "about", element: <About /> },
        { path: "my-rentals", element: <MyRentals /> },
        {
          path: "vehicles",
          element: <VehicleLayout />,
          children: [
            { index: true, element: <Vehicles /> },
            { path: ":vehicleId", element: <VehicleDetails /> },
          ],
        },
        { path: "contact", element: <Contact /> },
        { path: "unauthorized", element: <Unauthorized /> },
      ],
    },
    {
      path: "Admin",
      element: <AdminLayout />,
      errorElement: <Error />,
      children: [
        { index: true, element: <Admin /> },
        {
          path: ":section/:id",
          element: <AdminItemDetails />,
        },
      ],
    },
    {
      path: "change-password",
      element: <ChangePassword />,
      errorElement: <Error />,
    },
    {
      path: "reset-password",
      element: <ResetPassword />,
      errorElement: <Error />,
    },
  ]);

  return (
    <>
      <AuthProvider>
        <EmailProvider>
          <RouterProvider router={router} />
        </EmailProvider>
      </AuthProvider>
    </>
  );
}

export default App;
