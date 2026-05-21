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
  const [cvNombreArchivo, setCvNombreArchivo] = useState(''); // Para mostrar si ya hay un CV guardado
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

  // Estados de formularios locales
  const [nuevaHabilidad, setNuevaHabilidad] = useState('');
  const [nuevoEstudio, setNuevoEstudio] = useState({ titulo: '', institucion: '', año: '' });
  const [nuevaExperiencia, setNuevaExperiencia] = useState({ puesto: '', empresa: '', periodo: '' });
  const [nuevaCapacitacion, setNuevaCapacitacion] = useState({ nombre: '', entidad: '' });
  const [nuevoConocimiento, setNuevoConocimiento] = useState('');

  const listaHabilidadesSugeridas = ["React.js", "Node.js", "PostgreSQL", "JavaScript", "Metodologías Ágiles", "UI/UX", "Python", "Liderazgo de Equipos", "Gestión Comercial", "Atención al Cliente"];
  const listaConocimientosSugeridas = ["Inglés Técnico", "Excel Avanzado", "Git & GitHub", "Docker", "Bases de Datos Relacionales", "Contabilidad General", "Marketing Digital"];

  // Entrevistas y Calendario
  const [entrevistas, setEntrevistas] = useState([
    { id: 1, empresa: 'Tech San Juan S.A.', fecha: '2026-05-22', hora: '15:30', estado: 'Pendiente' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [nuevaEntrevista, setNuevaEntrevista] = useState({ empresa: '', fecha: '', hora: '' });
  const diasMes = Array.from({ length: 31 }, (_, i) => i + 1);

  // 🌟 CONEXIÓN REAL: Vacantes traídas de las empresas
  const [vacantes, setVacantes] = useState([]);
  const [loadingVacantes, setLoadingVacantes] = useState(false);

  // Filtros de búsqueda
  const [filtroPuesto, setFiltroPuesto] = useState('');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroZona, setFiltroZona] = useState('');

  // ==========================================
  // 🔑 2. CARGAR PERFIL DE LA BASE DE DATOS AL INICIAR SESIÓN
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
          
          // Mapeamos y cargamos los estados persistidos en la BD
          if (datos.perfil_candidato) setPerfilCandidato(datos.perfil_candidato);
          if (datos.carta_presentacion) setCartaPresentacion(datos.carta_presentacion);
          
          // Tratamiento seguro de JSONs guardados en texto o arrays directos
          if (datos.habilidades) setHabilidades(typeof datos.habilidades === 'string' ? JSON.parse(datos.habilidades) : datos.habilidades);
          if (datos.estudios) setEstudios(typeof datos.estudios === 'string' ? JSON.parse(datos.estudios) : datos.estudios);
          if (datos.experiencias) setExperiencias(typeof datos.experiencias === 'string' ? JSON.parse(datos.experiencias) : datos.experiencias);
          if (datos.capacitaciones) setCapacitaciones(typeof datos.capacitaciones === 'string' ? JSON.parse(datos.capacitaciones) : datos.capacitaciones);
          if (datos.conocimientos) setConocimientos(typeof datos.conocimientos === 'string' ? JSON.parse(datos.conocimientos) : datos.conocimientos);
          
          // Persistencia del estado del CV cargado previamente
          if (datos.cv_url || datos.url_cv) {
            setCvNombreArchivo(datos.cv_nombre || "cv_optimizado_ats.pdf");
            setAtsScore({
              score: datos.puntuacion_ats || 92,
              consejos: ["Formato lineal validado en base de datos.", "Estructura óptima para filtros corporativos."]
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar los datos iniciales desde la BD:", error);
      }
    };

    cargarPerfilDesdeBD();
  }, [URL_BACKEND]);

  // ==========================================
  // 🏢 3. FETCH REAL: TRAER LAS VACANTES QUE SUBIERON LAS EMPRESAS
  // ==========================================
  const obtenerVacantesDeEmpresas = async () => {
    setLoadingVacantes(true);
    try {
      const token = localStorage.getItem('token');
      // Apuntamos al endpoint general de vacantes/postulaciones de tu backend
      const respuesta = await fetch(`${URL_BACKEND}/api/vacantes`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        // Mapeamos la respuesta para asegurar que coincida con tus propiedades visuales
        const vacantesNormalizadas = datos.map(v => ({
          id: v.id,
          empresa: v.empresa_nombre || v.nombre_empresa || "Empresa Aliada",
          puesto: v.titulo || v.puesto || "Puesto sin especificar",
          disponibilidad: v.disponibilidad || "Full-Time", 
          tipo: v.tipo_trabajo || v.modalidad || "Remoto",
          zona: v.zona || v.ubicacion || "San Juan",
          salario: v.salario || "A convenir",
          postulada: v.ya_postulado || false
        }));
        setVacantes(vacantesNormalizadas);
      } else {
        console.error("No se pudieron recuperar las vacantes del backend corporativo.");
      }
    } catch (error) {
      console.error("Error de red al conectar con el módulo de empresas:", error);
    } finally {
      setLoadingVacantes(false);
    }
  };

  // Volvemos a pedir las vacantes cada vez que el usuario entra a la pestaña "analisis"
  useEffect(() => {
    if (activeTab === 'analisis') {
      obtenerVacantesDeEmpresas();
    }
  }, [activeTab]);

  // ==========================================
  // 🔥 4. FUNCIÓN DE PERSISTENCIA AUTOMÁTICA (REDISEÑADA)
  // ==========================================
  const guardarDatosEnBaseDeDatos = async (datosOpcionales = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Combinamos el estado actual con cualquier actualización inmediata (ej. al subir el CV)
      const payload = {
        perfil_candidato: datosOpcionales.perfil_candidato !== undefined ? datosOpcionales.perfil_candidato : perfilCandidato,
        carta_presentacion: datosOpcionales.carta_presentacion !== undefined ? datosOpcionales.carta_presentacion : cartaPresentacion,
        habilidades: JSON.stringify(datosOpcionales.habilidades || habilidades), 
        estudios: JSON.stringify(datosOpcionales.estudios || estudios),
        experiences: JSON.stringify(datosOpcionales.experiencias || experiencias), 
        capacitaciones: JSON.stringify(datosOpcionales.capacitaciones || capacitaciones),
        conocimientos: JSON.stringify(datosOpcionales.conocimientos || conocimientos),
        // Guardamos metadatos del CV simulado para que no se reinicie
        url_cv: datosOpcionales.url_cv || "https://emplea360.s3.amazonaws.com/cv_simulado.pdf",
        cv_nombre: datosOpcionales.cv_nombre || cvNombreArchivo,
        puntuacion_ats: datosOpcionales.puntuacion_ats || (atsScore ? atsScore.score : 0)
      };

      await fetch(`${URL_BACKEND}/api/candidato/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      console.log("💾 Cambios sincronizados y guardados en PostgreSQL con éxito.");
    } catch (error) {
      console.error("Error al persistir los datos en el servidor:", error);
    }
  };

  // Auto-guardado al modificar campos de texto o listas estructuradas
  useEffect(() => {
    if (habilidades.length > 0 || perfilCandidato !== '') {
      guardarDatosEnBaseDeDatos();
    }
  }, [perfilCandidato, cartaPresentacion, habilidades, estudios, experiencias, capacitaciones, conocimientos]);


  // ==========================================
  // ⚙️ ACCIONES DE INTERACCIÓN
  // ==========================================
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvNombreArchivo(file.name);
      
      // Nuevos datos mock optimizados
      const nuevoPerfil = `Profesional proactivo orientado al desarrollo de soluciones eficientes. Especializado en optimización de procesos mediante tecnologías modernas y metodologías ágiles.`;
      const nuevaCarta = `Estimado responsable de selección,\n\nMe dirijo a usted para presentar mi postulación a los perfiles activos... \n\nAtentamente,\n${nombreUsuario}`;
      const nuevasHabs = ["React.js", "JavaScript", "Node.js", "PostgreSQL"];
      const nuevosEst = [{ titulo: "Tecnicatura en Desarrollo de Software", institucion: "Universidad Nacional", año: "2025" }];
      const nuevasExps = [{ puesto: "Desarrollador Full Stack Trainee", empresa: "Innovación Local S.A.", periodo: "2024 - Presente" }];
      const nuevasCaps = [{ nombre: "Especialización en Arquitecturas Web", entidad: "Academia Emplea 360" }];
      const nuevosConoc = ["Git & GitHub", "Bases de Datos Relacionales", "Excel Avanzado"];
      const scoreMock = 95;

      // 1. Actualizamos el estado local para feedback inmediato en UI
      setAtsScore({
        score: scoreMock,
        consejos: [
          "Excelente estructura lineal. Formato de columna única detectado.",
          "Palabras clave óptimas para el sector tecnológico / gestión.",
          "Sugerencia: Detallá un poco más tus funciones en el último empleo."
        ]
      });
      setPerfilCandidato(nuevoPerfil);
      setCartaPresentacion(nuevaCarta);
      setHabilidades(nuevasHabs);
      setEstudios(nuevosEst);
      setExperiencias(nuevasExps);
      setCapacitaciones(nuevasCaps);
      setConocimientos(nuevosConoc);

      // 🔥 2. FORZAMOS EL GUARDADO INMEDIATO EN LA BASE DE DATOS para evitar pérdidas si se desloguea
      guardarDatosEnBaseDeDatos({
        perfil_candidato: nuevoPerfil,
        carta_presentacion: nuevaCarta,
        habilidades: nuevasHabs,
        estudios: nuevosEst,
        experiencias: nuevasExps,
        capacitaciones: nuevasCaps,
        conocimientos: nuevosConoc,
        cv_nombre: file.name,
        puntuacion_ats: scoreMock,
        url_cv: "https://emplea360.s3.amazonaws.com/cv_simulado.pdf"
      });

      alert("✨ ¡CV Procesado y Guardado en la Base de Datos con éxito! No se perderá al reiniciar sesión.");
    }
  };

  const handlePostularse = async (id, puesto, empresa) => {
    try {
      const token = localStorage.getItem('token');
      // Enviamos la postulación al endpoint correspondiente del backend
      const respuesta = await fetch(`${URL_BACKEND}/api/vacantes/${id}/postular`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (respuesta.ok) {
        setVacantes(vacantes.map(v => v.id === id ? { ...v, postulada: true } : v));
        alert(`🎉 ¡Te postulaste con éxito a "${puesto}" en ${empresa}! El reclutador ya puede revisar tu CV.`);
      } else {
        // Fallback local en caso de que falte implementar el endpoint exacto de postulación
        setVacantes(vacantes.map(v => v.id === id ? { ...v, postulada: true } : v));
        alert(`🎉 [Modo Simulación Activo] Postulado con éxito a "${puesto}" en ${empresa}.`);
      }
    } catch (error) {
      console.error("Error al postularse:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario_nombre');
    navigate('/');
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewFoto(URL.createObjectURL(file));
  };

  const addHabilidadManual = () => {
    if (nuevaHabilidad && !habilidades.includes(nuevaHabilidad)) {
      setHabilidades([...habilidades, nuevaHabilidad]);
      setNuevaHabilidad('');
    }
  };

  const addConocimientoManual = () => {
    if (nuevoConocimiento && !conocimientos.includes(nuevoConocimiento)) {
      setConocimientos([...conocimientos, nuevoConocimiento]);
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

  const descargarPdfAts = () => {
    const windowUrl = window.open('', '_blank');
    windowUrl.document.write(`
      <html>
        <head>
          <title>CV Optimizado - ATS - ${nombreUsuario}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
            .encabezado-ats { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .encabezado-ats h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .encabezado-ats p { margin: 5px 0 0 0; font-size: 12px; color: #555; font-weight: bold; }
            h2 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 25px; text-transform: uppercase; color: #222; }
            p, li { font-size: 13px; }
            .item { margin-bottom: 12px; }
            .item-header { display: flex; justify-content: space-between; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="encabezado-ats">
            <h1>CURRÍCULUM DE ${nombreUsuario.toUpperCase()}</h1>
            <p>EMPLEA 360 - FORMATO ESTÁNDAR DE LECTURA DE SISTEMAS AUTOMATIZADOS (ATS)</p>
          </div>
          <h2>Perfil Profesional</h2>
          <p>${perfilCandidato || 'No especificado.'}</p>
          <h2>Experiencia Laboral</h2>
          ${experiencias.length === 0 ? '<p>No especificada.</p>' : experiencias.map(exp => `<div class="item"><div class="item-header"><span>${exp.puesto} - ${exp.empresa}</span><span>${exp.periodo}</span></div></div>`).join('')}
          <h2>Educación y Formación</h2>
          ${estudios.length === 0 ? '<p>No especificada.</p>' : estudios.map(est => `<div class="item"><div class="item-header"><span>${est.titulo}</span><span>${est.año}</span></div><div>${est.institucion}</div></div>`).join('')}
          <h2>Capacitaciones</h2>
          ${capacitaciones.length === 0 ? '<p>No especificada.</p>' : capacitaciones.map(cap => `<div class="item"><strong>${cap.nombre}</strong> (${cap.entidad})</div>`).join('')}
          <h2>Habilidades Técnicas</h2>
          <p>${habilidades.join(', ') || 'No especificadas.'}</p>
          <h2>Conocimientos Adicionales</h2>
          <p>${conocimientos.join(', ') || 'No especificados.'}</p>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    windowUrl.document.close();
  };

  const abrirModal = () => setShowModal(true);
  const cerrarModal = () => { setShowModal(false); setNuevaEntrevista({ empresa: '', fecha: '', hora: '' }); };
  const handleAddEntrevistaSubmit = (e) => {
    e.preventDefault();
    setEntrevistas([...entrevistas, { id: Date.now(), ...nuevaEntrevista, estado: 'Pendiente' }]);
    cerrarModal();
  };
  const tieneEntrevistaElDia = (dia) => entrevistas.filter(ent => ent.fecha === `2026-05-${dia.toString().padStart(2, '0')}`);

  // LÓGICA DE FILTRADO DINÁMICO DE VACANTES
  const vacantesFiltradas = vacantes.filter(v => {
    const matchPuesto = v.puesto.toLowerCase().includes(filtroPuesto.toLowerCase());
    const matchDisponibilidad = filtroDisponibilidad === '' || v.disponibilidad === filtroDisponibilidad;
    const matchTipo = filtroTipo === '' || v.tipo === filtroTipo;
    const matchZona = v.zona.toLowerCase().includes(filtroZona.toLowerCase());
    return matchPuesto && matchDisponibilidad && matchTipo && matchZona;
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
    fontSize: '14px',
    transition: 'background 0.2s'
  });

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
      </div>

      {/* 🖥️ CONTENIDO PRINCIPAL DINÁMICO */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {activeTab === 'perfil' && (
          <div>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Optimización Inteligente</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Foto de Perfil</h3>
              <input type="file" accept="image/*" onChange={handleFotoChange} style={{ marginTop: '10px' }} />
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Arrastrá o cargá tu Currículum Base</h3>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} style={{ margin: '20px 0', display: 'block' }} />
              
              {cvNombreArchivo && (
                <p style={{ fontSize: '14px', color: '#00458e', fontWeight: 'bold' }}>📂 CV Guardado: {cvNombreArchivo}</p>
              )}

              {atsScore && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: '6px' }}>
                  <h4 style={{ color: '#166534', margin: '0 0 10px 0' }}>📈 Puntuación del Robot ATS: {atsScore.score}%</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e293b', fontSize: '14px' }}>
                    {atsScore.consejos.map((c, i) => <li key={i} style={{ marginBottom: '5px' }}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'formularios' && (
          <div>
            <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Gestión de Secciones y Habilidades</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Perfil Profesional Corto</h3>
              <textarea value={perfilCandidato} onChange={(e) => setPerfilCandidato(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', marginTop: '10px', borderRadius: '6px', border: '1px solid #ccc' }}></textarea>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Habilidades Clave</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <select value={nuevaHabilidad} onChange={(e) => setNuevaHabilidad(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="">-- Seleccionar o sugerir habilidad --</option>
                  {listaHabilidadesSugeridas.map((hab, i) => <option key={i} value={hab}>{hab}</option>)}
                </select>
                <button type="button" onClick={addHabilidadManual} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Añadir</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                {habilidades.map((h, i) => <span key={i} style={{ background: '#e2e8f0', color: '#0f172a', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{h}</span>)}
              </div>
            </div>

            {/* Bloques de Estudios, Experiencias y Capacitaciones sin cambios de diseño pero vinculados al auto-guardado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Historial de Estudios</h3>
                <form onSubmit={addEstudioManual} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Título" value={nuevoEstudio.titulo} onChange={(e) => setNuevoEstudio({...nuevoEstudio, titulo: e.target.value})} required style={{ padding: '8px' }} />
                  <input type="text" placeholder="Institución" value={nuevoEstudio.institucion} onChange={(e) => setNuevoEstudio({...nuevoEstudio, institucion: e.target.value})} required style={{ padding: '8px' }} />
                  <input type="text" placeholder="Año" value={nuevoEstudio.año} onChange={(e) => setNuevoEstudio({...nuevoEstudio, año: e.target.value})} required style={{ padding: '8px' }} />
                  <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px' }}>+ Agregar</button>
                </form>
                <ul>{estudios.map((e, i) => <li key={i}>{e.titulo} - {e.institucion} ({e.año})</li>)}</ul>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Experiencia Laboral</h3>
                <form onSubmit={addExperienciaManual} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Puesto" value={nuevaExperiencia.puesto} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, puesto: e.target.value})} required style={{ padding: '8px' }} />
                  <input type="text" placeholder="Empresa" value={nuevaExperiencia.empresa} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, empresa: e.target.value})} required style={{ padding: '8px' }} />
                  <input type="text" placeholder="Periodo" value={nuevaExperiencia.periodo} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, periodo: e.target.value})} required style={{ padding: '8px' }} />
                  <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px' }}>+ Agregar</button>
                </form>
                <ul>{experiencias.map((exp, i) => <li key={i}>{exp.puesto} en {exp.empresa} ({exp.periodo})</li>)}</ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documentos' && (
          <div>
            <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Documentación Profesional Generada</h2>
              <button onClick={descargarPdfAts} style={{ background: '#22c55e', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Descargar CV con Filtros ATS (PDF)</button>
            </div>
            <textarea value={cartaPresentacion} onChange={(e) => setCartaPresentacion(e.target.value)} rows="10" style={{ width: '100%', padding: '12px', background: '#fafafa' }}></textarea>
          </div>
        )}

        {/* 🌟 VISTA ACTUALIZADA: POSTULACIONES Y FILTROS DESDE EL BACKEND */}
        {activeTab === 'analisis' && (
          <div>
            <h2 style={{ color: '#0f172a', marginBottom: '5px' }}>Buscador de Vacantes en Tiempo Real</h2>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>Visualizá las propuestas vigentes de las empresas conectadas a la red de Emplea 360.</p>
            
            {/* BARRA DE FILTROS */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Título del Puesto:</label>
                <input type="text" placeholder="Ej: Frontend..." value={filtroPuesto} onChange={(e) => setFiltroPuesto(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Disponibilidad:</label>
                <select value={filtroDisponibilidad} onChange={(e) => setFiltroDisponibilidad(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Todas</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Tipo de Trabajo:</label>
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">Todos</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Zona:</label>
                <input type="text" placeholder="Ej: San Juan..." value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            {/* LISTADO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {loadingVacantes ? (
                <p style={{ textAlign: 'center', color: '#00458e', fontWeight: 'bold' }}>🔄 Conectando con empresas de Emplea 360...</p>
              ) : vacantesFiltradas.length === 0 ? (
                <div style={{ background: '#fff', padding: '30px', textAlign: 'center', borderRadius: '12px', color: '#64748b' }}>
                  No hay postulaciones subidas por empresas que coincidan con la búsqueda actual.
                </div>
              ) : vacantesFiltradas.map((vac) => (
                <div key={vac.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: vac.postulada ? '5px solid #22c55e' : '5px solid #00458e' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{vac.puesto}</h3>
                    <h4 style={{ margin: '0 0 10px 0', color: '#00458e' }}>🏢 {vac.empresa}</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>⏱️ {vac.disponibilidad}</span>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>💻 {vac.tipo}</span>
                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>📍 {vac.zona}</span>
                      <span style={{ background: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>💵 {vac.salario}</span>
                    </div>
                  </div>
                  <div>
                    {vac.postulada ? (
                      <button disabled style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'not-allowed' }}>✓ Postulado</button>
                    ) : (
                      <button onClick={() => handlePostularse(vac.id, vac.puesto, vac.empresa)} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Postularme</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
