import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
  const [activeTab, setActiveTab] = useState('perfil'); 
  const [cvFile, setCvFile] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const navigate = useNavigate();

  // --- ESTADOS PARA ENTREVISTAS REALES ---
  const [entrevistas, setEntrevistas] = useState([
    { id: 1, empresa: 'Tech San Juan S.A.', fecha: '2026-05-22', hora: '15:30', estado: 'Pendiente' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [nuevaEntrevista, setNuevaEntrevista] = useState({ empresa: '', fecha: '', hora: '' });

  // --- NAVEGACIÓN DE MES SIMULADA PARA EL CALENDARIO ---
  const diasMes = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
    alert("Sesión cerrada correctamente.");
  };

  // --- SIMULACIÓN DE CARGA DE ARCHIVO Y OPTIMIZACIÓN ATS ---
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
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

  // --- MANEJO DE AGREGAR ENTREVISTAS ---
  const abrirModal = () => setShowModal(true);
  const cerrarModal = () => {
    setShowModal(false);
    setNuevaEntrevista({ empresa: '', fecha: '', hora: '' });
  };

  const handleAddEntrevistaSubmit = (e) => {
    e.preventDefault();
    if (!nuevaEntrevista.empresa || !nuevaEntrevista.fecha || !nuevaEntrevista.hora) return;

    const nueva = {
      id: Date.now(),
      empresa: nuevaEntrevista.empresa,
      fecha: nuevaEntrevista.fecha,
      hora: nuevaEntrevista.hora,
      estado: 'Pendiente'
    };

    setEntrevistas([...entrevistas, nueva]);
    cerrarModal();
  };

  // Auxiliar para marcar qué días tienen entrevista en la cuadrícula visual
  const tieneEntrevistaElDia = (dia) => {
    // Formateamos el día para que coincida con el mes actual simulado (Mayo 2026)
    const stringDia = `2026-05-${dia.toString().padStart(2, '0')}`;
    return entrevistas.filter(ent => ent.fecha === stringDia);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* 📊 MENÚ LATERAL (SIDEBAR) */}
      <div style={{ width: '280px', background: '#0f172a', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: '#38bdf8', fontSize: '20px', textAlign: 'center', marginBottom: '30px' }}>Emplea 360</h2>
          
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

        <div style={{ borderTop: '1px solid #334155', paddingTop: '15px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px 15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
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
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Foto de Perfil</h3>
              <input type="file" accept="image/*" onChange={handleFotoChange} style={{ marginTop: '10px' }} />
            </div>
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

        {/* 📅 SECCIÓN 2: CALENDARIO COMPLETO REPOTENCIADO */}
        {activeTab === 'calendario' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#0f172a', margin: 0 }}>Mis Videollamadas Agendadas</h2>
              {/* 🔥 BOTÓN AGREGAR ENTREVISTA */}
              <button onClick={abrirModal} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                ➕ Agregar Entrevista
              </button>
            </div>

            {/* TABLA ORIGINAL TAL CUAL ESTABA */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
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
                  {entrevistas.map((ent) => (
                    <tr key={ent.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{ent.empresa}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{ent.fecha}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{ent.hora} Hs</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          {ent.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 🗓️ NUEVO: CALENDARIO VISUAL EN CUADRÍCULA INTERACTIVA */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', textAlign: 'center' }}>Mayo 2026</h3>
              
              {/* Encabezados de días de la semana */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', fontSize: '14px' }}>
                <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
              </div>

              {/* Días del mes en Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {diasMes.map((dia) => {
                  const entrevistasDelDia = tieneEntrevistaElDia(dia);
                  const tieneCita = entrevistasDelDia.length > 0;

                  return (
                    <div key={dia} style={{ minHeight: '80px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: tieneCita ? '#eff6ff' : '#fff', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '12px', color: tieneCita ? '#00458e' : '#64748b' }}>{dia}</span>
                      
                      {/* Globos informativos dentro del casillero del día */}
                      {tieneCita && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {entrevistasDelDia.map((ent, idx) => (
                            <div key={idx} style={{ background: '#00458e', color: '#fff', fontSize: '10px', padding: '3px 5px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${ent.empresa} a las ${ent.hora}`}>
                              ⏰ {ent.hora} - {ent.empresa}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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

      {/* 🪟 MODAL FLOTANTE: FORMULARIO AGREGAR ENTREVISTA */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleAddEntrevistaSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#00458e', textAlign: 'center' }}>Nueva Entrevista</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Nombre de la Empresa</label>
              <input type="text" placeholder="Ej: Tech San Juan" value={nuevaEntrevista.empresa} onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, empresa: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Fecha de la Cita</label>
              <input type="date" value={nuevaEntrevista.fecha} onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, fecha: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Hora</label>
              <input type="time" value={nuevaEntrevista.hora} onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, hora: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={cerrarModal} style={{ flex: 1, padding: '12px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancelar
              </button>
              <button type="submit" style={{ flex: 1, padding: '12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Guardar Cita
              </button>
            </div>
          </form>
        </div>
      )}

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
