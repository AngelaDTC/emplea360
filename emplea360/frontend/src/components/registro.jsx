import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    const URL_BACKEND = 'https://emplea360-production.up.railway.app';

    // Estados del formulario de registro
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('');
    const [nombre, setNombre] = useState('');
    
    // Estados del flujo de verificación
    const [pasoVerificacion, setPasoVerificacion] = useState(false);
    const [codigoIngresado, setCodigoIngresado] = useState('');
    const [bypassCode, setBypassCode] = useState(''); // Muestra el código en pantalla para desarrollo rápido
    
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // PASO 1: Enviar datos y despachar código
    const handleSolicitarRegistro = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const res = await fetch(`${URL_BACKEND}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    telefono, 
                    rol: 'candidato', 
                    nombre 
                })
            });

            const data = await res.json();

            if (res.ok) {
                setPasoVerificacion(true);
                if (data.bypassCode) {
                    setBypassCode(data.bypassCode);
                }
            } else {
                setError(data.error || 'Ocurrió un error al procesar el registro.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    // PASO 2: Confirmar código y activar cuenta en PostgreSQL
    const handleConfirmarVerificacion = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const res = await fetch(`${URL_BACKEND}/api/auth/verify-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    code: codigoIngresado 
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert('¡Cuenta activada con éxito!');
                navigate('/login');
            } else {
                setError(data.error || 'Código incorrecto o expirado.');
            }
        } catch (err) {
            console.error(err);
            setError('Error al procesar la verificación.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            fontFamily: '"Segoe UI", Roboto, sans-serif', padding: '20px', boxSizing: 'border-box'
        }}>
            <div style={{
                width: '100%', maxWidth: '420px', backgroundColor: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '40px',
                borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', textAlign: 'center'
            }}>
                
                {/* BRANDING */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{
                        width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                        fontWeight: 'bold', color: '#fff', margin: '0 auto 12px auto', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                    }}>+</div>
                    <h1 style={{ color: '#f8fafc', margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                        {pasoVerificacion ? 'Verificación' : 'Crear Cuenta'}
                    </h1>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                        {pasoVerificacion ? 'Ingresá el código enviado por WhatsApp' : 'Completá tus datos para el Portal de Talento'}
                    </p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', textAlign: 'left' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* FORMULARIO PASO 1: REGISTRO INICIAL */}
                {!pasoVerificacion ? (
                    <form onSubmit={handleSolicitarRegistro} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>Nombre Completo</label>
                            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Angela Gómez" style={inputStyle} />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>Email corporativo o personal</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="angela@correo.com" style={inputStyle} />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>Número de Celular</label>
                            <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: +541123456789" style={inputStyle} />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>Contraseña</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
                        </div>

                        <button type="submit" disabled={cargando} style={{ ...btnStyle, backgroundColor: '#10b981' }}>
                            {cargando ? 'Despachando código...' : 'Registrarme'}
                        </button>
                    </form>
                ) : (
                    /* FORMULARIO PASO 2: VERIFICACIÓN OTP */
                    <form onSubmit={handleConfirmarVerificacion} style={{ textAlign: 'left' }}>
                        {bypassCode && (
                            <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
                                💡 Código recibido en simulación: <strong>{bypassCode}</strong>
                            </div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>Código de Verificación (6 dígitos)</label>
                            <input type="text" maxLength="6" required value={codigoIngresado} onChange={(e) => setCodigoIngresado(e.target.value)} placeholder="123456" style={{ ...inputStyle, letterSpacing: '4px', textAlign: 'center', fontSize: '20px' }} />
                        </div>

                        <button type="submit" disabled={cargando} style={{ ...btnStyle, backgroundColor: '#3b82f6' }}>
                            {cargando ? 'Verificando...' : 'Confirmar y Activar'}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                        ¿Ya tenés una cuenta?{' '}
                        <span onClick={() => navigate('/login')} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 500 }}>Iniciá Sesión</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155',
    backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
};

const btnStyle = {
    width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'
};
