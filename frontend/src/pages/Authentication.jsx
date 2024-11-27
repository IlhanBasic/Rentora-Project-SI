import { useNavigate, useSearchParams } from 'react-router-dom';
import FormAuth from '../components/FormAuth.jsx';
import Header from '../components/Header.jsx';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function AuthenticationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn) {
      if (window.history.length > 2) {
        navigate(-1, { replace: true }); 
      } else {
        navigate("/", { replace: true }); 
      }
    }
  }, [isLoggedIn, navigate]);

  if (mode !== "Login" && mode !== "Register") {
    throw new Error("Greška: Nevažeći režim.");
  }

  return (
    <>
      <Header title={mode==="Login" ? "Prijava" : "Registracija"} />
      <div className='center-div'>
        <FormAuth type={mode} />
      </div>
    </>
  );
}
