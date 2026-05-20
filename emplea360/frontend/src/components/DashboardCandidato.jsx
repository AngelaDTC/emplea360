import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  User, FileText, Calendar, BookOpen, BarChart2, MessageSquare, 
  Upload, Download, Plus, Sparkles, Clock 
} from 'lucide-react';

export default function DashboardCandidato() {
  const navigate = useNavigate();
  const URL_BACKEND = 'https://emplea360-production-517a.up.railway.app';

  // 1. Estados de Navegación del Menú Lateral
  const [seccionActiva, setSeccionActiva] = useState('perfil'); 

  // 2. Estados de Carga y Datos del Candidato con sus Modificadores Limpios
  const [cargando, setCargando] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState(
    () => localStorage.getItem('usuario_nombre') || 'Angela Tapias'
  );

  // 3. Estados de la Foto de Perfil
  const [previewFoto, setPreviewFoto] = useState(
    () => localStorage.getItem('usuario_foto') || null
  );

  // 4. Estados del Sistema ATS y Carga de CV Original
  const [cvFile, setCvFile] = useState(null);
  const [analizandoATS, setAnalizandoATS] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [recomendacionesATS, setRecomendacionesATS] = useState([]);

  // 5. Formulario de Datos del Perfil (CV Dinámico)
  const [perfilProfesional, setPerfilProfesional] = useState('');
  const [cartaPresentacion, setCartaPresentacion] = useState('');
  
  // Listas dinámicas editables
  const [habilidades, setHabilidades] = useState(['React.js', 'Node.js', 'JavaScript']);
  const [estudios, setEstudios] = useState(['Técnico en Sistemas - Instituto Tecnológico']);
  const [experiencias, setExperiencias] = useState(['Desarrollador Frontend (1 año) - Empresa Alfa']);
  const [capacitaciones, setCapacitaciones] = useState(['Curso de Arquitectura Limpia']);
  const [conocimientos, setConocimientos] = useState(['Metodologías Ágiles', 'REST APIs', 'Git/GitHub']);

  // Estados auxiliares para agregar inputs manualmente
  const [nuevaHabilidad, setNuevaHabilidad] = useState('');
  const [nuevoEstudio, setNuevoEstudio] = useState('');
  const [nuevaExperiencia, setNuevoExperiencia] = useState('');
  const [nuevaCapacitacion, setNuevaCapacitacion] = useState('');
  const [nuevoConocimiento, setNuevoConocimiento] = useState('');

  // Sugerencias para listas desplegables
  const sugerenciasHabilidades = ['Python', 'SQL', 'Excel Avanzado', 'Gestión de Proyectos', 'UI/UX Design', 'TypeScript', 'Docker'];
  const sugerenciasConocimientos = ['Scrum', 'Inglés Técnico', 'AWS Cloud', 'Estructuras de Datos', 'CI/CD Pipelines'];

  // 6. Estados del Calendario de Entrevistas
  const [entrevistas, setEntrevistas] = useState([
    { id: 1, empresa: 'Tech Innovators', fecha: '2026-06-15', hora: '10:00' }
  ]);
  const [mostrarModalEntrevista, setMostrarModalEntrevista] = useState(false);
  const [nuevaEmpresa, setNuevaEmpresa] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');

  // 7. Estados de Secciones Auxiliares
  const [postulacionesAnalisis] = useState([
    { puesto: 'Desarrollador React Junior', empresa: 'Tech Innovators', estado: 'Entrevista', porcentaje: 85 },
    { puesto: 'Frontend Engineer', empresa: 'Global Solutions', estado: 'En Revisión', porcentaje: 70 },
    { puesto: 'Fullstack Developer', empresa: 'Mercado Local', estado: 'Postulado', porcentaje: 95 },
  ]);

  const [chats, setChats] = useState([
    { id: 1, empresa: 'Tech Innovators (Recruiter)', ultimoMensaje: 'Hola Angela, agendamos la videollamada.', hora: 'Ayer' },
    { id: 2, empresa: 'Global Solutions', ultimoMensaje: 'Recibimos tu perfil optimizado ATS con éxito.', hora: 'Hace 3 días' }
  ]);

  // Cambiar foto de perfil
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result);
        localStorage.setItem('usuario_foto', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Escuchar la carga de archivos del CV
  const handleCvChange = (e) => {
    if (e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  // Simulación de Optimización Automatizada ATS
  const simularAnalisisATS = () => {
    if (!cvFile && perfilProfesional.length < 5) {
      alert('Por favor, primero seleccioná un archivo de CV o completá el perfil.');
      return;
    }
    setAnalizandoATS(true);
    setTimeout(() => {
      setAtsScore(95);
      setRecomendacionesATS([
        '¡Estructura optimizada! Cumple con la jerarquía estándar para escáneres ATS corporativos.',
        'Palabras clave Core (Keywords) distribuidas de forma estratégica en todo el documento.',
        'Recomendación: Exportar siempre usando el formato PDF plano generado por la plataforma.'
      ]);
      
      setPerfilProfesional(`Perfil ATS Optimizado - ${nombreUsuario}: Especialista con sólida formación técnica y competencias adaptadas a las demandas del mercado actual. Enfocada en la resolución de problemas complejos, implementación de metodologías eficientes y optimización de flujos de trabajo organizacionales.`);
      setCartaPresentacion(`Estimado Equipo de Selección,\n\nMe dirijo a ustedes con el propósito de presentar mi postulación a sus búsquedas activas. Como verán en mi CV adjunto diseñado con Filtros ATS, poseo una preparación alineada con los requisitos clave del sector, aportando competencias críticas en habilidades dinámicas y de gestión.\n\nAgradezco de antemano la lectura de mi perfil y quedo a disposición para coordinar una entrevista.\n\nAtentamente,\n${nombreUsuario}`);
      
      setHabilidades(prev => [...new Set([...prev, 'Metodologías Ágiles', 'Gestión del Tiempo', 'Resolución de Conflictos'])]);
      setConocimientos(prev => [...new Set([...prev, 'Optimización ATS', 'Sistemas ERP'])]);
      setAnalizandoATS(false);
    }, 1800);
  };

  const agregarItem = (tipo) => {
    if (tipo === 'habilidad' && nuevaHabilidad.trim() !== '') {
      if (!habilidades.includes(nuevaHabilidad.trim())) setHabilidades([...habilidades, nuevaHabilidad.trim()]);
      setNuevaHabilidad('');
    }
    if (tipo === 'estudio' && nuevoEstudio.trim() !== '') {
      setEstudios([...estudios, nuevoEstudio.trim()]);
      setNuevoEstudio('');
    }
    if (tipo === 'experiencia' && nuevoExperiencia.trim() !== '') {
      setExperiencias([...experiencias, nuevoExperiencia.trim()]);
      setNuevoExperiencia('');
    }
    if (tipo === 'capacitacion' && nuevoCapacitacion.trim() !== '') {
      setCapacitaciones([...capacitaciones, nuevoCapacitacion.trim()]);
      setNuevoCapacitacion('');
    }
    if (tipo === 'conocimiento' && nuevoConocimiento.trim() !== '') {
      if (!conocimientos.includes(nuevoConocimiento.trim())) setConocimientos([...conocimientos, nuevoConocimiento.trim()]);
      setNuevoConocimiento('');
    }
  };

  const guardarEntrevista = (e) => {
    e.preventDefault();
    if (!nuevaEmpresa || !nuevaFecha || !nuevaHora) return;
    const nueva = { id: Date.now(), empresa: nuevaEmpresa, fecha: nuevaFecha, hora: nuevaHora };
    setEntrevistas([...entrevistas, nueva]);
    setNuevaEmpresa(''); setNuevaFecha(''); setNuevaHora('');
    setMostrarModalEntrevista(false);
  };

  const descargarPdfATS = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(15, 23, 42); 
    doc.text('CV CON FILTROS ATS', 105, 20, { align: 'center' });
    doc.setFontSize(14); doc.text(nombreUsuario.toUpperCase(), 105, 30, { align: 'center' });
    doc.setDrawColor(203, 213, 225); doc.line(20, 36, 190, 36);
    
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(12); doc.text('PERFIL PROFESIONAL', 20, 44);
    doc.setFont('Helvetica', 'normal'); doc.setFontSize(10);
    const splitPerfil = doc.splitTextToSize(perfilProfesional || 'Perfil técnico en proceso de carga.', 170);
    doc.text(splitPerfil, 20, 50);
    
    let yPos = 56 + (splitPerfil.length * 5);
    doc.setFont('Helvetica', 'bold'); doc.text('KEYWORDS Y COMPETENCIAS CLAVE', 20, yPos);
    doc.setFont('Helvetica', 'normal'); doc.text(habilidades.join(' | '), 20, yPos + 6);
    
    yPos += 18;
    doc.setFont('Helvetica', 'bold'); doc.text('TRAYECTORIA LABORAL', 20, yPos);
    doc.setFont('Helvetica', 'normal');
    experiencias.forEach((exp, idx) => { doc.text(`• ${exp}`, 20, yPos + 6 + (idx * 6)); });
    
    doc.save(`CV_ATS_${nombreUsuario.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div style={dashboardLayout}>
      
      {/* MENÚ LATERAL */}
      <aside style={sidebarStyle}>
        <div>
          <div style={brandStyle}>
            <div style={logoIcon}>360</div>
            <div>
              <h2 style={brandTitle}>Emplea360</h2>
              <span style={brandSub}>Talent Portal</span>
            </div>
          </div>

          <div style={userCardNav}>
            <div style={avatarContainer}>
              {previewFoto ? (
                <img src={previewFoto} alt="Perfil" style={avatarImg} />
              ) : (
                <div style={avatarPlaceholder}>{nombreUsuario[0]}</div>
              )}
              <label style={editAvatarBadge}>
                <Upload size={12} style={{ color: '#fff' }} />
                <input type="file" accept="image/*" onChange={handleFotoChange} style={{ display: 'none' }} />
              </label>
            </div>
            <h4 style={userNameText}>{nombreUsuario}</h4>
            <p style={userRoleText}>Candidato Activo</p>
          </div>

          <nav style={navGroup}>
            <button onClick={() => setSeccionActiva('perfil')} style={seccionActiva === 'perfil' ? btnNavActive : btnNav}>
              <User size={18} /> <span>Mi Perfil Profesional</span>
            </button>
            <button onClick={() => setSeccionActiva('calendario')} style={seccionActiva === 'calendario' ? btnNavActive : btnNav}>
              <Calendar size={18} /> <span>Mis Entrevistas</span>
            </button>
            <button onClick={() => setSeccionActiva('academia')} style={seccionActiva === 'academia' ? btnNavActive : btnNav}>
              <BookOpen size={18} /> <span>Academia 360</span>
            </button>
            <button onClick={() => setSeccionActiva('analisis')} style={seccionActiva === 'analisis' ? btnNavActive : btnNav}>
              <BarChart2 size={18} /> <span>Análisis de Postulaciones</span>
            </button>
            <button onClick={() => setSeccionActiva('chat')} style={seccionActiva === 'chat' ? btnNavActive : btnNav}>
              <MessageSquare size={18} /> <span>Centro de Chat</span>
            </button>
          </nav>
        </div>

        <button onClick={() => navigate('/auth')} style={btnLogout}>Cerrar Sesión</button>
      </aside>

      {/* ÁREA PRINCIPAL DENTRO DE LA NAVEGACIÓN */}
      <main style={mainContentArea}>
        
        {seccionActiva === 'perfil' && (
          <div>
            <div style={headerSection}>
              <div>
                <h1 style={titleMain}>Tu Perfil Profesional Inteligente</h1>
                <p style={subtitleMain}>Optimizá tus datos en tiempo real para superar los filtros ATS corporativos.</p>
              </div>
              <button onClick={descargarPdfATS} style={btnDownloadPDF}>
                <Download size={18} /> Exportar CV con Filtros ATS
              </button>
            </div>

            <div style={gridTwoCols}>
              <div style={cardContainer}>
                <h3 style={cardTitleStyle}><Sparkles size={18} style={{ color: '#10b981' }} /> Optimizador ATS</h3>
                <div style={dropzoneBox}>
                  <Upload size={32} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} style={{ display: 'block', margin: '0 auto 10px auto', color: '#cbd5e1' }} />
                </div>
                <button onClick={simularAnalisisATS} disabled={analizandoATS} style={btnPrimaryAction}>
                  {analizandoATS ? 'Analizando Semántica...' : 'Escanear y Autocompletar'}
                </button>
                {atsScore && (
                  <div style={scoreResultBox}>
                    <span style={{ fontWeight: 600 }}>Puntuación: {atsScore}% Match</span>
                    <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#cbd5e1' }}>
                      {recomendacionesATS.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <div style={cardContainer}>
                <h3 style={cardTitleStyle}><FileText size={18} style={{ color: '#3b82f6' }} /> Documentación</h3>
                <textarea value={perfilProfesional} onChange={(e) => setPerfilProfesional(e.target.value)} placeholder="Resumen profesional..." style={textareaStyle} />
                <textarea value={cartaPresentacion} onChange={(e) => setCartaPresentacion(e.target.value)} placeholder="Carta de presentación..." style={{...textareaStyle, marginTop: '10px'}} />
              </div>
            </div>

            <div style={{ ...cardContainer, marginTop: '24px' }}>
              <h3 style={cardTitleStyle}>Secciones Dinámicas</h3>
              <div style={gridThreeCols}>
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Habilidades</h4>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                    <select onChange={(e) => setNuevaHabilidad(e.target.value)} value={nuevaHabilidad} style={selectInputStyle}>
                      <option value="">-- Buscar --</option>
                      {sugerenciasHabilidades.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                    </select>
                    <input type="text" value={nuevaHabilidad} onChange={(e) => setNuevaHabilidad(e.target.value)} placeholder="Otra..." style={inlineInput} />
                    <button onClick={() => agregarItem('hability')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <div style={tagCloud}>
                    {habilidades.map((h, i) => <span key={i} style={tagChip}>{h}</span>)}
                  </div>
                </div>

                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Experiencias</h4>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                    <input type="text" value={nuevoExperiencia} onChange={(e) => setNuevoExperiencia(e.target.value)} placeholder="Puesto..." style={inlineInput} />
                    <button onClick={() => agregarItem('experience')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <ul style={widgetUl}>
                    {experiencias.map((exp, i) => <li key={i} style={widgetLi}>{exp}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {seccionActiva === 'calendario' && (
          <div style={cardContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={cardTitleStyle}><Calendar size={22} /> Calendario de Citas</h2>
              <button onClick={() => setMostrarModalEntrevista(true)} style={btnPrimaryAction}>+ Agregar Cita</button>
            </div>
            {entrevistas.map((ent) => (
              <div key={ent.id} style={interviewRow}>
                <div><strong>{ent.empresa}</strong> - {ent.fecha} a las {ent.hora} hs</div>
                <span style={liveBadge}>Agendada</span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

// Estilos CCS incrustados para la consistencia visual del Dark Mode
const dashboardLayout = { display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif', color: '#f8fafc' };
const sidebarStyle = { width: '280px', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', boxSizing: 'border-box' };
const brandStyle = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' };
const logoIcon = { width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const brandTitle = { fontSize: '18px', margin: 0, fontWeight: 700 };
const brandSub = { fontSize: '11px', color: '#94a3b8' };
const userCardNav = { backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '24px' };
const avatarContainer = { position: 'relative', width: '64px', height: '64px', margin: '0 auto 10px auto' };
const avatarPlaceholder = { width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' };
const avatarImg = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' };
const editAvatarBadge = { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const userNameText = { margin: 0, fontSize: '15px' };
const userRoleText = { margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' };
const navGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const btnNav = { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', border: 'none', backgroundColor: 'transparent', color: '#94a3b8', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' };
const btnNavActive = { ...btnNav, backgroundColor: 'rgba(59,130,246,0.1)', color: '#38bdf8' };
const btnLogout = { padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#f43f5e', cursor: 'pointer' };
const mainContentArea = { flex: 1, padding: '40px', boxSizing: 'border-box' };
const headerSection = { display: 'flex', justifyContent: 'space-between', marginBottom: '32px' };
const titleMain = { fontSize: '26px', margin: 0 };
const subtitleMain = { margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' };
const btnDownloadPDF = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '8px', cursor: 'pointer' };
const gridTwoCols = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' };
const gridThreeCols = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' };
const cardContainer = { backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px' };
const cardTitleStyle = { margin: '0 0 8px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' };
const dropzoneBox = { border: '2px dashed #334155', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '16px 0' };
const btnPrimaryAction = { padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const scoreResultBox = { backgroundColor: 'rgba(16,185,129,0.06)', borderRadius: '12px', padding: '14px', marginTop: '14px' };
const textareaStyle = { width: '100%', height: '110px', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', resize: 'none', boxSizing: 'border-box' };
const listWidgetBox = { backgroundColor: '#0f172a', padding: '14px', borderRadius: '12px' };
const listWidgetTitle = { margin: '0 0 10px 0', fontSize: '14px' };
const inlineInput = { flex: 1, padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' };
const btnAddInline = { backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 10px' };
const tagCloud = { display: 'flex', flexWrap: 'wrap', gap: '6px' };
const tagChip = { backgroundColor: 'rgba(59,130,246,0.15)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' };
const widgetUl = { paddingLeft: '16px', color: '#cbd5e1' };
const widgetLi = { marginBottom: '4px' };
const selectInputStyle = { padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1' };
const interviewRow = { display: 'flex', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', marginBottom: '10px' };
const liveBadge = { backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' };
