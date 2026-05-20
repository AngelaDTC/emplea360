import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    const URL_BACKEND = 'https://emplea360-production.up.railway.app';

    // 💾 Estados del Formulario de Registro
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('+54'); // 🇦🇷 Prefijo de Argentina inicial obligatorio

    // 🔄 Estados del Proceso de Verificación OTP
    const [pasoVerificacion, setPasoVerificacion] = useState(false);
    const [codigoIngresado, setCodigoIngresado] = useState('');
    const [bypassCode, setBypassCode] = useState(''); 
    
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // 🚀 PASO 1: Enviar datos iniciales al Servidor
    const handleSolicitarRegistro = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const res = await fetch(`${URL_BACKEND}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre, // Guardamos el nombre en el backend
                    email, 
                    password, 
                    telefono, 
                    rol: 'candidato' 
                })
            });

            const data = await res.json();

            if (res.ok) {
                setPasoVerificacion(true);
                if (data.bypassCode) setBypassCode(data.bypassCode);
            } else {
                setError(data.error || 'Ocurrió un error al procesar el registro.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión con Railway.');
        } finally {
            setCargando(false);
        }
    };

    // 🔐 PASO 2: Confirmar Código OTP y activar en la Base de Datos
    const handleConfirmarVerificacion = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const res = await fetch(`${URL_BACKEND}/api/auth/verify-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: codigoIngresado })
            });

            if (res.ok) {
                alert('¡Cuenta creada y activada con éxito!');
                navigate('/login');
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || 'Código incorrecto.');
            }
        } catch (err) {
            console.error(err);
            setError('Error al procesar la verificación.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                
                {/* LOGO */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ ...logoStyle, backgroundColor: '#10b981', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>+</div>
                    <h1 style={titleStyle}>{pasoVerificacion ? 'Verificá tu Cuenta' : 'Registrarse'}</h1>
                    <p style={subtitleStyle}>
                        {pasoVerificacion ? 'Ingresá el código enviado por WhatsApp' : 'Portal de Talento Emplea360'}
                    </p>
                </div>

                {error && <div style={errorStyle}>⚠️ {error}</div>}

                {/* FORMULARIO PASO 1 */}
                {!pasoVerificacion ? (
                    <form onSubmit={handleSolicitarRegistro} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Nombre Completo</label>
                            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Angela Gómez" style={inputStyle} />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="angela@correo.com" style={inputStyle} />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Número de Celular</label>
                            <input 
                                type="tel" 
                                required 
                                value={telefono} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Bloqueo estricto para que no borren el +54
                                    if (val.startsWith('+54')) setTelefono(val);
                                    else if (val.length < 3) setTelefono('+54');
                                }} 
                                placeholder="+54 9 11 ..." 
                                style={inputStyle} 
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Contraseña</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
                        </div>

                        <button type="submit" disabled={cargando} style={{ ...btnStyle, backgroundColor: '#10b981' }}>
                            {cargando ? 'Enviando código...' : 'Registrarme'}
                        </button>
                    </form>
                ) : (
                    /* FORMULARIO PASO 2 */
                    <form onSubmit={handleConfirmarVerificacion} style={{ textAlign: 'left' }}>
                        {bypassCode && (
                            <div style={infoBoxStyle}>
                                💡 Código de simulación: <strong>{bypassCode}</strong>
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

                <div style={{ marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                        ¿Ya tenés cuenta?{' '}
                        <span onClick={() => navigate('/login')} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 500 }}>Iniciá Sesión</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Estilos Reutilizables (adjuntos abajo en cascada)
