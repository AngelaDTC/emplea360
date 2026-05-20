import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
    const navigate = useNavigate();
    const URL_BACKEND = 'https://emplea360-production.up.railway.app';

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

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

            const data = await res.json();

            if (res.ok) {
                // 🌟 Guardamos todo lo que necesita el Dashboard de forma limpia
                localStorage.setItem('token', data.token);
                localStorage.setItem('rol', data.rol || 'candidato');
                
                // Prioridad al nombre real que viene de la BD, sino usa el respaldo string
                const nombreAGuardar = data.nombre || data.nombre_completo || 'Candidato';
                localStorage.setItem('usuario_nombre', nombreAGuardar);

                navigate('/dashboard');
            } else {
                setError(data.mensaje || 'Credenciales inválidas.');
            }
        } catch (err) {
            console.error(err);
            setError('Error al conectar con Railway.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ ...logoStyle, backgroundColor: '#3b82f6', boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>360</div>
                    <h1 style={titleStyle}>Emplea360</h1>
                    <p style={subtitleStyle}>Ingresá a tu espacio de trabajo</p>
                </div>

                {error && <div style={errorStyle}>⚠️ {error}</div>}

                <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Email o Celular</label>
                        <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="correo@ejemplo.com" style={inputStyle} />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>Contraseña</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
                    </div>

                    <button type="submit" disabled={cargando} style={{ ...btnStyle, backgroundColor: '#3b82f6' }}>
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                        ¿No tenés cuenta?{' '}
                        <span onClick={() => navigate('/registro')} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 500 }}>Registrate</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

// --- 🎨 OBJETOS DE ESTILOS CSS-IN-JS (Idénticos para ambos archivos) ---
const containerStyle = { display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', fontFamily: '"Segoe UI", Roboto, sans-serif', padding: '20px', boxSizing: 'border-box' };
const cardStyle = { width: '100%', maxWidth: '420px', backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', textAlign: 'center' };
const logoStyle = { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', color: '#fff', margin: '0 auto 12px auto' };
const titleStyle = { color: '#f8fafc', margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' };
const subtitleStyle = { margin: 0, fontSize: '14px', color: '#94a3b8' };
const labelStyle = { display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600 };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' };
const errorStyle = { backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', textAlign: 'left' };
const infoBoxStyle = { backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' };
