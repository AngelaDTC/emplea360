// frontend/src/components/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', telefono: '', rol: 'candidato', nombre: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Reemplazar con la URL real de tu backend en Railway cuando despliegues
  const API_URL = "http://localhost:5000/api/auth";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/login' : '/register';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Algo salió mal');

      if (isLogin) {
        onLogin(data.token, data.rol);
        navigate('/dashboard');
      } else {
        alert("Registro exitoso. Validación de email y WhatsApp completada.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00458e' }}>{isLogin ? 'Iniciar Sesión' : 'Registrarse en Emplea 360'}</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre / Razón Social</label>
            <input type="text" name="nombre" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input type="email" name="email" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>

        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono (WhatsApp)</label>
            <input type="tel" name="telefono" placeholder="+54 264 XXXXXXX" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña</label>
          <input type="password" name="password" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>

        {!isLogin && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tipo de Perfil</label>
            <select name="rol" onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="candidato">Candidato (Busco Trabajo)</option>
              <option value="empresa">Empresa (Busco Talento)</option>
            </select>
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
          {isLogin ? 'Ingresar' : 'Crear Cuenta'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#00458e' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Conéctate'}
        </p>
      </form>
    </div>
  );
}
