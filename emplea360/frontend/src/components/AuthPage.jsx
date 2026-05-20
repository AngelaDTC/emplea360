import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
    const navigate = useNavigate();

    // 🌐 URL de tu backend en Railway
    const URL_BACKEND = 'https://emplea360-production.up.railway.app';

    // 💾 ESTADOS PARA EL FORMULARIO
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // 🔐 MANEJADOR DEL INICIO DE SESIÓN
    const handleLogin = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const res = await fetch(`${URL_BACKEND}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            if (res.ok) {
                const data = await res.json();
                
                // 🌟 FIX DE SEGURIDAD: Guardamos desde 'data' para evitar el token vacío
                localStorage.setItem('token', data.token);
                localStorage.setItem('rol', data.rol);
                localStorage.setItem('usuario_nombre', data.nombre || 'Candidato');

                // Redirección limpia al Dashboard premium
                navigate('/dashboard');
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.mensaje || 'Credenciales incorrectas. Intentá de nuevo.');
            }
        } catch (err) {
            console.error("Error en login:", err);
            setError('No se pudo conectar con el servidor. Revisá tu red.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            {/* CARD CENTRAL */}
            <div style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '40px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                textAlign: 'center'
            }}>
                
                {/* LOGO / BRANDING */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        fontWeight: 'bold',
                        color: '#fff',
                        margin: '0 auto 16px auto',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                    }}>
                        360
                    </div>
                    <h1 style={{ color: '#f8fafc', margin: '0 0 8px 0', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                        Emplea360
                    </h1>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                        Ingresá a tu portal de talento
                    </p>
                </div>

                {/* MENSAJE DE ERROR */}
                {error && (
                    <div style={{
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        color: '#f43f5e',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '20px',
                        textAlign: 'left',
                        fontWeight: 500
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* FORMULARIO */}
                <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                    
                    {/* CAMPO: IDENTIFICADOR */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px' }}>
                            Email o Celular
                        </label>
                        <input 
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: '#f8fafc',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#334155';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* CAMPO: CONTRASEÑA */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px' }}>
                            Contraseña
                        </label>
                        <input 
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: '#f8fafc',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#334155';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* BOTÓN INGRESAR */}
                    <button 
                        type="submit"
                        disabled={cargando}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: cargando ? '#475569' : '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: cargando ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: cargando ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => { if(!cargando) e.currentTarget.style.backgroundColor = '#2563eb'; }}
                        onMouseLeave={(e) => { if(!cargando) e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                    >
                        {cargando ? 'Iniciando sesión...' : 'Ingresar'}
                    </button>
                </form>

                {/* ENLACE SECUNDARIO */}
                <div style={{ marginTop: '28px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                        ¿No tenés cuenta?{' '}
                        <span 
                            onClick={() => navigate('/registro')} 
                            style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Registrate
                        </span>
                    </p>
                </div>

            </div>
        </div>
    );
}
