import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
  const navigate = useNavigate();

  // ==========================================
  // 💾 1. DECLARACIÓN DE TODOS TUS ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('perfil'); 
  const [cvFile, setCvFile] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  
  // 🔥 NUEVO ESTADO: Guarda el nombre con el que se registró el usuario
  const [nombreUsuario, setNombreUsuario] = useState('Candidato');

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

  const [entrevistas, setEntrevistas] = useState([
    { id: 1, empresa: 'Tech San Juan S.A.', fecha: '2026-05-22', hora: '15:30', estado: 'Pendiente' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [nuevaEntrevista, setNuevaEntrevista] = useState({ empresa: '', fecha: '', hora: '' });
  const diasMes = Array.from({ length: 31 }, (_, i) => i + 1);

  // ==========================================
  // 🔑 EXTRAER EL NOMBRE DEL REGISTRO AUTOMÁTICAMENTE
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const datosDecodificados = JSON.parse(window.atob(base64));
        
        console.log("🔍 Datos reales dentro de tu token:", datosDecodificados);

        if (datosDecodificados.nombre) {
          setNombreUsuario(datosDecodificados.nombre);
        } else if (datosDecodificados.nombre_completo) {
          setNombreUsuario(datosDecodificados.nombre_completo);
        } else if (datosDecodificados.username) {
          setNombreUsuario(datosDecodificados.username);
        } else if (datosDecodificados.email) {
          setNombreUsuario(datosDecodificados.email.split('@')[0]);
        }
      } catch (error) {
        console.error("Error al decodificar el nombre del token:", error);
      }
    }
  }, []);

  // ==========================================
  // 🔥 FUNCIÓN DE PERSISTENCIA REAL EN LA NUBE
  // ==========================================
  const guardarDatosEnBaseDeDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const urlBackend = 'https://tu-proyecto-railway.up.railway.app/api/candidato/perfil'; 

      const respuesta = await fetch(urlBackend, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          perfil_candidato: perfilCandidato,
          carta_presentacion: cartaPresentacion,
          habilidades: JSON.stringify(habilidades), 
          estudios: JSON.stringify(estudios),
          experiencias: JSON.stringify(experiencias),
          capacitaciones: JSON.stringify(capacitaciones),
          conocimientos: JSON.stringify(conocimientos)
        })
      });
      
      if (respuesta.ok) {
        console.log("🔒 Datos respaldados permanentemente en PostgreSQL en Railway.");
      }
    } catch (error) {
      console.error("Error al persistir los datos:", error);
    }
  };

  useEffect(() => {
    if (habilidades.length > 0 || perfilCandidato !== '') {
      guardarDatosEnBaseDeDatos();
    }
  }, [perfilCandidato, cartaPresentacion, habilidades, estudios, experiencias, capacitaciones, conocimientos]);

  // ==========================================
  // ⚙️ FUNCIONES DE LÓGICA E INTERACCIÓN
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/');
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      setTimeout(() => {
        setAtsScore({
          score: 92,
          consejos: [
            "Excelente estructura lineal. Formato de columna única detectado.",
            "Palabras clave óptimas para el sector tecnológico / gestión.",
            "Sugerencia: Detallá un poco más tus funciones en el último empleo."
          ]
        });

        setPerfilCandidato(`Profesional proactivo orientado al desarrollo de soluciones eficientes. Mi enfoque principal está en el trabajo en equipo, la adopción de metodologías ágiles y el aporte de valor técnico al crecimiento regional desde mi rol como candidato.`);
        setCartaPresentacion(`Estimado responsable de selección,\n\nMe dirijo a usted con gran entusiasmo para presentar mi postulación a los perfiles activos de su prestigiosa organización. Tras analizar las demandas actuales del sector, considero que mis competencias técnicas y habilidades interpersonales se alinean con sus objetivos comerciales.\n\nAgradezco de antemano su consideración.\n\nAtentamente,\n${nombreUsuario}`);
        setHabilidades(["React.js", "JavaScript", "Node.js", "PostgreSQL"]);
        setEstudios([{ titulo: "Tecnicatura en Desarrollo de Software", institucion: "Universidad Nacional", año: "2025" }]);
        setExperiencias([{ puesto: "Desarrollador Full Stack Trainee", empresa: "Innovación Local S.A.", periodo: "2024 - Presente" }]);
        setCapacitaciones([{ nombre: "Especialización en Arquitecturas Web", entidad: "Academia Emplea 360" }]);
        setConocimientos(["Git & GitHub", "Bases de Datos Relacionales", "Excel Avanzado"]);

        alert("✨ ¡CV procesado con éxito! Se cargaron tus datos y la documentación automática.");
      }, 1200);
    }
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
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
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
    ventanaImpresion.document.close();
  };

  const abrirModal = () => setShowModal(true);
  const cerrarModal = () => { setShowModal(false); setNuevaEntrevista({ empresa: '', fecha: '', hora: '' }); };
  const handleAddEntrevistaSubmit = (e) => {
    e.preventDefault();
    setEntrevistas([...entrevistas, { id: Date.now(), ...nuevaEntrevista, estado: 'Pendiente' }]);
    cerrarModal();
  };
  const tieneEntrevistaElDia = (dia) => entrevistas.filter(ent => ent.fecha === `2026-05-${dia.toString().padStart(2, '0')}`);

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
            <button onClick={() => setActiveTab('academia')} style={btnStyle(activeTab === 'academia')}>🎓 Academia</button>
            <button onClick={() => setActiveTab('analisis')} style={btnStyle(activeTab === 'analisis')}>📈 Postulaciones</button>
            <button onClick={() => setActiveTab('chat')} style={btnStyle(activeTab === 'chat')}>💬 Sala de Chat</button>
          </nav>
        </div>
        <div style={{ borderTop: '1px solid #334155', paddingTop: '15px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px 15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Cerrar Sesión</button>
        </div>
      </div>

      {/* 🖥️ CONTENIDO */}
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

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Conocimientos Complementarios</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <select value={nuevoConocimiento} onChange={(e) => setNuevoConocimiento(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="">-- Seleccionar conocimiento adicional --</option>
                  {listaConocimientosSugeridas.map((con, i) => <option key={i} value={con}>{con}</option>)}
                </select>
                <button type="button" onClick={addConocimientoManual} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Añadir</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                {conocimientos.map((c, i) => <span key={i} style={{ background: '#dbeafe', color: '#1e40af', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{c}</span>)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Historial de Estudios</h3>
                <form onSubmit={addEstudioManual} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Título obtenido" value={nuevoEstudio.titulo} onChange={(e) => setNuevoEstudio({...nuevoEstudio, titulo: e.target.value})} required style={{ padding: '8px', border: '1px solid #ccc' }} />
                  <input type="text" placeholder="Institución" value={nuevoEstudio.institucion} onChange={(e) => setNuevoEstudio({...nuevoEstudio, institucion: e.target.value})} required style={{ padding: '8px', border: '1px solid #ccc' }} />
                  <input type="text" placeholder="Año" value={nuevoEstudio.año} onChange={(e) => setNuevoEstudio({...nuevoEstudio, año: e.target.value})} required style={{ padding: '8px', border: '1px solid #ccc' }} />
                  <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>+ Agregar</button>
                </form>
                <ul style={{ marginTop: '10px' }}>{estudios.map((e, i) => <li key={i}>{e.titulo} - {e.institucion} ({e.año})</li>)}</ul>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Experiencia Laboral</h3>
                <form onSubmit={addExperienciaManual} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Puesto" value={nuevaExperiencia.puesto} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, puesto: e.target.value})} required style={{ padding: '8px', border: '1px solid #ccc' }} />
                  <input type="text" placeholder="Empresa" value={nuevaExperiencia.empresa} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, empresa: e.target.value})} required style={{ padding: '8px', border: '1px solid #ccc' }} />
                  <input type="text" placeholder="Periodo" value={nuevaExperiencia.periodo} onChange={(e) => setNuevaExperiencia({...nuevaExperiencia, periodo: e.target.value})} required style={{ padding: '8px', border: '1px solid #ccc' }} />
                  <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>+ Agregar</button>
                </form>
                <ul style={{ marginTop: '10px' }}>{experiencias.map((exp, i) => <li key={i}>{exp.puesto} en {exp.empresa} ({exp.periodo})</li>)}</ul>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Capacitaciones y Cursos</h3>
              <form onSubmit={addCapacitacionManual} style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Capacitación" value={nuevaCapacitacion.nombre} onChange={(e) => setNuevaCapacitacion({...nuevaCapacitacion, nombre: e.target.value})} required style={{ flex: 1, padding: '10px', border: '1px solid #ccc' }} />
                <input type="text" placeholder="Entidad" value={nuevaCapacitacion.entidad} onChange={(e) => setNuevaCapacitacion({...nuevaCapacitacion, entidad: e.target.value})} required style={{ flex: 1, padding: '10px', border: '1px solid #ccc' }} />
                <button style={{ background: '#00458e', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer' }}>+ Añadir</button>
              </form>
              <ul style={{ marginTop: '15px' }}>{capacitaciones.map((cap, i) => <li key={i}>{cap.nombre} ({cap.entidad})</li>)}</ul>
            </div>
          </div>
        )}

        {activeTab === 'documentos' && (
          <div>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Documentación Profesional Generada</h2>
              <button onClick={descargarPdfAts} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                🖨️ Descargar CV con Filtros ATS (PDF)
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Carta de Presentación Corporativa</h3>
                <textarea value={cartaPresentacion} onChange={(e) => setCartaPresentacion(e.target.value)} rows="12" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', background: '#fafafa' }}></textarea>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3>Estructura del Perfil en Emplea 360</h3>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p><strong>Candidato:</strong> {nombreUsuario}</p>
                  <p><strong>Resumen:</strong> {perfilCandidato}</p>
                  <p><strong>Habilidades:</strong> {habilidades.join(' · ')}</p>
                  <p><strong>Conocimientos:</strong> {conocimientos.join(' · ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendario' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Mis Videollamadas Agendadas</h2>
              <button onClick={abrirModal} style={{ background: '#00458e', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Agregar Entrevista</button>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th>Empresa</th><th>Fecha</th><th>Hora</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {entrevistas.map((ent) => (
                    <tr key={ent.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{ent.empresa}</td><td>{ent.fecha}</td><td>{ent.hora} Hs</td><td><span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px' }}>{ent.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '12px' }}>
              <h3 style={{ textAlign: 'center' }}>Mayo 2026</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
                <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {diasMes.map((dia) => {
                  const evs = tieneEntrevistaElDia(dia);
                  return (
                    <div key={dia} style={{ minHeight: '80px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: evs.length > 0 ? '#eff6ff' : '#fff' }}>
                      <span>{dia}</span>
                      {evs.map((e, i) => <div key={i} style={{ background: '#00458e', color: '#fff', fontSize: '9px', padding: '2px', borderRadius: '3px' }}>⏰ {e.hora}</div>)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academia' && ( <div><h2>Academia de Habilidades</h2><p>Próximamente cursos adaptados al mercado de San Juan.</p></div> )}
        {activeTab === 'analisis' && ( <div><h2>Análisis de mis Postulaciones</h2><p>Estadísticas detalladas de visualizaciones.</p></div> )}
        {activeTab === 'chat' && ( <div><h2>Canal de Comunicación Directa</h2><p>Bandeja de entrada vacía.</p></div> )}

      </div>

      {/* MODAL AGREGAR ENTREVISTA */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleAddEntrevistaSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '420px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#00458e', textAlign: 'center' }}>Nueva Entrevista</h3>
            <div style={{ marginBottom: '15px' }}><label>Empresa</label><input type="text" required onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, empresa: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div style={{ marginBottom: '15px' }}><label>Fecha</label><input type="date" required onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, fecha: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div style={{ marginBottom: '20px' }}><label>Hora</label><input type="time" required onChange={(e) => setNuevaEntrevista({...nuevaEntrevista, hora: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} /></div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={cerrarModal} style={{ flex: 1, padding: '12px', background: '#94a3b8', border: 'none', borderRadius: '6px', color: '#fff' }}>Cancelar</button>
              <button type="submit" style={{ flex: 1, padding: '12px', background: '#22c55e', border: 'none', borderRadius: '6px', color: '#fff' }}>Guardar</button>
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
});
