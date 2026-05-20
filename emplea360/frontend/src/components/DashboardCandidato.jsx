import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
    const navigate = useNavigate();

    // 🌐 URL de tu backend en Railway
    const URL_BACKEND = 'https://emplea360-production.up.railway.app';

    // 💾 DECLARACIÓN DE ESTADOS LIMPIOS
    const [activeTab, setActiveTab] = useState('perfil');
    const [tieneCambiosSinGuardar, setTieneCambiosSinGuardar] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [perfil, setPerfil] = useState({
        perfil_candidato: '',
        carta_presentacion: ''
    });

    // 🌟 Nombre del usuario con lectura directa inicial de localStorage
    const [nombreUsuario, setNombreUsuario] = useState(() => {
        return localStorage.getItem('usuario_nombre') || 'Candidato';
    });

    // 🔄 EFECTO COMPLETO PARA TRAER EL NOMBRE Y LOS DATOS DE LA BASE DE DATOS
    useEffect(() => {
        const nombreLocal = localStorage.getItem('usuario_nombre');
        if (nombreLocal && nombreLocal !== 'Candidato') {
            setNombreUsuario(nombreLocal);
        }

        const cargarDatosDesdeBD = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const respuesta = await fetch(`${URL_BACKEND}/api/candidato/perfil`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    
                    const nombreReal = datos.nombre || datos.nombre_completo;
                    if (nombreReal && nombreReal.trim() !== "") {
                        setNombreUsuario(nombreReal);
                        localStorage.setItem('usuario_nombre', nombreReal);
                    }

                    setPerfil({
                        perfil_candidato: datos.perfil_candidato || '',
                        carta_presentacion: datos.carta_presentacion || ''
                    });
                } else if (respuesta.status === 403) {
                    console.error("Token inválido o vencido (403). Redirigiendo a Login...");
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuario_nombre');
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error al sincronizar con Railway:", error);
            }
        };

        cargarDatosDesdeBD();
    }, [navigate, URL_BACKEND]);

    // 📝 MANEJADOR PARA GUARDAR CAMBIOS
    const handleGuardarPerfil = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(`${URL_BACKEND}/api/candidato/perfil`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(perfil)
            });

            if (respuesta.ok) {
                alert("¡Perfil guardado con éxito!");
                setTieneCambiosSinGuardar(false);
            } else {
                alert("Hubo un problema al guardar los datos.");
            }
        } catch (error) {
            console.error("Error al guardar perfil:", error);
        } finally {
            setGuardando(false);
        }
    };

    // 🚪 CERRAR SESIÓN
    const handleCerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('usuario_nombre');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#f8fafc' }}>
            
            {/* 📊 BARRA LATERAL ESTILO GLASSMORPHISM / DARK PREMIUM */}
            <aside style={{ width: '280px', backgroundColor: '#0f172a', color: '#fff', padding: '30px 24px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(15, 23, 42, 0.08)', zIndex: 10 }}>
                
                {/* BRANDING */}
                <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>360</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: '#f8fafc' }}>Emplea360</h2>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Talent Portal</span>
                    </div>
                </div>

                {/* TARJETA DE USUARIO */}
                <div style={{ padding: '16px', backgroundColor: '#1e293b', borderRadius: '12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #334155' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                        {nombreUsuario.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Candidato Activo</p>
                        <h4 style={{ margin: 0, fontSize: '14px', color: '#f1f5f9', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombreUsuario}</h4>
                    </div>
                </div>

                {/* NAVEGACIÓN */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <button 
                        onClick={() => setActiveTab('perfil')}
                        style={{ width: '100%', padding: '12px 16px', textAlign: 'left', backgroundColor: activeTab === 'perfil' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', color: activeTab === 'perfil' ? '#3b82f6' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s ease' }}
                    >
                        <span style={{ fontSize: '18px' }}>👤</span> Mi Perfil Profesional
                    </button>
                </nav>

                {/* BOTÓN SALIR */}
                <button 
                    onClick={handleCerrarSesion}
                    style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span>🚪</span> Cerrar Sesión
                </button>
            </aside>

            {/* 🖥️ CUERPO PRINCIPAL */}
            <main style={{ flex: 1, padding: '48px 60px', overflowY: 'auto' }}>
                
                {/* TOPBAR INTERNA */}
                <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: '#0f172a', margin: '0 0 4px 0', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>Tu Perfil Profesional</h1>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Mantené tus datos actualizados para destacar ante las empresas.</p>
                    </div>
                    {tieneCambiosSinGuardar && (
                        <div style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 600, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(217, 119, 6, 0.05)' }}>
                            <span>⚠️</span> Cambios sin sincronizar
                        </div>
                    )}
                </header>

                {/* CONTENEDOR CENTRAL FORMULARIO */}
                <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02), 0 4px 6px -4px rgba(0,0,0,0.02)' }}>
                    <form onSubmit={handleGuardarPerfil}>
                        
                        {/* TEXTAREA 1 */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#334155', fontSize: '14px' }}>
                                Resumen Profesional
                            </label>
                            <textarea 
                                value={perfil.perfil_candidato}
                                onChange={(e) => {
                                    setPerfil({ ...perfil, perfil_candidato: e.target.value });
                                    setTieneCambiosSinGuardar(true);
                                }}
                                placeholder="Breve resumen de tu trayectoria, especialidades y tus mayores fortalezas..."
                                style={{ width: '100%', minHeight: '140px', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', fontFamily: 'inherit', color: '#334155', backgroundColor: '#f8fafc', transition: 'border-color 0.2s', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                            />
                        </div>

                        {/* TEXTAREA 2 */}
                        <div style={{ marginBottom: '36px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#334155', fontSize: '14px' }}>
                                Carta de Presentación
                            </label>
                            <textarea 
                                value={perfil.carta_presentacion}
                                onChange={(e) => {
                                    setPerfil({ ...perfil, carta_presentacion: e.target.value });
                                    setTieneCambiosSinGuardar(true);
                                }}
                                placeholder="Escribí un mensaje directo para los reclutadores explicando por qué sos el candidato ideal..."
                                style={{ width: '100%', minHeight: '180px', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', fontFamily: 'inherit', color: '#334155', backgroundColor: '#f8fafc', transition: 'border-color 0.2s', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                            />
                        </div>

                        {/* BOTÓN ACCIÓN */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                type="submit" 
                                disabled={guardando}
                                style={{ padding: '14px 32px', backgroundColor: guardando ? '#94a3b8' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: guardando ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', boxShadow: guardando ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.25)' }}
                                onMouseEnter={(e) => { if(!guardando) e.currentTarget.style.backgroundColor = '#2563eb'; }}
                                onMouseLeave={(e) => { if(!guardando) e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                            >
                                {guardando ? '⚡ Guardando...' : '💾 Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

        </div>
    );
}
