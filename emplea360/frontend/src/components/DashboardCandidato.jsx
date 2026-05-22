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
  
  // Estado para el video de presentación del candidato
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
    } finally {
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
      alert("⚠️ Hubo un inconveniente al guardar los datos en el servidor. Si cargaste una foto o un video real muy pesado, te sugerimos guardar primero los campos de texto estructurados.");
    }
  };

  // ==========================================
  // ⚙️ AUTOMATIZACIONES DE EXTRACCIÓN Y ATS
  // ==========================================
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvNombreArchivo(file.name);
      
      // 🚀 1. EXTRACCIÓN AUTOMÁTICA DE DATOS INTEGRAL
      const perfilSimulado = `Profesional con visión integral y analítica orientada al desarrollo de flujos eficientes, arquitectura de software limpia y adopción de metodologías ágiles. Experiencia demostrable liderando implementaciones técnicas alineadas a objetivos de negocio escalables.`;
      
      const habilidadesSimuladas = ["React.js", "JavaScript", "Node.js", "PostgreSQL", "Metodologías Ágiles", "API REST", "Git & GitHub"];
      
      const estudiosSimulados = [
        { titulo: "Ingeniería en Sistemas de Información", institucion: "Universidad Tecnológica Nacional", año: "2025" }
      ];
      
      const experienciasSimuladas = [
        { puesto: "Desarrollador Backend / Full Stack", empresa: "Cuyo Software Labs", periodo: "2024 - 2026" }
      ];

      // 📝 2. GENERADOR AUTOMÁTICO DE CARTA DE PRESENTACIÓN
      const cartaSimulada = `Estimado Responsable de Selección,\n\nPor medio de la presente, me pongo en contacto con ustedes con el propósito de presentar mi candidatura a las búsquedas vigentes de su organización. Mi perfil ha sido optimizado y validado con herramientas de compatibilidad ATS, asegurando que mis habilidades en desarrollo e ingeniería se correspondan con los criterios de alta demanda del sector.\n\nConsidero que mi trayectoria y competencias se alinean estrechamente con sus valores operativos de innovación y crecimiento continuo. Agradezco de antemano el tiempo dedicado a evaluar este Currículum Base.\n\nAtentamente,\n${nombreUsuario}`;

      // Actualizar todos los estados en cadena
      setPerfilCandidato(perfilSimulado);
      setHabilidades(habilidadesSimuladas);
      setEstudios(estudiosSimulados);
      setExperiencias(experienciasSimuladas);
      setCartaPresentacion(cartaSimulada);

      // Asignar el score ATS
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
      reader.onloadend = () => setPreviewFoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 🎥 CONTROLADOR DEL VIDEO DE PRESENTACIÓN
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUrl(reader.result); // Base64 o URL temporal
        alert("🎥 ¡Video de presentación procesado con éxito! Se previsualizará en tu sección.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostularse = (id, puesto, empresa) => {
    setVacantes(vacantes.map(v => v.id === id ? { ...v, postulada: true } : v));
    alert(`🎉 ¡Te postulaste a "${puesto}" en ${empresa}!`);
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
    vent.document.write(`<html><head><title>CV Optimizado ATS - ${nombreUsuario}</title></head><body style="font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6;"><h1 style="color: #00458e; border-bottom: 2px solid #00458e; margin-bottom: 5px;">${nombreUsuario.toUpperCase()}</h1><p style="color: #64748b; margin-top: 0;">Perfil Verificado por Filtros Inteligentes ATS (Score: 92%)</p><hr/><h3>RESUMEN PROFESIONAL</h3><p>${perfilCandidato}</p><h3>HABILIDADES CLAVE EXTRAÍDAS</h3><p>${habilidades.join(' • ')}</p><h3>HISTORIAL ACADÉMICO</h3><ul>${estudios.map(e => `<li><strong>${e.titulo}</strong> en ${e.institucion} (${e.año})</li>`).join('')}</ul><h3>EXPERIENCIA LABORAL</h3><ul>${experiencias.map(exp => `<li><strong>${exp.puesto}</strong> - ${exp.empresa} (${exp.periodo})</li>`).join('')}</ul><script>window.print();</script></body></html>`);
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

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* SIDEBAR COLAPSABLE CON PESTAÑAS ORIGINALES */}
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
                  <h3>Foto de Perfil Corporativa</h3>
                  <input type="file" accept="image/*" onChange={handleFotoChange} style={{ marginTop: '10px' }} />
                  {previewFoto && <p style={{ color: '#22c55e', fontSize: '13px', marginTop: '5px' }}>✓ Foto de perfil vinculada.</p>}
                </div>

                {/* 🎥 MÓDULO DE VIDEO PRESENTACIÓN */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Video de Presentación del Postulante</h3>
                  <input type="file" accept="video/*" onChange={handleVideoChange} style={{ marginTop: '10px' }} />
                  {videoUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <video src={videoUrl} controls style={{ width: '100%', maxHeight: '110px', borderRadius: '6px', background: '#000' }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <h3>Arrastrá o cargá tu Currículum Base</h3>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} style={{ marginTop: '10px' }} />
                {cvNombreArchivo && <p style={{ fontSize: '13px', color: '#00458e', fontWeight: 'bold', marginTop: '5px' }}>📂 Procesado: {cvNombreArchivo}</p>}
                
                {atsScore && (
                  <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #22c55e', marginTop: '20px' }}>
                    <h4 style={{ color: '#166534', margin: '0 0 5px 0' }}>📈 Puntuación del Robot ATS: {atsScore.score}%</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1e293b' }}>
                      {atsScore.consejos.map((c, i) => <li key={i} style={{ marginTop: '4px' }}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* 📊 DOCUMENTO Y REPORTE DE FILTROS ATS */}
              {cvNombreArchivo && (
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: '#0f172a', margin: 0 }}>🛠️ Análisis de Filtros Estructurados ATS</h3>
                    <button onClick={descargarPdfAts} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>🖨️ Exportar Métricas</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    <div style={{ padding: '15px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#166534' }}>Estructura Lineal</h5>
                      <span style={{ fontSize: '18px' }}>✅ Cumple</span>
                    </div>
                    <div style={{ padding: '15px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#166534' }}>Palabras Clave</h5>
                      <span style={{ fontSize: '18px' }}>✅ Optimizado</span>
                    </div>
                    <div style={{ padding: '15px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#166534' }}>Datos de Contacto</h5>
                      <span style={{ fontSize: '18px' }}>✅ Mapeados</span>
                    </div>
                    <div style={{ padding: '15px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fef08a', textAlign: 'center' }}>
                      <h5 style={{ margin: '0 0 5px 0', color: '#854d0e' }}>Formato Archivo</h5>
                      <span style={{ fontSize: '18px' }}>⚠️ Editable</span>
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
                <h3>Resumen Profesional (Autocompletado Automatizado)</h3>
                <textarea value={perfilCandidato} onChange={(e) => setPerfilCandidato(e.target.value)} rows="4" style={{ width: '100%', padding: '10px', marginTop: '10px', fontSize: '14px' }} placeholder="Subí tu CV base para autocompletar esta sección..."></textarea>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Habilidades del Candidato (Extraídas Automáticamente)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {habilidades.length === 0 ? <p style={{ fontSize: '13px', color: '#64748b' }}>Ninguna habilidad extraída aún.</p> : habilidades.map((h, i) => (
                    <span key={i} style={{ background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>{h}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Estudios Extraídos</h3>
                  <ul>{estudios.map((e, i) => <li key={i}><strong>{e.titulo}</strong> - {e.institucion} ({e.año})</li>)}</ul>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <h3>Experiencias Laborales Mapeadas</h3>
                  <ul>{experiencias.map((exp, i) => <li key={i}><strong>{exp.puesto}</strong> en {exp.empresa} ({exp.periodo})</li>)}</ul>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: DOCUMENTOS GENERADOS */}
          {activeTab === 'documentos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Carta de Presentación (Autogenerada)</h2>
                <div>
                  <button onClick={handleGuardarManual} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginRight: '10px' }}>💾 Guardar</button>
                  <button onClick={descargarPdfAts} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Imprimir CV Completo (PDF)</button>
                </div>
              </div>
              <textarea value={cartaPresentacion} onChange={(e) => setCartaPresentacion(e.target.value)} rows="14" style={{ width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #ccc', background: '#fafafa', fontSize: '14px', lineHeight: '1.6' }} placeholder="La carta se redactará automáticamente al subir tu archivo CV Base en la pestaña inicial..."></textarea>
            </div>
          )}

          {/* RESTO DE PESTAÑAS (ENTREVISTAS / POSTULACIONES) */}
          {activeTab === 'calendario' && (
            <div>
              <h2>Mis Videollamadas Agendadas</h2>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '15px' }}>
                <p>Calendario y control de entrevistas disponible de Mayo 2026.</p>
              </div>
            </div>
          )}

          {activeTab === 'analisis' && (
            <div>
              <h2>Postulaciones y Vacantes Corporativas</h2>
              <p>Buscador de ofertas laborales integrado.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
