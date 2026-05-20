import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
    const navigate = useNavigate();

    // 🌐 URL de tu backend en Railway (Sincronizado y en línea)
    const URL_BACKEND = 'https://emplea360-production.up.railway.app';

    // 💾 DECLARACIÓN DE ESTADOS LIMPIOS (Sin duplicados y aptos para Vercel)
    const [activeTab, setActiveTab] = useState('perfil');
    const [tieneCambiosSinGuardar, setTieneCambiosSinGuardar] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // Estado para los datos del perfil que vienen de la Base de Datos
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
        // Sincronización rápida por si el Login acaba de guardar un nombre nuevo
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
                    
                    // Sincronizamos el nombre del candidato
                    const nombreReal = datos.nombre || datos.nombre_completo;
                    if (nombreReal && nombreReal.trim() !== "") {
                        setNombreUsuario(nombreReal);
                        localStorage.setItem('usuario_nombre', nombreReal);
                    }

                    // Cargamos los campos de texto del perfil en los inputs
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

    // 📝 MANEJADOR PARA GUARDAR CAMBIOS EN EL PERFIL (POSTGRESQL)
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
                alert("¡Perfil guardado con éxito en la nube!");
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

    // 🚪 FUNCIÓN PARA CERRAR SESIÓN (Limpia los tokens corruptos del navegador)
    const handleCerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('usuario_nombre');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9' }}>
            
            {/* 📊 MENÚ LATERAL (SIDEBAR) */}
            <aside style={{ width: '260px', backgroundColor: '#1e293b', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <h2 style={{ color: '#38bdf8', margin: '0 0 5px 0', fontSize: '22px' }}>Emplea360</h2>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Panel de Control</p>
                    </div>

                    <div style={{ padding: '15px', backgroundColor: '#0f172a', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', uppercase: 'true' }}>Bienvenido/a</p>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>{nombreUsuario}</h4>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                            onClick={() => setActiveTab('perfil')}
                            style={{ width: '100%', padding: '12px', textAlign: 'left', backgroundColor: activeTab === 'perfil' ? '#38bdf8' : 'transparent', color: activeTab === 'perfil' ? '#0f172a' : '#cbd5e1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                        >
                            👤 Mi Perfil Profesional
                        </button>
                    </nav>
                </div>

                <button 
                    onClick={handleCerrarSesion}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' }}
                >
                    🚪 Cerrar Sesión
                </button>
            </aside>

            {/* 🖥️ ÁREA DE CONTENIDO PRINCIPAL */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ color: '#0f172a', margin: 0, fontSize: '28px' }}>Panel del Candidato</h1>
                    {tieneCambiosSinGuardar && (
                        <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                            ⚠️ Tenés cambios sin guardar en la nube
                        </span>
                    )}
                </header>

                <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <form onSubmit={handleGuardarPerfil}>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>
                                📖 Perfil Profesional / Resumen:
                            </label>
                            <textarea 
                                value={perfil.perfil_candidato}
                                onChange={(e) => {
                                    setPerfil({ ...perfil, perfil_candidato: e.target.value });
                                    setTieneCambiosSinGuardar(true);
                                }}
                                placeholder="Contanos sobre tu experiencia, habilidades y lo que buscas..."
                                style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>
                                ✉️ Carta de Presentación:
                            </label>
                            <textarea 
                                value={perfil.carta_presentacion}
                                onChange={(e) => {
                                    setPerfil({ ...perfil, carta_presentacion: e.target.value });
                                    setTieneCambiosSinGuardar(true);
                                }}
                                placeholder="Redactá una carta dirigida a los reclutadores..."
                                style={{ width: '100%', minHeight: '150px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={guardando}
                            style={{ padding: '12px 24px', backgroundColor: guardando ? '#94a3b8' : '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: guardando ? 'not-allowed' : 'pointer', transition: '0.2s' }}
                        >
                            {guardando ? '💾 Guardando...' : '🚀 Guardar Cambios en Perfil'}
                        </button
