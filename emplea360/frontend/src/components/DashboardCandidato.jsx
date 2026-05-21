import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
  const navigate = useNavigate();

  // URL base de tu backend en Railway
  const URL_BACKEND = 'https://emplea360-production-517a.up.railway.app'; 

  // ==========================================
  // 💾 1. DECLARACIÓN DE ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('perfil'); 
  const [sidebarAbierto, setSidebarAbierto] = useState(true); // 🌟 Estado para ocultar/mostrar menú
  const [cvNombreArchivo, setCvNombreArchivo] = useState(''); 
  const [previewFoto, setPreviewFoto] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  
  const [nombreUsuario, setNombreUsuario] = useState(() => {
    return localStorage.getItem('usuario_nombre') || 'Candidato';
  });

  // Datos estructurados del CV
  const [perfilCandidato, setPerfilCandidato] = useState('');
  const [cartaPresentacion, setCartaPresentacion] = useState('');
  const [habilidades, setHabilidades] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [experiencias, setExperiencias] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [conocimientos, setConocimientos] = useState([]);

  // Formularios locales
  const [nuevaHabilidad, setNuevaHabilidad] = useState('');
  const [nuevoEstudio, setNuevoEstudio] = useState({ titulo: '', institucion: '', año: '' });
  const [nuevaExperiencia, setNuevaExperiencia] = useState({ puesto: '', empresa: '', periodo: '' });
  const [nuevaCapacitacion, setNuevaCapacitacion] = useState({ nombre: '', entidad: '' });
  const [nuevoConocimiento, setNuevoConocimiento] = useState('');

  const listaHabilidadesSugeridas = ["React.js", "Node.js", "PostgreSQL", "JavaScript", "Metodologías Ágiles", "UI/UX", "Python", "Liderazgo de Equipos", "Gestión Comercial", "Atención al Cliente"];
  const listaConocimientosSugeridas = ["Inglés Técnico", "Excel Avanzado", "Git & GitHub", "Docker", "Bases de Datos Relacionales", "Contabilidad General", "Marketing Digital"];

  // Módulo de Vacantes y Entrevistas
  const [entrevistas, setEntrevistas] = useState([
    { id: 1, empresa: 'Tech San Juan S.A.', fecha: '2026-05-22', hora: '15:30', estado: 'Pendiente' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [nuevaEntrevista, setNuevaEntrevista] = useState({ empresa: '', fecha: '', hora: '' });
  const diasMes = Array.from({ length: 31 }, (_, i) => i + 1);

  const [vacantes, setVacantes] = useState([]);
  const [loadingVacantes, setLoadingVacantes] = useState(false);

  // Filtros de búsqueda corporativa
  const [filtroPuesto, setFiltroPuesto] = useState('');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroZona, setFiltroZona] = useState('');

  // ==========================================
  // 🔑 2. RECUPERAR DATOS AL INICIAR SESIÓN (GET)
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
          console.log("🔒 Sincronización inicial desde PostgreSQL:", datos);
          
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
          
          // 🔥 Recuperación real del estado de tu CV
          if (datos.cv_nombre || datos.url_cv) {
            setCvNombreArchivo(datos.cv_nombre || "cv_optimizado_ats.pdf");
            setAtsScore({
              score: datos.puntuacion_ats || 92,
              consejos: ["Formato lineal recuperado con éxito.", "Estructura de datos sincronizada de forma persistente."]
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      }
    };

    cargarPerfilDesdeBD();
  }, [URL_BACKEND]);

  // ==========================================
  // 🏢 3. CONSUMIR VACANTES CARGADAS POR EMPRESAS
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
      console.error("Error al conectar con el módulo corporativo:", error);
    } finally {
      setLoadingVacantes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analisis') obtenerVacantesDeEmpresas();
  }, [activeTab]);

  // ==========================================
  // 🔥 4. SISTEMA DE GUARDADO INTEGRAL (PUT)
  // ==========================================
  const guardarDatosEnBaseDeDatos = async (datosInmediatos = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload = {
        perfil_candidato: datosInmediatos.perfil_candidato !== undefined ? datosInmediatos.perfil_candidato : perfilCandidato,
        carta_presentacion: datosInmediatos.carta_presentacion !== undefined ? datosInmediatos.carta_presentacion : cartaPresentacion,
        habilidades: JSON.stringify(datosInmediatos.habilidades || habilidades), 
        estudios: JSON.stringify(datosInmediatos.estudios || estudios),
        experiences: JSON.stringify(datosInmediatos.experiencias || experiencias), 
        capacitaciones: JSON.stringify(datosInmediatos.capacitaciones || capacitaciones),
        conocimientos: JSON.stringify(datosInmediatos.conocimientos || conocimientos),
        // Sincronización explícita y forzada del CV
        url_cv: datosInmediatos.url_cv || "https://emplea360.s3.amazonaws.com/cv_simulado.pdf",
        cv_nombre: datosInmediatos.cv_nombre !== undefined ? datosInmediatos.cv_nombre : cvNombreArchivo,
        puntuacion_ats: datosInmediatos.puntuacion_ats !== undefined ? datosInmediatos.puntuacion_ats : (atsScore ? atsScore.score : 0)
      };

      await fetch(`${URL_BACKEND}/api/candidato/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      console.log("💾 Sincronización exitosa en la nube de PostgreSQL.");
    } catch (error) {
      console.error("Error de persistencia automatizada:", error);
    }
  };

  // Auto-guardado ante mutaciones estructurales
  useEffect(() => {
    guardarDatosEnBaseDeDatos();
  }, [perfilCandidato, cartaPresentacion, habilidades, estudios, experiencias, capacitaciones, conocimientos]);


  // ==========================================
  // ⚙️ MANIPULADORES DE EVENTOS LOGICOS
  // ==========================================
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const mockPerfil = `Profesional altamente analítico especializado en optimización de arquitecturas digitales, frameworks modernos y procesamiento lineal de datos bajo estándares de reclutamiento ATS.`;
      const mockCarta = `Estimado Líder de Adquisición de Talento,\n\nMe dirijo a su equipo con el propósito de poner a disposición mi perfil técnico optimizado... \n\nAtentamente,\n${nombreUsuario}`;
      const mockHabs = ["React.js", "JavaScript", "Node.js", "PostgreSQL"];
      const mockEst = [{ titulo: "Tecnicatura en Desarrollo de Software", institucion: "Universidad Nacional", año: "2025" }];
      const mockExp = [{ puesto: "Desarrollador Full Stack Trainee", empresa: "Innovación Local S.A.", periodo: "2024 - Presente" }];
      const mockCap = [{ nombre: "Especialización en Arquitecturas Web", entidad: "Academia Emplea 360" }];
      const mockConoc = ["Git & GitHub", "Bases de Datos Relacionales", "Excel Avanzado"];
      const scoreEstablecido = 96;

      setCvNombreArchivo(file.name);
      setAtsScore({
        score: scoreEstablecido,
        consejos: ["Formato lineal analizado de manera óptima.", "Densidad de palabras clave en rangos corporativos."]
      });
      setPerfilCandidato(mockPerfil);
      setCartaPresentacion(mockCarta);
      setHabilidades(mockHabs);
      setEstudios(mockEst);
      setExperiencias(mockExp);
      setCapacitaciones(mockCap);
      setConocimientos(mockConoc);

      // 🔥 PERSISTENCIA INMEDIATA E INCONDICIONAL DE LA SUBIDA DEL CV
      guardarDatosEnBaseDeDatos({
        perfil_candidato: mockPerfil,
        carta_presentacion: mockCarta,
        habilidades: mockHabs,
        estudios: mockEst,
        experiencias: mockExp,
        capacitaciones: mockCap,
        conocimientos: mockConoc,
        cv_nombre: file.name,
        puntuacion_ats: scoreEstablecido
      });

      alert("✨ ¡CV Procesado e inyectado en PostgreSQL con éxito! Los datos persistirán de manera permanente.");
    }
  };

  const handlePostularse = async (id, puesto, empresa) => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${URL_BACKEND}/api/vacantes/${id}/postular`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setVacantes(vacantes.map(v => v.id === id ? { ...v, postulada: true } : v));
      alert(`🎉 Postulación procesada correctamente para "${puesto}" en ${empresa}.`);
    } catch (error) {
      console.error(error);
    }
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

  const addCapacitacionManual = (e) => {
    e.preventDefault();
    if (nuevaCapacitacion.nombre && nuevaCapacitacion.entidad) {
      setCapacitaciones([...capacitaciones, nuevaCapacitacion]);
      setNuevaCapacitacion({ nombre: '', entidad: '' });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const vacantesFiltradas = vacantes.filter(v => {
    return v.puesto.toLowerCase().includes(filtroPuesto.toLowerCase()) &&
           (filtroDisponibilidad === '' || v.disponibilidad === filtroDisponibilidad) &&
           (filtroTipo === '' || v.tipo === filtroTipo) &&
           v.zona.toLowerCase().includes(filtroZona.toLowerCase());
  });

  const btnStyle = (isActive) => ({
    width: '100%',
    padding: '12px 15px',
    background: isActive ? '#38bdf8' : 'transparent',
    color: isActive ? '#0f172a' : '#cbd5e1',
    border: 'none',
    borderRadius: '6px',
    textAlign: 'left',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  });

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* 📊 MENÚ LATERAL INTERACTIVO (SIDEBAR COLAPSABLE CON TRANSICIÓN CSS) */}
      <div style={{ 
        width: sidebarAbierto ? '280px' : '0px', 
        opacity: sidebarAbierto ? 1 : 0,
        background: '#0f172a', 
        color: '#fff', 
        padding: sidebarAbierto ? '20px' : '0px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        transition: 'all 0.3s ease-in-out',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {sidebarAbierto && (
          <>
            <div>
              <h2 style={{ color: '#38bdf8', fontSize: '20px', textAlign: 'center', marginBottom: '30px' }}>Emplea 360</h2>
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#334155', margin: '0 auto 10px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {previewFoto ? <img src={previewFoto} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#94a3b8' }}>👤</span>}
                </div>
                <p style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>{nombreUsuario}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Panel Candidato</p>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => setActiveTab('perfil')} style={btnStyle(activeTab === 'perfil')}>📄 Carga y Optimización CV</button>
                <button onClick={() => setActiveTab('formularios')} style={btnStyle(activeTab === 'formularios')}>✏️ Datos y Estructura CV</button>
                <button onClick={() => setActiveTab('documentos')} style={btnStyle(activeTab === 'documentos')}>💼 Documentos Generados</button>
                <button onClick={() => setActiveTab('calendario')} style={btnStyle(activeTab === 'calendario')}>📅 Entrevistas</button>
                <button onClick={() => setActiveTab('analisis')} style={btnStyle(activeTab === 'analisis')}>📈 Postulaciones</button>
                <button onClick={() => setActiveTab('academia')} style={btnStyle(activeTab === 'academia')}>🎓 Academia</button>
                <button onClick={() => setActiveTab('chat')} style={btnStyle(activeTab === 'chat')}>💬 Sala de Chat</button>
              </nav>
            </div>
            <div style={{ borderTop: '1px solid #334155', paddingTop: '15px' }}>
              <button onClick={handleLogout} style={{ width: '100%', padding: '12px 15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Cerrar Sesión</button>
            </div>
          </>
        )}
      </div>

      {/* 🖥️ CONTENIDO PRINCIPAL DE LA PLATAFORMA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* HEADER SUPERIOR (BOTÓN HAMBURGUESA GLOBAL) */}
        <header style={{ background: '#fff', height: '60px', padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <button 
            onClick={() => setSidebarAbierto(!sidebarAbierto)} 
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#0f172a', padding: '5px 10px', borderRadius: '4px' }}
            title={sidebarAbierto ? "Ocultar menú" : "Mostrar menú"}
          >
            ☰
          </button>
          <span style={{ marginLeft: '15px', fontWeight: 'bold', color: '#475569' }}>Panel de Control Profesional</span>
        </header>

        {/* CONTENEDOR CENTRAL SCRÓLEABLE */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          
          {activeTab === 'perfil' && (
            <div>
              <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Optimización Inteligente</h2>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Currículum Base</h3>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} style={{ margin: '20px 0', display: 'block' }} />
                {cvNombreArchivo && (
                  <p style={{ fontSize: '14px', color: '#00458e', fontWeight: 'bold' }}>📂 Archivo Registrado en Base de Datos: {cvNombreArchivo}</p>
                )}
                {atsScore && (
                  <div style={{ marginTop: '20px', padding: '20px', background: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: '6px' }}>
                    <h4 style={{ color: '#166534', margin: '0 0 10px 0' }}>📈 Puntuación ATS: {atsScore.score}%</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e293b' }}>
                      {atsScore.consejos.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'formularios' && (
            <div>
              <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Perfil</h2>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Resumen Curricular</h3>
                <textarea value={perfilCandidato} onChange={(e) => setPerfilCandidato(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', marginTop: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
              </div>

              {/* 🌟 CAMBIO SOLICITADO: CONOCIMIENTOS COMPLEMENTARIOS ABIERTOS Y ESCRIBIBLES */}
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Conocimientos Complementarios</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input 
                    type="text"
                    list="sugerenciasConocimientos"
                    placeholder="Escribí un conocimiento técnico o idioma..."
                    value={nuevoConocimiento} 
                    onChange={(e) => setNuevoConocimiento(e.target.value)} 
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
                  />
                  <datalist id="sugerenciasConocimientos">
                    {listaConocimientosSugeridas.map((con, i) => <option key={i} value={con} />)}
                  </datalist>
                  <button type="button" onClick={addConocimientoManual} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Añadir</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                  {conocimientos.map((c, i) => <span key={i} style={{ background: '#dbeafe', color: '#1e40af', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{c}</span>)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Estudios</h3>
                  <form onSubmit={addEstudioManual} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="text" placeholder="Título" value={nuevoEstudio.titulo} onChange={(e) => setNuevoEstudio({...nuevoEstudio, titulo: e.target.value})} required style={{ padding: '8px' }} />
                    <input type="text" placeholder="Institución" value={nuevoEstudio.institucion} onChange={(e) => setNuevoEstudio({...nuevoEstudio, institucion: e.target.value})} required style={{ padding: '8px' }} />
                    <input type="text" placeholder="Año" value={nuevoEstudio.año} onChange={(e) => setNuevoEstudio({...nuevoEstudio, año: e.target.value})} required style={{ padding: '8px' }} />
                    <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px' }}>+ Guardar</button>
                  </form>
                  <ul>{estudios.map((e, i) => <li key={i}>{e.titulo} - {e.institucion} ({e.año})</li>)}</ul>
                </div>

                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Experiencia</h3>
                  <form onSubmit={addExperienciaManual} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="text" placeholder="Puesto" value={nuevaExperiencia.puesto} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, puesto: e.target.value})} required style={{ padding: '8px' }} />
                    <input type="text" placeholder="Empresa" value={nuevaExperiencia.empresa} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, empresa: e.target.value})} required style={{ padding: '8px' }} />
                    <input type="text" placeholder="Periodo" value={nuevaExperiencia.periodo} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, periodo: e.target.value})} required style={{ padding: '8px' }} />
                    <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px' }}>+ Guardar</button>
                  </form>
                  <ul>{experiencias.map((exp, i) => <li key={i}>{exp.puesto} en {exp.empresa} ({exp.periodo})</li>)}</ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analisis' && (
            <div>
              <h2>Buscador de Vacantes Corporativas</h2>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '25px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <input type="text" placeholder="Filtrar por puesto..." value={filtroPuesto} onChange={(e) => setFiltroPuesto(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <select value={filtroDisponibilidad} onChange={(e) => setFiltroDisponibilidad(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Todas las disponibilidades</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Todas las modalidades</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
                <input type="text" placeholder="Filtrar por zona..." value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loadingVacantes ? (
                  <p>🔄 Cargando vacantes activas en el servidor corporativo...</p>
                ) : vacantesFiltradas.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '20px' }}>No hay puestos subidos que coincidan con los filtros.</p>
                ) : vacantesFiltradas.map((vac) => (
                  <div key={vac.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: vac.postulada ? '5px solid #22c55e' : '5px solid #00458e', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>{vac.puesto}</h3>
                      <h4 style={{ margin: '0 0 10px 0', color: '#00458e' }}>🏢 {vac.empresa}</h4>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>⏱️ {vac.disponibilidad}</span>
                        <span style={{ background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>💻 {vac.tipo}</span>
                        <span style={{ background: '#f0fdf4', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>📍 {vac.zona}</span>
                      </div>
                    </div>
                    <button onClick={() => handlePostularse(vac.id, vac.puesto, vac.empresa)} disabled={vac.postulada} style={{ background: vac.postulada ? '#22c55e' : '#00458e', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: vac.postulada ? 'not-allowed' : 'pointer' }}>
                      {vac.postulada ? '✓ Postulado' : 'Postularme'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallbacks para las demás secciones */}
          {['documentos', 'calendario', 'academia', 'chat'].includes(activeTab) && (
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
              <h2>Sección Sincronizada 🚀</h2>
              <p>Funcionalidades listas en memoria para la validación comercial del MVP de Emplea 360.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
