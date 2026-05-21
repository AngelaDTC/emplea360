import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage({ onLogin }) {
    const navigate = useNavigate();
    
    // 🌐 URL REAL Y CORREGIDA DE TU SERVIDOR
    const URL_BACKEND = 'https://emplea360-production-517a.up.railway.app';

    // 🔄 Estado de la pestaña: 'login' o 'registro'
    const [modo, setModo] = useState('login'); 
    
    // 💾 Estados comunes y de carga
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // 🔒 Estados del Formulario de Login
    const [identifier, setIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // 📝 Estados del Formulario de Registro (Comunes)
    const [nombre, setNombre] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [telefono, setTelefono] = useState('+54'); 
    const [rolRegistro, setRolRegistro] = useState('candidato'); // 🏢 'candidato' o 'empresa'

    // 🔄 Estados de la verificación OTP por WhatsApp
    const [pasoVerificacion, setPasoVerificacion] = useState(false);
    const [codigoIngresado, setCodigoIngresado] = useState('');
    const [bypassCode, setBypassCode] = useState('');

    // 🚀 EJECUTAR INICIO DE SESIÓN
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const res = await fetch(`${URL_BACKEND}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password: loginPassword })
            });

            const data = await res.json();

            if (res.ok) {
                onLogin(data.token, data.rol, data.nombre || data.nombre_completo);
                navigate('/dashboard');
            } else {
                setError(data.mensaje || 'Credenciales incorrectas.');
            }
        } catch (err) {
            setError('Error al conectar con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    // 🚀 REGISTRO PASO 1: Enviar datos a Railway asignando el rol dinámico
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (regPassword !== confirmPassword) {
            setError('Las contraseñas ingresadas no coinciden. Verificá los campos.');
            return;
        }

        setCargando(true);

        try {
            const res = await fetch(`${URL_BACKEND}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre, 
                    email: regEmail, 
                    password: regPassword, 
                    telefono, 
                    rol: rolRegistro // 👈 Envía dinámicamente 'candidato' o 'empresa'
                })
            });

            const data = await res.json();

            if (res.ok) {
                setPasoVerificacion(true);
                if (data.bypassCode) setBypassCode(data.bypassCode);
            } else {
                setError(data.error || 'Error al procesar el registro.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de comunicación con el servidor. Revisá la conexión.');
        } finally {
            setCargando(false);
        }
    };

    // 🔐 REGISTRO PASO 2: Confirmar token OTP
    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const res = await fetch(`${URL_BACKEND}/api/auth/verify-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: regEmail, code: codigoIngresado })
            });

            if (res.ok) {
                alert('¡Cuenta activada con éxito! Ya podés ingresar.');
                setPasoVerificacion(false);
                setConfirmPassword('');
                setRegPassword('');
                setNombre('');
                setTelefono('+54');
                setModo('login');
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || 'Código incorrecto o vencido.');
            }
        } catch (err) {
            setError('Error al procesar la verificación.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                
                {/* BRANDING */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                        ...logoStyle, 
                        backgroundColor: modo === 'login' ? '#3b82f6' : '#10b981',
                        boxShadow: modo === 'login' ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 0 20px rgba(16, 185, 129, 0.4)'
                    }}>
                        {modo === 'login' ? '360' : '+'}
                    </div>
                    <h1 style={titleStyle}>
                        {pasoVerificacion ? 'Verificá tu Celular' : (modo === 'login' ? 'Emplea360' : 'Crear Cuenta')}
                    </h1>
                    <p style={subtitleStyle}>
                        {pasoVerificacion 
                            ? 'Ingresá el token de WhatsApp' 
                            : (modo === 'login' ? 'Ingresá a tu espacio de talento' : `Súmate como ${rolRegistro}`)}
                    </p>
                </div>

                {/* SELECTOR DE ROL (Solo visible en modo registro y fuera de la verificación OTP) */}
                {modo === 'registro' && !pasoVerificacion && (
                    <div style={roleSelectorContainer}>
                        <button 
                            type="button"
                            onClick={() => setRolRegistro('candidato')}
                            style={rolRegistro === 'candidato' ? roleBtnActiveLeft : roleBtnInactiveLeft}
                        >
                            Soy Candidato
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRolRegistro('empresa')}
                            style={rolRegistro === 'empresa' ? roleBtnActiveRight : roleBtnInactiveRight}
                        >
                            Soy Empresa
                        </button>
                    </div>
                )}

                {error && <div style={errorStyle}>⚠️ {error}</div>}

                {/* LOGIN */}
                {modo === 'login' && (
                    <form onSubmit={handleLoginSubmit} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Email o Celular</label>
                            <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="correo@ejemplo.com" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Contraseña</label>
                            <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
                        </div>
                        <button type="submit" disabled={cargando} style={{ ...btnStyle, backgroundColor: '#3b82f6' }}>
                            {cargando ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                )}

                {/* REGISTRO DATA */}
                {modo === 'registro' && !pasoVerificacion && (
                    <form onSubmit={handleRegisterSubmit} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>
                                {rolRegistro === 'candidato' ? 'Nombre Completo' : 'Nombre de la Empresa'}
                            </label>
                            <input 
                                type="text" 
                                required 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                placeholder={rolRegistro === 'candidato' ? 'Juan Pérez' : 'Tech Solutions S.A.'} 
                                style={inputStyle} 
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Email {rolRegistro === 'empresa' && 'Corporativo'}</label>
                            <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="contacto@empresa.com" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Número de Celular</label>
                            <input 
                                type="tel" 
                                required 
                                value={telefono} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.startsWith('+54')) setTelefono(val);
                                    else if (val.length < 3) setTelefono('+54');
                                }} 
                                placeholder="+54 9 11 ..." 
                                style={inputStyle} 
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Contraseña</label>
                            <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Confirmar Contraseña</label>
                            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repetí tu contraseña" style={inputStyle} />
                        </div>
                        <button type="submit" disabled={cargando} style={{ ...btnStyle, backgroundColor: '#10b981' }}>
                            {cargando ? 'Enviando código...' : 'Registrar Empresa / Cuenta'}
                        </button>
                    </form>
                )}

                {/* REGISTRO OTP */}
                {modo === 'registro' && pasoVerificacion && (
                    <form onSubmit={handleVerifySubmit} style={{ textAlign: 'left' }}>
                        {bypassCode && (
                            <div style={infoBoxStyle}>
                                💡 Código de desarrollo recibido: <strong>{bypassCode}</strong>
                            </div>
                        )}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Código de Verificación (6 dígitos)</label>
                            <input type="text" maxLength="6" required value={codigoIngresado} onChange={(e) => setCodigoIngresado(e.target.value)} placeholder="123456" style={{ ...inputStyle, letterSpacing: '4px', textAlign: 'center', fontSize: '20px' }} />
                        </div>
                        <button type="submit" disabled={cargando} style={{ ...btnStyle, backgroundColor: '#3b82f6' }}>
                            {cargando ? 'Verificando...' : 'Confirmar y Activar'}
                        </button>
                    </form>
                )}

                {/* SELECTOR DE MODO */}
                <div style={{ marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                    {modo === 'login' ? (
                        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                            ¿No tenes cuenta?{' '}
                            <span onClick={() => { setModo('registro'); setError(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 500 }}>
                                Registrate
                            </span>
                        </p>
                    ) : (
                        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                            ¿Ya tenés una cuenta?{' '}
                            <span onClick={() => { setModo('login'); setPasoVerificacion(false); setError(''); }} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 500 }}>
                                Iniciá Sesión
                            </span>
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}

// Estilos encapsulados existentes
const containerStyle = { display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', fontFamily: '"Segoe UI", Roboto, sans-serif', padding: '20px', boxSizing: 'border-box' };
const cardStyle = { width: '100%', maxWidth: '420px', backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '35px 40px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', textAlign: 'center' };
const logoStyle = { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: '0 auto 12px auto' };
const titleStyle = { color: '#f8fafc', margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' };
const subtitleStyle = { margin: 0, fontSize: '14px', color: '#94a3b8' };
const labelStyle = { display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600 };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' };
const errorStyle = { backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', textAlign: 'left' };
const infoBoxStyle = { backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' };

// Nuevos estilos para el Selector de Roles alineados al diseño UI Dark
const roleSelectorContainer = { display: 'flex', width: '100%', backgroundColor: '#0f172a', borderRadius: '10px', padding: '4px', boxSizing: 'border-box', marginBottom: '20px', border: '1px solid #334155' };
const roleBtnBase = { flex: 1, padding: '10px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' };
const roleBtnActiveLeft = { ...roleBtnBase, backgroundColor: '#10b981', color: '#fff', borderRadius: '8px 0 0 8px' };
const roleBtnInactiveLeft = { ...roleBtnBase, backgroundColor: 'transparent', color: '#94a3b8', borderRadius: '8px 0 0 8px' };
const roleBtnActiveRight = { ...roleBtnBase, backgroundColor: '#10b981', color: '#fff', borderRadius: '0 8px 8px 0' };
const roleBtnInactiveRight = { ...roleBtnBase, backgroundColor: 'transparent', color: '#94a3b8', borderRadius: '0 8px 8px 0' };
