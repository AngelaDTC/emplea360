import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Reiniciar estados al cambiar de vista
  useEffect(() => {
    setError('');
    setShowPassword(false);
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
      // Estructuramos el body según corresponda a cada flujo
      let bodyData = {};
      if (isLogin) {
        bodyData = {
          identifier: formData.identifier, // Envía el correo o celular ingresado
          password: formData.password
        };
      } else {
        bodyData = formData;
      }

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
        alert("Código de verificación enviado. Por favor revise su correo o WhatsApp para completar el registro.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // --- FLUJO INDEPENDIENTE PARA OLVIDÓ SU CONTRASEÑA ---
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

      alert("Código de recuperación y enlace de restablecimiento enviados a tus canales validados.");
      setIsForgotPassword(false);
      setIsLogin(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- RENDERIZADO DE VISTA: ¿OLVIDASTE TU CONTRASEÑA? ---
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

  // --- RENDERIZADO DE VISTAS PRINCIPALES: LOGIN / REGISTRO ---
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00458e' }}>
          {isLogin ? 'Iniciar Sesión' : 'Registrarse en Emplea 360'}
        </h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

        {/* REGISTRO: Nombre o Razón Social */}
        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre / Razón Social</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        )}

        {/* LOGIN COMPUESTO: Ingreso por Correo o Celular */}
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
          // REGISTRO: Email nativo
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        )}

        {/* REGISTRO: Teléfono Nativo */}
        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono (WhatsApp)</label>
            <input 
              type="tel" 
              name="telefono" 
              value={formData.telefono} 
              placeholder="XXXXXXX (Siete dígitos)" 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
            />
          </div>
        )}

        {/* CAMPO: Contraseña principal */}
        <div style={{ marginBottom: '15px', position: 'relative' }}>
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

        {/* REGISTRO: Segunda contraseña (Confirmación) */}
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

        {/* CONTROL: Visualizar Contraseñas */}
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

        {/* REGISTRO: Selección de Perfil */}
        {!isLogin && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tipo de Perfil</label>
            <select name="rol" value={formData.rol} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="candidato">Candidato (Busco Trabajo)</option>
              <option value="empresa">Empresa (Busco Talento)</option>
            </select>
          </div>
        )}

        {/* LOGIN: Opción ¿Olvidaste tu contraseña? */}
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
