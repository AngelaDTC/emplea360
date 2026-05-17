import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1>EMPLEA 360</h1>
      <p style={{fontSize: '1.2rem', maxWidth: '600px'}}>
        El ecosistema inteligente de conexión y formación de talento comercial en San Juan. 
        Evaluamos compatibilidad real mediante inteligencia predictiva.
      </p>
      <div style={{marginTop: '20px', display: 'flex', gap: '15px'}}>
        <button className="btn-primary" onClick={() => navigate('/auth')}>Ingresar a la Plataforma</button>
      </div>
    </div>
  );
}
