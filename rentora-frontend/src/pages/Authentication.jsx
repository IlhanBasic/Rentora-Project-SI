import { useNavigate, useSearchParams } from 'react-router-dom';
import FormAuth from '../components/FormAuth.jsx';
import Header from '../components/Header.jsx';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function AuthenticationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  
  // State for the mode (Login or Register)
  const [mode, setMode] = useState('Login');

  // Effect to handle redirection if user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      if (window.history.length > 2) {
        navigate(-1, { replace: true }); 
      } else {
        navigate("/", { replace: true }); 
      }
    }
  }, [isLoggedIn, navigate]);

  // Effect to update mode based on search params
  useEffect(() => {
    const modeFromParams = searchParams.get('mode');
    if (modeFromParams === "Register" || modeFromParams === "Login") {
      setMode(modeFromParams);
    } else {
      setMode('Login');
      navigate('/auth?mode=Login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <>
      <Header title={mode === "Login" ? "Prijava" : "Registracija"} />
        <FormAuth type={mode} />
    </>
  );
}
