import React, { useState } from 'react';

export default function AuthPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);

    // Estado del formulario unificado
    const [formData, setFormData] = useState({
        identifier: '',
        email: '',
        password: '',
        telefono: '',
        rol: 'candidato',
        nombre: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const backendUrl = process.env.REACT_APP_API_URL || 'https://tu-backend-railway.up.railway.app';
            const respuesta = await fetch(`${backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: formData.identifier,
                    password: formData.password
                })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                localStorage.setItem('token', datos.token);
                localStorage.setItem('rol', datos.rol);
                
                if (datos.nombre) {
                    localStorage.setItem('usuario_nombre', datos.nombre);
                }

                if (onLogin) onLogin(datos.token, datos.rol);
                window.location.href = '/dashboard';
            } else {
                alert(datos.error || 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error("Error en login:", error.message);
        }
    };

    return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: '#0b1329', minHeight: '100vh' }}>
            <h2>Emplea 360 - Autenticación</h2>
            {isLogin ? (
                <form onSubmit={handleLoginSubmit}>
                    <div>
                        <label>Email o Celular:</label><br />
                        <input 
                            type="text" 
                            name="identifier" 
                            value={formData.identifier} 
                            onChange={handleChange} 
                            required 
                            style={{ color: 'black', margin: '5px 0' }}
                        />
                    </div>
                    <div>
                        <label>Contraseña:</label><br />
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            style={{ color: 'black', margin: '5px 0' }}
                        />
                    </div>
                    <button type="submit" style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}>
                        Ingresar
                    </button>
                </form>
            ) : (
                <div>Sección de Registro / Recuperación</div>
            )}
            <div style={{ marginTop: '15px' }}>
                <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>
                    {isLogin ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Logueate'}
                </button>
            </div>
        </div>
    );
}
