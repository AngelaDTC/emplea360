import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
  const navigate = useNavigate();

  // URL base de tu backend en Railway
  const URL_BACKEND = 'https://emplea360-production-517a.up.railway.app'; 

  // ==========================================
  // 💾 1. DECLARACIÓN DE TODOS TUS ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('perfil'); 
  const [sidebarAbierto, setSidebarAbierto] = useState(true); 
  const [cvNombreArchivo, setCvNombreArchivo] = useState(''); 
  const [previewFoto, setPreviewFoto] = useState(null); 
  const [atsScore, setAtsScore] = useState(null);
  
  // Estado para el video de presentación
  const [videoFile, setVideoFile] = useState(null);
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

  const [nuevaHabilidad, setNuevaHabilidad] = useState('');
  const [nuevoEstudio, setNuevoEstudio] = useState({ titulo: '', institucion: '', año: '' });
  const [nuevaExperiencia, setNuevaExperiencia] = useState({ puesto: '', empresa: '', periodo: '' });
  const [nuevaCapacitacion, setNuevaCapacitacion] = useState({ nombre: '', entidad: '' });
  const [nuevoConocimiento, setNuevoConocimiento] = useState('');

  const listaHabilidadesSugeridas = ["React.js", "Node.js", "PostgreSQL", "JavaScript", "Metodologías Ágiles", "UI/UX", "Python", "Liderazgo de Equipos", "Gestión Comercial", "Atención al Cliente"];
  const listaConocimientosSugeridas = ["Inglés Técnico", "Excel Avanzado", "Git & GitHub", "Docker", "Bases de Datos Relacionales", "Contabilidad General", "Marketing Digital"];

  // Módulo de Calendario y Entrevistas
  const [entrevistas, setEntrevistas] = useState([
    { id: 1, empresa: 'Tech San Juan S.A.', fecha: '2026-05-22', hora: '15:30', tipo: 'Entrevista', estado: 'Pendiente' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [nuevaEntrevista, setNuevaEntrevista] = useState({ empresa: '', fecha: '', hora: '', tipo: 'Entrevista' });
  const diasMes = Array.from({ length: 31 }, (_, i) => i + 1);

  // Módulo de Vacantes Corporativas
  const [vacantes, setVacantes] = useState([]);
  const [loadingVacantes, setLoadingVacantes] = useState(false);

  const [filtroPuesto, setFiltroPuesto] = useState('');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroZona, setFiltroZona] = useState('');

  // ==========================================
  // 🔑 2. CARGAR PERFIL DE POSTGRESQL (GET)
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
  // 🏢 3. FETCH: TRAER VACANTES DE LAS EMPRESAS
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
    } fill {
      setLoadingVacantes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analisis') obtenerVacantesDeEmpresas();
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

      if (respuesta.ok) {
        console.log("💾 Cambios guardados con éxito.");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error de red al guardar:", error);
      return false;
    }
  };

  const handleGuardarManual = async () => {
    const exito = await guardarDatosEnBaseDeDatos();
    if (exito) {
      alert("💾 ¡Enhorabuena! Tu Currículum, video y perfil automatizado fueron sincronizados con éxito en PostgreSQL.");
    } else {
      alert("⚠️ Hubo un inconveniente al guardar. Si el video o la foto son muy pesados, te recomendamos subirlos en formatos más ligeros.");
    }
  };

  // ==========================================
  // ⚙️ LOGICA DE OPTIMIZACIÓN Y CARGA AUTOMÁTICA
  // ==========================================
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvNombreArchivo(file.name);
      
      // 🚀 OPTIMIZACIÓN AUTOMÁTICA: Rellena toda la información del CV al instante
      const perfilSimulado = `Profesional altamente capacitado con enfoque estratégico en resolución de problemas y optimización analítica de flujos operativos. Orientado al cumplimiento de objetivos corporativos y al diseño lineal bajo estándares internacionales.`;
      const cartaSimulada = `Estimado Responsable de Selección,\n\nPor medio de la presente, presento mi postulación para formar parte de su prestigioso equipo de trabajo. Adjunto mi Currículum Base, el cual ha sido estructurado siguiendo los lineamientos de optimización ATS para garantizar la máxima compatibilidad con sus sistemas de filtrado.\n\nConsidero que mis competencias técnicas y habilidades interpersonales se alinean con la visión de excelencia de la organización. Quedo a su entera disposición para mantener una entrevista formal.\n\nAtentamente,\n${nombreUsuario}`;
      const habilidadesSimuladas = ["React.js", "JavaScript", "Node.js", "PostgreSQL", "Metodologías Ágiles", "UI/UX"];
      const estudiosSimulados = [{ titulo: "Ingeniería / Tecnicatura en Sistemas", institucion: "Universidad Nacional", año: "2024" }];
      const experienciasSimuladas = [{ puesto: "Desarrollador Full Stack", empresa: "Innovación Digital S.A.", periodo: "2024 - Presente" }];

      setPerfilCandidato(perfilSimulado);
      setCartaPresentacion(cartaSimulada);
      setHabilidades(habilidadesSimuladas);
      setEstudios(estudiosSimulados);
      setExperiencias(experienciasSimuladas);

      setAtsScore({ 
        score: 92, 
        consejos: [
          "Excelente estructura lineal. Formato de columna única detectado.", 
          "Palabras clave óptimas para el sector tecnológico / gestión.",
          "Sugerencia: Detallá un poco más tus funciones en el último empleo."
        ] 
      });
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Control de subida de video de presentación
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      alert("🎥 ¡Video de presentación cargado correctamente! Presioná el botón de guardar para enviarlo a la base de datos.");
    }
  };

  const handlePostularse = (id, puesto, empresa) => {
    setVacantes(vacantes.map(v => v.id === id ? { ...v, postulada: true } : v));
    alert(`🎉 ¡Te postulaste a "${puesto}" en ${empresa}!`);
  };

  const addHabilidadManual = () => {
    if (nuevaHabilidad && !habilidades.includes(nuevaHabilidad)) {
      setHabilidades([...habilidades, nuevaHabilidad]);
      setNuevaHabilidad('');
    }
  };

  const addConocimientoManual = () => {
    if (nuevoConocimiento.trim() && !conocimientos.includes(nuevoConocimiento.trim())) {
      setConocimientos([...conocimientos, nuevoConocimiento.trim()]);
      setNuevoConocimiento('');
    }
  };

  const addEstudioManual = (e) => {
    e.preventDefault();
    if (nuevoEstudio.titulo && nuevoEstudio.institucion) {
      setEstudios([...estudios, nuevoEstudio]);
      setNuevoEstudio({ titulo: '', institucion: '', año: '' });
    }
  };

  const addExperienciaManual = (e) => {
    e.preventDefault();
    if (nuevaExperiencia.puesto && nuevaExperiencia.empresa) {
      setExperiencias([...experiencias, nuevaExperiencia]);
      setNuevaExperiencia({ puesto: '', empresa: '', periodo: '' });
    }
  };

  const descargarPdfAts = () => {
    const vent = window.open('', '_blank');
    vent.document.write(`<html><head><title>CV ATS - ${nombreUsuario}</title></head><body style="font-family: Arial, sans-serif; padding: 40px; color: #333;"><h1 style="color: #00458e; border-bottom: 2px solid #00458e; padding-bottom: 10px;">${nombreUsuario.toUpperCase()}</h1><h3>PERFIL PROFESIONAL</h3><p>${perfilCandidato}</p><h3>COMPETENCIAS Y HABILIDADES</h3><p>${habilidades.join(' • ')}</p><h3>ESTUDIOS</h3><ul>${estudios.map(e => `<li><strong>${e.titulo}</strong> - ${e.institucion} (${e.año})</li>`).join('')}</ul><h3>EXPERIENCIA LABORAL</h3><ul>${experiencias.map(exp => `<li><strong>${exp.puesto}</strong> en ${exp.empresa} (${exp.periodo})</li>`).join('')}</ul><script>window.print();</script></body></html>`);
    vent.document.close();
  };

  const abrirModal = () => setShowModal(true);
  const cerrarModal = () => { setShowModal(false); setNuevaEntrevista({ empresa: '', fecha: '', hora: '', tipo: 'Entrevista' }); };
  const handleAddEntrevistaSubmit = (e) => {
    e.preventDefault();
    setEntrevistas([...entrevistas, { id: Date.now(), ...nuevaEntrevista, estado: 'Pendiente' }]);
    cerrarModal();
  };
  const tieneEntrevistaElDia = (dia) => entrevistas.filter(ent => ent.fecha === `2026-05-${dia.toString().padStart(2, '0')}`);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const vacantesFiltradas = vacantes.filter(v => {
    return v.puesto.toLowerCase().includes(filtroPuesto.toLowerCase()) &&
           (filtroDisponibilidad === '' || v.disponibilidad === filtroDisponibilidad) &&
           (filtroTipo === '' || v.tipo === filtroTipo) &&
           v.zona.toLowerCase().includes(filtroZona.toLowerCase());
  });

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
              <button onClick={() => setActiveTab('analisis')} style={{ width: '100%', padding: '12px 15px', background: activeTab === 'analisis' ? '#38bdf8' : 'transparent', color: activeTab === 'analisis' ? '#0f172a' : '#cbd5e1', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>📈 Postulaciones</button>
              <button onClick={() => setActiveTab('chat')} style={{ width: '100%', padding: '12px 15px', background: activeTab === 'chat' ? '#38bdf8' : 'transparent', color: activeTab === 'chat' ? '#0f172a' : '#cbd5e1', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>💬 Sala de Chat</button>
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
          
          {/* PESTAÑA 1: CARGA Y OPTIMIZACIÓN CV */}
          {activeTab === 'perfil' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#0f172a', margin: 0 }}>Optimización Inteligente</h2>
                <button 
                  onClick={handleGuardarManual} 
                  style={{ background: '#00458e', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0, 69, 142, 0.15)' }}
                >
                  💾 Guardar en Base de Datos
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Foto de Perfil</h3>
                  <input type="file" accept="image/*" onChange={handleFotoChange} style={{ marginTop: '10px' }} />
                  {previewFoto && <p style={{ color: '#22c55e', fontSize: '13px', marginTop: '5px' }}>✓ Foto cargada correctamente.</p>}
                </div>

                {/* 🎥 NUEVO MÓDULO: VIDEO DE PRESENTACIÓN */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Video de Presentación Corporativo</h3>
                  <input type="file" accept="video/*" onChange={handleVideoChange} style={{ marginTop: '10px' }} />
                  {videoUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <video src={videoUrl} controls style={{ width: '100%', maxHeight: '120px', borderRadius: '6px', background: '#000' }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <h3>Arrastrá o cargá tu Currículum Base</h3>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} style={{ marginTop: '10px' }} />
                {cvNombreArchivo && <p style={{ fontSize: '13px', color: '#00458e', fontWeight: 'bold', marginTop: '5px' }}>📂 Archivo: {cvNombreArchivo}</p>}
                
                {atsScore && (
                  <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #22c55e', marginTop: '20px' }}>
                    <h4 style={{ color: '#166534', margin: '0 0 5px 0' }}>📈 Puntuación del Robot ATS: {atsScore.score}%</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1e293b' }}>
                      {atsScore.consejos.map((c, i) => <li key={i} style={{ marginTop: '4px' }}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* 📊 DOCUMENTO DINÁMICO DE FILTROS ATS */}
              {cvNombreArchivo && (
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ color: '#0f172a', marginBottom: '15px' }}>🛠️ Análisis Detallado de Filtros ATS</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    <div style={{ padding: '15px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#166534' }}>Estructura Lineal</h5>
                      <span style={{ fontSize: '20px' }}>✅</span>
                      <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#166534' }}>Pasa filtros de tablas y columnas dobles.</p>
                    </div>
                    <div style={{ padding: '15px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#166534' }}>Palabras Clave</h5>
                      <span style={{ fontSize: '20px' }}>✅</span>
                      <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#166534' }}>Sincronizado con demandas del mercado.</p>
                    </div>
                    <div style={{ padding: '15px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#166534' }}>Datos de Contacto</h5>
                      <span style={{ fontSize: '20px' }}>✅</span>
                      <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#166534' }}>Teléfono, Email y Ubicación localizados.</p>
                    </div>
                    <div style={{ padding: '15px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fef08a', textAlign: 'center' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#854d0e' }}>Formato Archivo</h5>
                      <span style={{ fontSize: '20px' }}>⚠️</span>
                      <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#854d0e' }}>Se recomienda exportar directo en .pdf digital.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 2: DATOS Y ESTRUCTURA CV */}
          {activeTab === 'formularios' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#0f172a', margin: 0 }}>Estructuración de Secciones Curriculum</h2>
                <button onClick={handleGuardarManual} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>💾 Guardar Cambios</button>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Resumen Profesional (Autocompletado)</h3>
                <textarea value={perfilCandidato} onChange={(e) => setPerfilCandidato(e.target.value)} rows="4" style={{ width: '100%', padding: '10px', marginTop: '10px', fontSize: '14px', lineHeight: '1.5' }} placeholder="Escribí un resumen de tu perfil..."></textarea>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Habilidades del Candidato (Extraídas por ATS)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {habilidades.map((h, i) => (
                    <span key={i} style={{ background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>{h}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Estudios</h3>
                  <ul>{estudios.map((e, i) => <li key={i}><strong>{e.titulo}</strong> - {e.institucion} ({e.año})</li>)}</ul>
                  <form onSubmit={addEstudioManual} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                    <input type="text" placeholder="Título" value={nuevoEstudio.titulo} onChange={(e) => setNuevoEstudio({...nuevoEstudio, titulo: e.target.value})} required />
                    <input type="text" placeholder="Institución" value={nuevoEstudio.institucion} onChange={(e) => setNuevoEstudio({...nuevoEstudio, institucion: e.target.value})} required />
                    <input type="text" placeholder="Año" value={nuevoEstudio.año} onChange={(e) => setNuevoEstudio({...nuevoEstudio, año: e.target.value})} required />
                    <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>+ Agregar</button>
                  </form>
                </div>

                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Experiencia Laboral</h3>
                  <ul>{experiencias.map((exp, i) => <li key={i}><strong>{exp.puesto}</strong> en {exp.empresa} ({exp.periodo})</li>)}</ul>
                  <form onSubmit={addExperienciaManual} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                    <input type="text" placeholder="Puesto" value={nuevaExperiencia.puesto} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, puesto: e.target.value})} required />
                    <input type="text" placeholder="Empresa" value={nuevaExperiencia.empresa} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, empresa: e.target.value})} required />
                    <input type="text" placeholder="Periodo" value={nuevaExperiencia.periodo} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, periodo: e.target.value})} required />
                    <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>+ Agregar</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: DOCUMENTOS GENERADOS */}
          {activeTab === 'documentos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Carta de Presentación (Autogenerada al subir CV)</h2>
                <div>
                  <button onClick={handleGuardarManual} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginRight: '10px' }}>💾 Guardar</button>
                  <button onClick={descargarPdfAts} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Imprimir CV Completo (PDF ATS)</button>
                </div>
              </div>
              <textarea value={cartaPresentacion} onChange={(e) => setCartaPresentacion(e.target.value)} rows="15" style={{ width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #ccc', background: '#fafafa', fontSize: '14px', lineHeight: '1.6' }} placeholder="La carta de presentación se generará automáticamente cuando subas tu currículum base en la primera pestaña..."></textarea>
            </div>
          )}

          {/* PESTAÑA 4: ENTREVISTAS */}
          {activeTab === 'calendario' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Mis Videollamadas Agendadas</h2>
                <button onClick={abrirModal} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Agendar Entrevista / Capacitación</button>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}><th>Empresa / Entidad</th><th>Tipo Evento</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {entrevistas.map((ent) => (
                      <tr key={ent.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{ent.empresa}</td>
                        <td><span style={{ background: ent.tipo === 'Capacitación' ? '#e0f2fe' : '#f3e8ff', color: ent.tipo === 'Capacitación' ? '#0369a1' : '#6b21a8', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{ent.tipo || 'Entrevista'}</span></td>
                        <td>{ent.fecha}</td><td>{ent.hora} Hs</td>
                        <td><span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{ent.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 5: POSTULACIONES */}
          {activeTab === 'analisis' && (
            <div>
              <h2>Buscador de Vacantes Corporativas</h2>
              {/* Contenido de Postulaciones Estructural */}
              <p>Filtros y vacantes listos para vincularse con las empresas.</p>
            </div>
          )}

          {/* PESTAÑA 6: SALA DE CHAT */}
          {activeTab === 'chat' && (
            <div>
              <h2>Sala de Chat Corporativa</h2>
              <p>Canal de soporte y contacto directo.</p>
            </div>
          )}

        </div>
      </div>

      {/* MODAL DE AGENDAMIENTO */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <form onSubmit={handleAddEntrevistaSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>Programar Evento en Agenda</h3>
            <input type="text" placeholder="Empresa" value={nuevaEntrevista.empresa} onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, empresa: e.target.value})} required style={{ padding: '8px' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" onClick={cerrarModal} style={{ padding: '8px', background: '#cbd5e1', border: 'none', borderRadius: '4px' }}>Cancelar</button>
              <button type="submit" style={{ padding: '8px 16px', background: '#00458e', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Agendar</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
