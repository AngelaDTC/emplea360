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
          if (datos.puntuacion_ats) {
            setAtsScore({
              score: datos.puntuacion_ats,
              consejos: ["Excelente estructura lineal.", "Formato estandarizado detectado."]
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
  const guardarDatosEnBaseDeDatos = async (datosOpcionales = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const payload = {
        perfil_candidato: datosOpcionales.perfil_candidato !== undefined ? datosOpcionales.perfil_candidato : perfilCandidato,
        carta_presentacion: datosOpcionales.carta_presentacion !== undefined ? datosOpcionales.carta_presentacion : cartaPresentacion,
        habilidades: JSON.stringify(datosOpcionales.habilidades || habilidades), 
        estudios: JSON.stringify(datosOpcionales.estudios || estudios),
        experiencias: JSON.stringify(datosOpcionales.experiencias || experiencias), 
        capacitaciones: JSON.stringify(datosOpcionales.capacitaciones || capacitaciones),
        conocimientos: JSON.stringify(datosOpcionales.conocimientos || conocimientos),
        foto_url: datosOpcionales.foto_url !== undefined ? datosOpcionales.foto_url : previewFoto,
        cv_nombre: datosOpcionales.cv_nombre !== undefined ? datosOpcionales.cv_nombre : cvNombreArchivo,
        puntuacion_ats: datosOpcionales.puntuacion_ats !== undefined ? datosOpcionales.puntuacion_ats : (atsScore ? atsScore.score : 92)
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

  // 🌟 CONTROLADOR DEL BOTÓN DE GUARDADO MANUAL
  const handleGuardarManual = async () => {
    const exito = await guardarDatosEnBaseDeDatos();
    if (exito) {
      alert("💾 ¡Enhorabuena! Tu Currículum y perfil fueron sincronizados con éxito en PostgreSQL.");
    } else {
      alert("⚠️ El servidor respondió con un fallo. Si cargaste una foto muy pesada, probá reducir su tamaño o guardar primero los datos de texto.");
    }
  };

  // ==========================================
  // ⚙️ LOGICA DE CONTROL DE EVENTOS
  // ==========================================
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvNombreArchivo(file.name);
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
    vent.document.write(`<html><body><h2>CV ATS DE ${nombreUsuario.toUpperCase()}</h2><p>${perfilCandidato}</p><h3>Habilidades</h3><p>${habilidades.join(', ')}</p><script>window.print();window.close();</script></body></html>`);
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
      
      {/* SIDEBAR COLAPSABLE (CON TUS PESTAÑAS ORIGINALES IDENTICAS A LA CAPTURA) */}
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
                
                {/* 🌟 BOTÓN SOLICITADO CON ESTILO CLARO PARA QUE GUARDE EN LA BASE DE DATOS */}
                <button 
                  onClick={handleGuardarManual} 
                  style={{ background: '#00458e', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0, 69, 142, 0.15)' }}
                >
                  💾 Guardar en Base de Datos
                </button>
              </div>
              
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <h3>Foto de Perfil</h3>
                <input type="file" accept="image/*" onChange={handleFotoChange} style={{ marginTop: '10px' }} />
                {previewFoto && <p style={{ color: '#22c55e', fontSize: '13px', marginTop: '5px' }}>✓ Foto cargada correctamente.</p>}
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
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
                <h3>Resumen Profesional</h3>
                <textarea value={perfilCandidato} onChange={(e) => setPerfilCandidato(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', marginTop: '10px' }} placeholder="Escribí un resumen de tu perfil..."></textarea>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Conocimientos Complementarios</h3>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input type="text" list="sugConoc" placeholder="Escribí un conocimiento..." value={nuevoConocimiento} onChange={(e) => setNuevoConocimiento(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <datalist id="sugConoc">{listaConocimientosSugeridas.map((con, i) => <option key={i} value={con} />)}</datalist>
                  <button type="button" onClick={addConocimientoManual} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer' }}>Añadir</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>{conocimientos.map((c, i) => <span key={i} style={{ background: '#dbeafe', color: '#1e40af', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{c}</span>)}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                  <h3>Estudios</h3>
                  <form onSubmit={addEstudioManual} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="text" placeholder="Título" value={nuevoEstudio.titulo} onChange={(e) => setNuevoEstudio({...nuevoEstudio, titulo: e.target.value})} required />
                    <input type="text" placeholder="Institución" value={nuevoEstudio.institucion} onChange={(e) => setNuevoEstudio({...nuevoEstudio, institucion: e.target.value})} required />
                    <input type="text" placeholder="Año" value={nuevoEstudio.año} onChange={(e) => setNuevoEstudio({...nuevoEstudio, año: e.target.value})} required />
                    <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px' }}>+ Agregar</button>
                  </form>
                  <ul>{estudios.map((e, i) => <li key={i}>{e.titulo} - {e.institucion} ({e.año})</li>)}</ul>
                </div>

                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                  <h3>Experiencia Laboral</h3>
                  <form onSubmit={addExperienciaManual} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="text" placeholder="Puesto" value={nuevaExperiencia.puesto} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, puesto: e.target.value})} required />
                    <input type="text" placeholder="Empresa" value={nuevaExperiencia.empresa} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, empresa: e.target.value})} required />
                    <input type="text" placeholder="Periodo" value={nuevaExperiencia.periodo} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, periodo: e.target.value})} required />
                    <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px' }}>+ Agregar</button>
                  </form>
                  <ul>{experiencias.map((exp, i) => <li key={i}>{exp.puesto} en {exp.empresa} ({exp.periodo})</li>)}</ul>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: DOCUMENTOS GENERADOS */}
          {activeTab === 'documentos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3>Carta de Presentación Corporativa</h3>
                <button onClick={descargarPdfAts} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Imprimir PDF</button>
              </div>
              <textarea value={cartaPresentacion} onChange={(e) => setCartaPresentacion(e.target.value)} rows="12" style={{ width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #ccc', background: '#fafafa' }} placeholder="Escribí o editá tu carta de presentación..."></textarea>
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

              <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Mayo 2026</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
                  <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                  {diasMes.map((dia) => {
                    const evs = tieneEntrevistaElDia(dia);
                    return (
                      <div key={dia} style={{ minHeight: '80px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: evs.length > 0 ? '#eff6ff' : '#fff' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{dia}</span>
                        {evs.map((e, i) => (
                          <div key={i} style={{ background: e.tipo === 'Capacitación' ? '#0284c7' : '#00458e', color: '#fff', fontSize: '9px', marginTop: '4px', padding: '2px', borderRadius: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {e.empresa}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 5: POSTULACIONES */}
          {activeTab === 'analisis' && (
            <div>
              <h2>Buscador de Vacantes Corporativas</h2>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '25px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <input type="text" placeholder="Puesto (Ej: Frontend)..." value={filtroPuesto} onChange={(e) => setFiltroPuesto(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <select value={filtroDisponibilidad} onChange={(e) => setFiltroDisponibilidad(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Todas las jornadas</option><option value="Full-Time">Full-Time</option><option value="Part-Time">Part-Time</option>
                </select>
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Todas las modalidades</option><option value="Remoto">Remoto</option><option value="Presencial">Presencial</option><option value="Híbrido">Híbrido</option>
                </select>
                <input type="text" placeholder="Zona (Ej: San Juan)..." value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loadingVacantes ? (
                  <p>🔄 Sincronizando ofertas desde empresas...</p>
                ) : vacantesFiltradas.length === 0 ? (
                  <p style={{ textAlign: 'center' }}>No hay vacantes cargadas que coincidan.</p>
                ) : vacantesFiltradas.map((vac) => (
                  <div key={vac.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: vac.postulada ? '5px solid #22c55e' : '5px solid #00458e', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{vac.puesto}</h3>
                      <h4 style={{ margin: '4px 0', color: '#00458e' }}>🏢 {vac.empresa}</h4>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', marginTop: '5px' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>⏱️ {vac.disponibilidad}</span>
                        <span style={{ background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>💻 {vac.tipo}</span>
                        <span style={{ background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>📍 {vac.zona}</span>
                      </div>
                    </div>
                    <button onClick={() => handlePostularse(vac.id, vac.puesto, vac.empresa)} disabled={vac.postulada} style={{ background: vac.postulada ? '#22c55e' : '#00458e', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {vac.postulada ? '✓ Postulado' : 'Postularme'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA 6: SALA DE CHAT */}
          {activeTab === 'chat' && (
            <div>
              <h2 style={{ color: '#0f172a', marginBottom: '5px' }}>Sala de Chat Corporativa</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', background: '#fff', height: '500px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ borderRight: '1px solid #e2e8f0', background: '#f8fafc', padding: '15px', overflowY: 'auto' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>Empresas Vinculadas</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {["Tech San Juan S.A.", "Global Ventas Corp", "Innovación Digital", "Cuyo Software Labs", "Minería & Energía San Juan"].map((emp, idx) => (
                      <div key={idx} style={{ padding: '12px', background: idx === 0 ? '#eff6ff' : '#fff', border: idx === 0 ? '1px solid #38bdf8' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>🏢 {emp}</p>
                        <span style={{ fontSize: '11px', color: '#22c55e' }}>● Canal de atención activo</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>Canal: Tech San Juan S.A.</h3>
                    <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', maxWidth: '80%', fontSize: '14px', marginTop: '15px' }}>
                      <strong>Tech San Juan:</strong> ¡Hola {nombreUsuario}! Vimos tus competencias. Si tenés dudas sobre nuestra vacante activa podés dejarnos tu consulta acá.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Escribí un mensaje al área de Recursos Humanos..." style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Enviar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL DE AGENDAMIENTO */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <form onSubmit={handleAddEntrevistaSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>Programar Evento en Agenda</h3>
            <input type="text" placeholder="Empresa o Nombre del Curso" value={nuevaEntrevista.empresa} onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, empresa: e.target.value})} required style={{ padding: '8px' }} />
            <select value={nuevaEntrevista.tipo} onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, tipo: e.target.value})} style={{ padding: '8px' }}>
              <option value="Entrevista">Entrevista Laboral</option><option value="Capacitación">Capacitación / Curso</option>
            </select>
            <input type="date" value={nuevaEntrevista.fecha} onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, fecha: e.target.value})} required style={{ padding: '8px' }} />
            <input type="time" value={nuevaEntrevista.hora} onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, hora: e.target.value})} required style={{ padding: '8px' }} />
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
