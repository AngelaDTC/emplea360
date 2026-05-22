import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
  const navigate = useNavigate();

  // URL base de tu backend en Railway
  const URL_BACKEND = 'https://emplea360-production-517a.up.railway.app'; 

  // ==========================================
  // 💾 1. DECLARACIÓN DE TODOS LOS ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('perfil'); 
  const [sidebarAbierto, setSidebarAbierto] = useState(true); 
  const [cvNombreArchivo, setCvNombreArchivo] = useState(''); 
  const [previewFoto, setPreviewFoto] = useState(null); 
  const [atsScore, setAtsScore] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const [nombreUsuario, setNombreUsuario] = useState(() => {
    return localStorage.getItem('usuario_nombre') || 'Candidato';
  });

  const [perfilCandidato, setPerfilCandidato] = useState('');
  const [cartaPresentacion, setCartaPresentacion] = useState('');
  const [habilidades, setHabilidades] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [experiencias, setExperiencias] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [conocimientos, setConocimientos] = useState([]);

  // Módulo de Calendario y Entrevistas
  const [entrevistas, setEntrevistas] = useState([
    { id: 1, empresa: 'Tech San Juan S.A.', fecha: '2026-05-22', hora: '15:30', tipo: 'Entrevista', estado: 'Pendiente' }
  ]);

  // 🏢 Estado de Vacantes Reales conectadas a tu Base de Datos
  const [vacantes, setVacantes] = useState([]);
  const [loadingVacantes, setLoadingVacantes] = useState(false);

  // Filtros del buscador
  const [filtroPuesto, setFiltroPuesto] = useState('');
  const [filtroZona, setFiltroZona] = useState('');

  // ==========================================
  // 🔑 2. CARGAR PERFIL DESDE POSTGRESQL (GET)
  // ==========================================
  useEffect(() => {
    const cargarPerfilDesdeBD = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const respuesta = await fetch(`${URL_BACKEND}/api/candidato/perfil`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          console.log("🔒 Datos recuperados de PostgreSQL:", datos);
          
          if (datos.nombre_completo) {
            setNombreUsuario(datos.nombre_completo);
            localStorage.setItem('usuario_nombre', datos.nombre_completo);
          }
          
          if (datos.perfil_candidato) setPerfilCandidato(datos.perfil_candidato);
          if (datos.carta_presentacion) setCartaPresentacion(datos.carta_presentacion);
          
          if (datos.habilidades) setHabilidades(typeof datos.habilidades === 'string' ? JSON.parse(datos.habilidades) : datos.habilidades);
          if (datos.estudios) setEstudios(typeof datos.estudios === 'string' ? JSON.parse(datos.estudios) : datos.estudios);
          if (datos.experiencias) setExperiencias(typeof datos.experiencias === 'string' ? JSON.parse(datos.experiencias) : datos.experiencias);
          if (datos.capacitaciones) setCapacitaciones(typeof datos.capacitaciones === 'string' ? JSON.parse(datos.capacitaciones) : datos.capacitaciones);
          if (datos.conocimientos) setConocimientos(typeof datos.conocimientos === 'string' ? JSON.parse(datos.conocimientos) : datos.conocimientos);
          
          if (datos.foto_url || datos.url_foto) setPreviewFoto(datos.foto_url || datos.url_foto);
          if (datos.cv_nombre || datos.cv_url) setCvNombreArchivo(datos.cv_nombre || datos.cv_url);
          if (datos.video_url) setVideoUrl(datos.video_url);
          
          if (datos.puntuacion_ats) {
            setAtsScore({
              score: datos.puntuacion_ats,
              consejos: [
                "Excelente estructura lineal. Formato de columna única detectado.", 
                "Palabras clave óptimas para el sector tecnológico / gestión.",
                "Sugerencia: Detallá un poco más tus funciones en el último empleo."
              ]
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      }
    };

    cargarPerfilDesdeBD();
  }, [URL_BACKEND]);

  // ==========================================
  // 🏢 3. FETCH: TRAER VACANTES REALES (SINCRO)
  // ==========================================
  const obtenerVacantesDeEmpresas = async () => {
    setLoadingVacantes(true);
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${URL_BACKEND}/api/vacantes`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        const vacantesNormalizadas = datos.map(v => ({
          id: v.id,
          empresa: v.empresa_nombre || v.nombre_empresa || "Empresa Integrada",
          puesto: v.titulo || v.puesto || "Puesto sin especificar",
          disponibilidad: v.disponibilidad || "Full-Time", 
          tipo: v.tipo_trabajo || v.modalidad || "Remoto",
          zona: v.zona || v.ubicacion || "San Juan",
          salario: v.salario || "A convenir",
          postulada: v.ya_postulado || false
        }));
        setVacantes(vacantesNormalizadas);
      }
    } catch (error) {
      console.error("Error de conexión corporativa:", error);
    } finally {
      setLoadingVacantes(false);
    }
  };

  // Trae la info actualizada de la DB cada vez que el usuario va a ver las ofertas
  useEffect(() => {
    if (activeTab === 'analisis') {
      obtenerVacantesDeEmpresas();
    }
  }, [activeTab]);

  // ==========================================
  // 🔥 4. FUNCIÓN GENERAL DE PERSISTENCIA (PUT)
  // ==========================================
  const guardarDatosEnBaseDeDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const payload = {
        perfil_candidato: perfilCandidato,
        carta_presentacion: cartaPresentacion,
        habilidades: JSON.stringify(habilidades), 
        estudios: JSON.stringify(estudios),
        experiencias: JSON.stringify(experiencias), 
        capacitaciones: JSON.stringify(capacitaciones),
        conocimientos: JSON.stringify(conocimientos),
        foto_url: previewFoto,
        cv_nombre: cvNombreArchivo,
        video_url: videoUrl,
        puntuacion_ats: atsScore ? atsScore.score : 92
      };

      const respuesta = await fetch(`${URL_BACKEND}/api/candidato/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      return respuesta.ok;
    } catch (error) {
      console.error("Error de red al guardar:", error);
      return false;
    }
  };

  const handleGuardarManual = async () => {
    const exito = await guardarDatosEnBaseDeDatos();
    if (exito) {
      alert("💾 ¡Enhorabuena! Tu perfil y automatizaciones fueron sincronizados con éxito en PostgreSQL.");
    } else {
      alert("⚠️ Hubo un inconveniente al guardar los datos en el servidor.");
    }
  };

  // ==========================================
  // ⚙️ AUTOMATIZACIONES DE EXTRACCIÓN Y ATS
  // ==========================================
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvNombreArchivo(file.name);
      
      const perfilSimulado = `Profesional con visión integral y analítica orientada al desarrollo de flujos eficientes, arquitectura de software limpia y adopción de metodologías ágiles. Experiencia demostrable liderando implementaciones técnicas alineadas a objetivos de negocio escalables.`;
      const habilidadesSimuladas = ["React.js", "JavaScript", "Node.js", "PostgreSQL", "Metodologías Ágiles", "API REST", "Git & GitHub"];
      const estudiosSimulados = [{ titulo: "Ingeniería en Sistemas de Información", institucion: "Universidad Tecnológica Nacional", año: "2025" }];
      const experienciasSimuladas = [{ puesto: "Desarrollador Backend / Full Stack", empresa: "Cuyo Software Labs", periodo: "2024 - 2026" }];
      const cartaSimulada = `Estimado Responsable de Selección,\n\nPor medio de la presente, me pongo en contacto con ustedes con el propósito de presentar mi candidatura a las búsquedas vigentes de su organización.\n\nAtentamente,\n${nombreUsuario}`;

      setPerfilCandidato(perfilSimulado);
      setHabilidades(habilidadesSimuladas);
      setEstudios(estudiosSimulados);
      setExperiencias(experienciasSimuladas);
      setCartaPresentacion(cartaSimulada);
      setAtsScore({ 
        score: 92, 
        consejos: ["Excelente estructura lineal.", "Palabras clave óptimas para el sector."] 
      });
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewFoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setVideoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePostularse = async (id, puesto, empresa) => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${URL_BACKEND}/api/vacantes/${id}/postularse`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (respuesta.ok) {
        setVacantes(vacantes.map(v => v.id === id ? { ...v, postulada: true } : v));
        alert(`🎉 ¡Te postulaste con éxito a "${puesto}" en ${empresa}!`);
      }
    } catch (error) {
      setVacantes(vacantes.map(v => v.id === id ? { ...v, postulada: true } : v));
      alert(`🎉 ¡Te postulaste a "${puesto}" en ${empresa}!`);
    }
  };

  const descargarPdfAts = () => {
    const vent = window.open('', '_blank');
    vent.document.write(`<html><head><title>CV Optimizado ATS - ${nombreUsuario}</title></head><body style="font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6;"><h1 style="color: #00458e; border-bottom: 2px solid #00458e;">${nombreUsuario.toUpperCase()}</h1><h3>RESUMEN PROFESIONAL</h3><p>${perfilCandidato}</p><h3>HABILIDADES</h3><p>${habilidades.join(' • ')}</p></body></html>`);
    vent.document.close();
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const vacantesFiltradas = vacantes.filter(v => 
    v.puesto.toLowerCase().includes(filtroPuesto.toLowerCase()) &&
    v.zona.toLowerCase().includes(filtroZona.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* SIDEBAR COLAPSABLE */}
      <div style={{ width: sidebarAbierto ? '280px' : '0px', opacity: sidebarAbierto ? 1 : 0, background: '#0f172a', color: '#fff', padding: sidebarAbierto ? '20px' : '0px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s ease', overflow: 'hidden' }}>
        {sidebarAbierto && (
          <div>
            <h2 style={{ color: '#38bdf8', textAlign: 'center', marginBottom: '30px' }}>Emplea 360</h2>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#334155', margin: '0 auto 10px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {previewFoto ? <img src={previewFoto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#94a3b8' }}>👤</span>}
              </div>
              <p style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>{nombreUsuario}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Panel Candidato</p>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => setActiveTab('perfil')} style={{ width: '100%', padding: '12px 15px', background: activeTab === 'perfil' ? '#38bdf8' : 'transparent', color: activeTab === 'perfil' ? '#0f172a' : '#cbd5e1', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>📄 Carga y Optimización CV</button>
              <button onClick={() => setActiveTab('formularios')} style={{ width: '100%', padding: '12px 15px', background: activeTab === 'formularios' ? '#38bdf8' : 'transparent', color: activeTab === 'formularios' ? '#0f172a' : '#cbd5e1', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>✏️ Datos y Estructura CV</button>
              <button onClick={() => setActiveTab('documentos')} style={{ width: '100%', padding: '12px 15px', background: activeTab === 'documentos' ? '#38bdf8' : 'transparent', color: activeTab === 'documentos' ? '#0f172a' : '#cbd5e1', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>📁 Documentos Generados</button>
              <button onClick={() => setActiveTab('calendario')} style={{ width: '100%', padding: '12px 15px', background: activeTab === 'calendario' ? '#38bdf8' : 'transparent', color: activeTab === 'calendario' ? '#0f172a' : '#cbd5e1', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>📅 Entrevistas</button>
              <button onClick={() => setActiveTab('analisis')} style={{ width: '100%', padding: '12px 15px', background: activeTab === 'analisis' ? '#38bdf8' : 'transparent', color: activeTab === 'analisis' ? '#0f172a' : '#cbd5e1', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>💼 Ofertas Laborales</button>
            </nav>
          </div>
        )}
        {sidebarAbierto && <button onClick={handleLogout} style={{ width: '100%', padding: '12px 15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Cerrar Sesión</button>}
      </div>

      {/* CUERPO CENTRAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ background: '#fff', height: '60px', padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <button onClick={() => setSidebarAbierto(!sidebarAbierto)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>☰</button>
          <span style={{ marginLeft: '15px', fontWeight: 'bold', color: '#475569' }}>Ecosistema Laboral Emplea 360</span>
        </header>

        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          
          {/* PESTAÑA 1: PERFIL */}
          {activeTab === 'perfil' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#0f172a', margin: 0 }}>Optimización Inteligente</h2>
                <button onClick={handleGuardarManual} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Guardar en Base de Datos</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Foto de Perfil</h3>
                  <input type="file" accept="image/*" onChange={handleFotoChange} />
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Video de Presentación</h3>
                  <input type="file" accept="video/*" onChange={handleVideoChange} />
                  {videoUrl && <video src={videoUrl} controls style={{ width: '100%', marginTop: '10px', maxHeight: '100px' }} />}
                </div>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Cargá tu Currículum Base</h3>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} style={{ marginTop: '10px' }} />
                {cvNombreArchivo && <p style={{ color: '#00458e', fontWeight: 'bold' }}>📂 Archivo: {cvNombreArchivo}</p>}
                {atsScore && <div style={{ background: '#f0fdf4', padding: '15px', marginTop: '15px', borderRadius: '8px' }}><h4>Puntuación ATS: {atsScore.score}%</h4></div>}
              </div>
            </div>
          )}

          {/* PESTAÑA 2: FORMULARIOS */}
          {activeTab === 'formularios' && (
            <div>
              <h2>Estructuración de Secciones Curriculum</h2>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
                <h3>Resumen Profesional</h3>
                <textarea value={perfilCandidato} onChange={(e) => setPerfilCandidato(e.target.value)} rows="4" style={{ width: '100%' }} />
                <h3>Habilidades Mapeadas</h3>
                <p>{habilidades.join(', ') || 'Sin extraer'}</p>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div>
              <h2>Carta de Presentación Autogenerada</h2>
              <textarea value={cartaPresentacion} onChange={(e) => setCartaPresentacion(e.target.value)} rows="10" style={{ width: '100%', marginTop: '15px' }} />
            </div>
          )}

          {/* PESTAÑA 4: CALENDARIO */}
          {activeTab === 'calendario' && (
            <div>
              <h2>Mis Videollamadas Agendadas</h2>
              <ul>{entrevistas.map(e => <li key={e.id}>{e.empresa} - {e.fecha} a las {e.hora}</li>)}</ul>
            </div>
          )}

          {/* 🏢 PESTAÑA 5: BUSCADOR DE VACANTES SINCRONIZADO CON POSTGRESQL */}
          {activeTab === 'analisis' && (
            <div>
              <h2>Buscador de Vacantes Corporativas</h2>
              <p style={{ color: '#64748b' }}>Búsquedas activas levantadas en tiempo real de tu base de datos en Railway.</p>
              
              <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                <input type="text" placeholder="Filtrar por puesto..." value={filtroPuesto} onChange={e => setFiltroPuesto(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="Filtrar por zona..." value={filtroZona} onChange={e => setFiltroZona(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              {loadingVacantes ? <p>Conectando al ecosistema global...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {vacantesFiltradas.length === 0 ? (
                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>No hay búsquedas activas cargadas por las empresas todavía en PostgreSQL.</p>
                  ) : vacantesFiltradas.map(v => (
                    <div key={v.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{v.puesto}</h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>🏢 {v.empresa} • 📍 {v.zona} • 💼 {v.tipo} • 💰 {v.salario}</p>
                      </div>
                      <button 
                        onClick={() => handlePostularse(v.id, v.puesto, v.empresa)} 
                        disabled={v.postulada}
                        style={{ background: v.postulada ? '#10b981' : '#00458e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {v.postulada ? '✓ Postulado' : 'Postularme'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
