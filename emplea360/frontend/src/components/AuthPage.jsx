import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false); // Nueva pantalla para verificar registro
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado del formulario unificado
  const [formData, setFormData] = useState({
    identifier: '', // Se usa para Email o Celular en el Login
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '+549264',
    rol: 'candidato',
    nombre: ''
  });

  const [verificationCode, setVerificationCode] = useState(''); // Estado para el código de registro
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Reiniciar estados al cambiar de vista
  useEffect(() => {
    setError('');
    setShowPassword(false);
    setVerificationCode('');
    setIsVerifyingCode(false);
    setFormData({
      identifier: '',
      email: '',
      password: '',
      confirmPassword: '',
      telefono: '+549264',
      rol: 'candidato',
      nombre: ''
    });
  }, [isLogin, isForgotPassword]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FLUJO PRINCIPAL: LOGIN / REGISTRO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalUrl = `https://emplea360-production-517a.up.railway.app/api/auth/${isLogin ? 'login' : 'register'}`;

    // --- VALIDACIONES DE REGISTRO ---
    if (!isLogin && !isForgotPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    try {
      let bodyData = isLogin ? { identifier: formData.identifier, password: formData.password } : formData;

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error en el servidor (${response.status}).`);
      }

      const data = await response.json();

      if (isLogin) {
        // 🌟 GUARDAR EL NOMBRE EN LOCALSTORAGE
        if (data.nombre) {
          localStorage.setItem('usuario_nombre', data.nombre);
        } else if (formData.nombre) {
          localStorage.setItem('usuario_nombre', formData.nombre);
        }

        onLogin(data.token, data.rol);
        navigate('/dashboard');
      } else {
        // Si el registro fue exitoso, pasamos a la pantalla de verificación de código
        alert("Código de verificación enviado. Por favor verifica tu cuenta.");
        setIsVerifyingCode(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // --- FLUJO PARA CONFIRMAR EL CÓDIGO DE REGISTRO ---
  const handleVerifyCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('https://emplea360-production-517a.up.railway.app/api/auth/verify-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: verificationCode }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Código incorrecto o expirado.');
      }

      alert("¡Cuenta verificada con éxito! Ya puedes iniciar sesión.");
      setIsVerifyingCode(false);
      setIsLogin(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- FLUJO PARA OLVIDÓ SU CONTRASEÑA ---
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('https://emplea360-production-517a.up.railway.app/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, telefono: formData.telefono }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No se pudo procesar la solicitud.');
      }

      const data = await response.json();
      if (data.bypassCode) {
        alert(`[Modo Desarrollo] Código de recuperación: ${data.bypassCode}`);
      } else {
        alert("Código de recuperación enviado. Por favor, revisa tus canales.");
      }

      setIsForgotPassword(false);
      setIsLogin(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- VISTA 1: PANTALLA INTERMEDIA DE VERIFICACIÓN DE CÓDIGO ---
  if (isVerifyingCode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <form onSubmit={handleVerifyCodeSubmit} style={{ background: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00458e' }}>Confirmar Cuenta</h2>
          
          {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
            Ingresá el código de 6 dígitos que enviamos a tu Correo / WhatsApp para activar tu perfil.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Código de Verificación</label>
            <input 
              type="text" 
              maxLength="6"
              placeholder="Ej: 123456"
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }} 
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#00458e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Verificar y Activar
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#64748b', fontSize: '13px' }} onClick={() => setIsVerifyingCode(false)}>
            Cancelar y volver
          </p>
        </form>
      </div>
    );
  }

  // --- VISTA 2: ¿OLVIDASTE TU CONTRASEÑA? ---
  if (isForgotPassword) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <form onSubmit={handleForgotPasswordSubmit} style={{ background: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00458e' }}>Recuper
