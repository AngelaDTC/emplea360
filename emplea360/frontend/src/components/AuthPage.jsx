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
        onLogin(data.token, data.rol);
        navigate('/dashboard');
      } else {
        // 🚨 CAMBIO AGREGADO: Alerta de rescate por si la API de WhatsApp no está activa o demora
        if (data.bypassCode) {
          alert(`[Modo Desarrollo] Tu código de verificación es: ${data.bypassCode}\n(El mensaje impactará en 30 segundos en tu WhatsApp si el servicio está en línea).`);
        }
        // Abrimos la casilla para poner el código
        setIsVerifyingCode(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };
  // --- BUSCA ESTA SECCIÓN EXACTA EN TU AUTHPAGE.JSX ---
const data = await response.json();

if (isLogin) {
  // 🌟 GUARDAR EL NOMBRE: Guardamos el nombre en la memoria local antes de avanzar
  // Asegúrate de que tu backend envíe "data.nombre" (o el campo correspondiente de la BD)
  if (data.nombre) {
    localStorage.setItem('usuario_nombre', data.nombre);
  } else if (formData.nombre) {
    localStorage.setItem('usuario_nombre', formData.nombre);
  }

  onLogin(data.token, data.rol);
  navigate('/dashboard');
} else {
  // ... resto de tu código de registro actual ...

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
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00458e' }}>Recuperar Contraseña</h2>
          
          {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>Ingresá tus datos para enviarte un código de verificación y el enlace de cambio.</p>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email Vinculado</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono (WhatsApp)</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#00458e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Solicitar Enlace de Cambio
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#00458e' }} onClick={() => setIsForgotPassword(false)}>
            Volver al Inicio de Sesión
          </p>
        </form>
      </div>
    );
  }

  // --- VISTA 3: LOGIN / REGISTRO PRINCIPAL ---
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00458e' }}>
          {isLogin ? 'Iniciar Sesión' : 'Registrarse en Emplea 360'}
        </h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre / Razón Social</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        )}

        {isLogin ? (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico o Teléfono</label>
            <input 
              type="text" 
              name="identifier" 
              placeholder="ejemplo@mail.com o +549..."
              value={formData.identifier} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
            />
          </div>
        ) : (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        )}

        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono (WhatsApp)</label>
            <input 
              type="tel" 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
            />
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña</label>
          <input 
            type={showPassword ? 'text' : 'password'} 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
        </div>

        {!isLogin && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Confirmar Contraseña</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <input 
            type="checkbox" 
            id="togglePassword" 
            checked={showPassword} 
            onChange={() => setShowPassword(!showPassword)} 
            style={{ marginRight: '8px', cursor: 'pointer' }}
          />
          <label htmlFor="togglePassword" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
            Visualizar contraseña
          </label>
        </div>

        {!isLogin && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tipo de Perfil</label>
            <select name="rol" value={formData.rol} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="candidato">Candidato (Busco Trabajo)</option>
              <option value="empresa">Empresa (Busco Talento)</option>
            </select>
          </div>
        )}

        {isLogin && (
          <p 
            style={{ textAlign: 'right', fontSize: '13px', color: '#00458e', cursor: 'pointer', marginTop: '-5px', marginBottom: '20px' }} 
            onClick={() => setIsForgotPassword(true)}
          >
            ¿Olvidaste tu contraseña?
          </p>
        )}

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#00458e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isLogin ? 'Ingresar' : 'Crear Cuenta'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#00458e' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Conéctate'}
        </p>
      </form>
    </div>
  );
}
