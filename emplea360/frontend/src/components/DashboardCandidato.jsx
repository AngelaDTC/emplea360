import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Importamos para poder redirigir al salir

export default function DashboardCandidato() {
  const [activeTab, setActiveTab] = useState('perfil'); // Controla la sección visible
  const [cvFile, setCvFile] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const navigate = useNavigate(); // <-- Instanciamos el navegador

  // --- FUNCIÓN PARA CERRAR SESIÓN ---
  const handleLogout = () => {
    // 1. Limpiamos los datos del almacenamiento local (elimina el JWT Token)
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    
    // 2. Despachamos al usuario de vuelta a la pantalla de login/bienvenida
    navigate('/');
    
    // Opcional: Si manejás un estado global de login en tu App.js, podés llamarlo acá
    alert("Sesión cerrada correctamente.");
  };

  // --- SIMULACIÓN DE CARGA DE ARCHIVO Y OPTIMIZACIÓN ATS ---
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      // Simulamos el análisis ATS
      setTimeout(() => {
        setAtsScore({
          score: 85,
          consejos: [
            "Agregá palabras clave como 'PostgreSQL' o 'React' en tu experiencia.",
            "Evitá usar formatos de dos columnas para que los robots lean de arriba a abajo.",
            "Tu sección de información de contacto está impecable."
          ]
        });
      }, 1500);
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* 📊 MENÚ LATERAL (SIDEBAR) */}
      <div style={{ width: '280px', background: '#0f172a', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* Bloque Superior: Logo, Foto y Navegación */}
        <div>
          <h2 style={{ color: '#38bdf8', fontSize: '20px', textAlign: 'center', marginBottom: '30px' }}>Emplea 360</h2>
          
          {/* Foto de perfil rápida en el menú */}
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#334155', margin: '0 auto 10px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {previewFoto ? <img src={previewFoto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#94a3b8' }}>👤</span>}
            </div>
            <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Panel Candidato</p>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('perfil')} style={btnStyle(activeTab === 'perfil')}>📄 Mi CV y Optimización ATS</button>
            <button onClick={() => setActiveTab('calendario')} style={btnStyle(activeTab === 'calendario')}>📅 Calendario de Entrevistas</button>
            <button onClick={() => setActiveTab('academia')} style={btnStyle(activeTab === 'academia')}>🎓 Academia Emplea 360</button>
            <button onClick={() => setActiveTab('analisis')} style={btnStyle(activeTab === 'analisis')}>📈 Análisis de Postulaciones</button>
            <button onClick={() => setActiveTab('chat')} style={btnStyle(activeTab === 'chat')}>💬 Sala de Chat</button>
          </nav>
        </div>

        {/* 🚨 BOTÓN DE CERRAR SESIÓN (ABAJO DEL TODO) */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '15px' }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', 
              padding: '12px 15px', 
              background: '#ef4444', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              textAlign: 'center', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            🚪 Cerrar Sesión
          </button>
        </div>

      </div>

      {/* 🖥️ CONTENIDO DINÁMICO (DERECHA) */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* SECCIÓN 1: PERFIL Y OPTIMIZACIÓN ATS */}
        {activeTab === 'perfil' && (
          <div>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Mi Perfil Profesional</h2>
            
            {/* Carga de Foto */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Foto de Perfil</h3>
              <input type="file" accept="image/*" onChange={handleFotoChange} style={{ marginTop: '10px' }} />
            </div>

            {/* Carga de CV ATS */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Optimiza tu CV para Filtros ATS</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Subí tu currículum en formato PDF o Word para comprobar la legibilidad del sistema.</p>
              
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} style={{ margin: '20px 0', display: 'block' }} />

              {atsScore && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: '6px' }}>
                  <h4 style={{ color: '#166534', margin: '0 0 10px 0' }}>📈 Puntuación ATS Simulada: {atsScore.score}%</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e293b', fontSize: '14px' }}>
                    {atsScore.consejos.map((c, i) => <li key={i} style={{ marginBottom: '5px' }}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN 2: CALENDARIO */}
        {activeTab === 'calendario' && (
          <div>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Mis Videollamadas Agendadas</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px' }}>Empresa</th>
                    <th style={{ padding: '12px' }}>Fecha</th>
                    <th style={{ padding: '12px' }}>Hora</th>
                    <th style={{ padding: '12px' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>Tech San Juan S.A.</td>
                    <td style={{ padding: '12px' }}>22 de Mayo, 2026</td>
                    <td style={{ padding: '12px' }}>15:30 Hs</td>
                    <td style={{ padding: '12px' }}><span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Pendiente</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECCIÓN 3: ACADEMIA */}
        {activeTab === 'academia' && (
          <div>
            <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Academia de Habilidades</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Cursos específicos demandados por las empresas de la región.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#00458e' }}>Curso: React Avanzado y Estructuras de Datos</h4>
                <p style={{ fontSize: '13px', color: '#475569' }}>Solicitado activamente por 8 empresas este mes.</p>
                <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', marginTop: '10px', cursor: 'pointer' }}>Comenzar Curso</button>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 4: ANÁLISIS DE POSTULACIONES */}
        {activeTab === 'analisis' && (
          <div>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Análisis de mis Postulaciones</h2>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '32px', color: '#00458e', margin: 0 }}>12</h3>
                <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Postulaciones Totales</p>
              </div>
              <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '32px', color: '#22c55e', margin: 0 }}>4</h3>
                <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Vistos por Empresas</p>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 5: CHAT */}
        {activeTab === 'chat' && (
          <div>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Canal de Comunicación Directa</h2>
            <div style={{ display: 'flex', height: '400px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ width: '200px', borderRight: '1px solid #e2e8f0', padding: '15px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 10px 0' }}>Contactos</p>
                <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>💬 Tech San Juan</div>
              </div>
              <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '14px' }}>
                  <p><strong>Empresa:</strong> Hola, vimos tu CV optimizado y nos interesa agendar una entrevista.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input type="text" placeholder="Escribe un mensaje..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer' }}>Enviar</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const btnStyle = (isActive) => ({
  width: '100%',
  padding: '12px 15px',
  background: isActive ? '#38bdf8' : 'transparent',
  color: isActive ? '#0f172a' : '#94a3b8',
  border: 'none',
  borderRadius: '6px',
  textAlign: 'left',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.2s',
});
