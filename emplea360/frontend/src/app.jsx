import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardCandidato from './components/DashboardCandidato';
import DashboardEmpresa from './components/DashboardEmpresa';

const API_URL = "https://emplea360-production-517a.up.railway.app"; 
// Cambia lo de adentro por la URL exacta que copiaste de Railway

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [rol, setRol] = useState(localStorage.getItem('rol') || '');

  const loginSession = (token, rol) => {
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol);
    setToken(token);
    setRol(rol);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage onLogin={loginSession} />} />
        
        <Route 
          path="/dashboard" 
          element={
            token ? (
              rol === 'candidato' ? <DashboardCandidato /> : <DashboardEmpresa />
            ) : (
              <Navigate to="/auth" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
