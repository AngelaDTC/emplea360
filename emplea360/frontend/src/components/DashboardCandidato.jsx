import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  User, FileText, Calendar, BookOpen, BarChart2, MessageSquare, 
  Upload, Download, Plus, Sparkles, CheckCircle, Clock 
} from 'lucide-react';

export default function DashboardCandidato() {
  const navigate = useNavigate();
  const URL_BACKEND = 'https://emplea360-production-517a.up.railway.app';

  // 1. Estados de Navegación del Menú Lateral
  const [seccionActiva, setSeccionActiva] = useState('perfil'); // perfil, calendario, academia, analisis, chat

  // 2. Estados de Carga y Datos del Candidato
  const [cargando, setCargando] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState(
    () => localStorage.getItem('usuario_nombre') || 'Candidato'
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
  
  // Listas desplegables/dinámicas editables
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

  // Sugerencias automáticas predefinidas del sector de tecnología/administración
  const sugerenciasHabilidades = ['Python', 'SQL', 'Excel Avanzado', 'Gestión de Proyectos', 'UI/UX Design', 'TypeScript', 'Docker'];

  // 6. Estados del Calendario de Entrevistas
  const [entrevistas, setEntrevistas] = useState([
    { id: 1, empresa: 'Tech Innovators', fecha: '2026-06-15', hora: '10:00', enlace: '#' }
  ]);
  const [mostrarModalEntrevista, setMostrarModalEntrevista] = useState(false);
  const [nuevaEmpresa, setNuevaEmpresa] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');

  // 7. Estados Simulados para las nuevas secciones (Academia, Análisis, Chat)
  const [postulacionesAnalisis] = useState([
    { puesto: 'Desarrollador React Junior', empresa: 'Tech Innovators', estado: 'Entrevista', porcentaje: 85 },
    { puesto: 'Frontend Engineer', empresa: 'Global Solutions', estado: 'En Revisión', porcentaje: 70 },
    { puesto: 'Fullstack Developer', empresa: 'Mercado Local', estado: 'Postulado', porcentaje: 95 },
  ]);

  const [chats, setChats] = useState([
    { id: 1, empresa: 'Tech Innovators (Recruiter)', ultimoMensaje: 'Hola Angela, agendamos la videollamada.', hora: 'Ayer' },
    { id: 2, empresa: 'Global Solutions', ultimoMensaje: 'Recibimos tu perfil optimizado ATS con éxito.', hora: 'Hace 3 días' }
  ]);

  // Manejar cambio y subida de Foto de Perfil
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

  // Manejar Selección de Archivo CV original
  const handleCvChange = (e) => {
    if (e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  // Simulación Inteligente de Optimización ATS
  const simularAnalisisATS = () => {
    if (!cvFile && perfilProfesional.length < 10) {
      alert('Por favor, cargá un archivo CV o redactá tu perfil profesional para analizar.');
      return;
    }
    setAnalizandoATS(true);
    setTimeout(() => {
      setAtsScore(92);
      setRecomendacionesATS([
        '¡Excelente! Estructura jerárquica limpia detectada.',
        'Se incluyeron palabras clave cruciales como JavaScript y React.',
        'Consejo ATS: Mantener el PDF en una sola columna para lecturas de software automatizados.'
      ]);
      // Autocompletado del Perfil y Carta a partir del análisis
      setPerfilProfesional('Profesional proactivo especializado en desarrollo frontend con React.js y Node.js. Enfocado en la creación de interfaces web optimizadas, escalables y con un diseño centrado en la experiencia del usuario final.');
      setCartaPresentacion(`Estimado equipo de reclutamiento,\n\nMe dirijo a ustedes con gran entusiasmo para postularme a sus vacantes activas. Como desarrollador Frontend con conocimientos sólidos en React.js, considero que mi perfil se alinea con sus estándares de innovación. Adjunto mi CV optimizado con métricas ATS para su revisión.\n\nAtentamente,\n${nombreUsuario}`);
      setAnalizandoATS(false);
    }, 2000);
  };

  // Agregar ítems de forma manual a las listas
  const agregarItem = (tipo) => {
    if (tipo === 'habilidad' && nuevaHabilidad) { setHabilidades([...habilidades, nuevaHabilidad]); setNuevaHabilidad(''); }
    if (tipo === 'estudio' && nuevoEstudio) { setEstudios([...estudios, nuevoEstudio]); setNuevoEstudio(''); }
    if (tipo === 'experiencia' && nuevoExperiencia) { setExperiencias([...experiencias, nuevoExperiencia]); setNuevoExperiencia(''); }
    if (tipo === 'capacitacion' && nuevoCapacitacion) { setCapacitaciones([...capacitaciones, nuevoCapacitacion]); setNuevaCapacitacion(''); }
    if (tipo === 'conocimiento' && nuevoConocimiento) { setConocimientos([...conocimientos, nuevoConocimiento]); setNuevoConocimiento(''); }
  };

  // Agregar entrevista manual al Calendario
  const guardarEntrevista = (e) => {
    e.preventDefault();
    if (!nuevaEmpresa || !nuevaFecha || !nuevaHora) return;
    const nueva = {
      id: Date.now(),
      empresa: nuevaEmpresa,
      fecha: nuevaFecha,
      hora: nuevaHora,
      enlace: '#'
    };
    setEntrevistas([...entrevistas, nueva]);
    setNuevaEmpresa(''); setNuevaFecha(''); setNuevaHora('');
    setMostrarModalEntrevista(false);
  };

  // GENERAR Y DESCARGAR PDF CON ENCABEZADO "CV CON FILTROS ATS"
  const descargarPdfATS = () => {
    const doc = new jsPDF();
    
    // Encabezado Técnico Requerido para ATS
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Gris oscuro Slate-900
    doc.text('CV CON FILTROS ATS', 105, 20, { align: 'center' });
    
    // Nombre del postulante
    doc.setFontSize(16);
    doc.text(nombreUsuario.toUpperCase(), 105, 32, { align: 'center' });
    
    // Línea divisoria limpia
    doc.setDrawColor(203, 213, 225);
    doc.line(20, 38, 190, 38);
    
    // Perfil Profesional
    doc.setFontSize(12);
    doc.text('PERFIL PROFESIONAL', 20, 46);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const splitPerfil = doc.splitTextToSize(perfilProfesional || 'Sin descripción.', 170);
    doc.text(splitPerfil, 20, 52);
    
    let yPos = 56 + (splitPerfil.length * 5);
    
    // Sección Habilidades
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('HABILIDADES CORE (KEYWORDS)', 20, yPos);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(habilidades.join(' | '), 20, yPos + 6);
    
    yPos += 16;
    
    // Experiencia Laboral
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('EXPERIENCIA LABORAL', 20, yPos);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    experiencias.forEach((exp, idx) => {
      doc.text(`• ${exp}`, 20, yPos + 6 + (idx * 5));
    });
    
    yPos += 12 + (experiencias.length * 5);
    
    // Educación
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('EDUCACIÓN Y FORMACIÓN', 20, yPos);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    estudios.forEach((est, idx) => {
      doc.text(`• ${est}`, 20, yPos + 6 + (idx * 5));
    });

    doc.save(`CV_ATS_${nombreUsuario.replace(/\s+/g, '_')}.pdf`);
  };

  // Cierre de Sesión
  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  return (
    <div style={dashboardLayout}>
      
      {/* 2. MENÚ LATERAL DESPLEGABLE / BARRA DE NAVEGACIÓN */}
      <aside style={sidebarStyle}>
        <div>
          <div style={brandStyle}>
            <div style={logoIcon}>360</div>
            <div>
              <h2 style={brandTitle}>Emplea360</h2>
              <span style={brandSub}>Talent Portal</span>
            </div>
          </div>

          {/* Bloque de Perfil de Usuario con Foto configurable */}
          <div style={userCardNav}>
            <div style={avatarContainer}>
              {previewFoto ? (
                <img src={previewFoto} alt="Perfil" style={avatarImg} />
              ) : (
                <div style={avatarPlaceholder}>{nombreUsuario[0]}</div>
              )}
              <label style={editAvatarBadge}>
                <Upload size={12} />
                <input type="file" accept="image/*" onChange={handleFotoChange} style={{ display: 'none' }} />
              </label>
            </div>
            <h4 style={userNameText}>{nombreUsuario}</h4>
            <p style={userRoleText}>Candidato Activo</p>
          </div>

          {/* Botones de Navegación del Sistema */}
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

        <button onClick={handleLogout} style={btnLogout}>Cerrar Sesión</button>
      </aside>

      {/* ÁREA DE CONTENIDO CENTRAL DINÁMICO */}
      <main style={mainContentArea}>
        
        {/* SECCIÓN 1: MI PERFIL / OPTIMIZADOR ATS */}
        {seccionActiva === 'perfil' && (
          <div>
            <div style={headerSection}>
              <div>
                <h1 style={titleMain}>Tu Perfil Profesional Inteligente</h1>
                <p style={subtitleMain}>Cargá tu CV original, optimizalo para filtros corporativos ATS y exportá tus documentos en un clic.</p>
              </div>
              <button onClick={descargarPdfATS} style={btnDownloadPDF}>
                <Download size={18} /> Exportar CV con Filtros ATS
              </button>
            </div>

            {/* Fila del Optimizador ATS */}
            <div style={gridTwoCols}>
              
              {/* Cuadro de Carga y Score ATS */}
              <div style={cardContainer}>
                <h3 style={cardTitleStyle}><Sparkles size={18} style={{ color: '#10b981' }} /> Optimizador de Filtros ATS</h3>
                <p style={textMuted}>Subí tu currículum actual para evaluar tu compatibilidad con los sistemas automáticos de las empresas.</p>
                
                <div style={dropzoneBox}>
                  <Upload size={32} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} style={{ display: 'block', margin: '0 auto 10px auto' }} />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Formatos aceptados: PDF, DOCX (Máx 5MB)</span>
                </div>

                {cvFile && <p style={{ fontSize: '13px', color: '#f8fafc' }}>📂 Archivo listo: <strong>{cvFile.name}</strong></p>}

                <button onClick={simularAnalisisATS} disabled={analizandoATS} style={btnPrimaryAction}>
                  {analizandoATS ? 'Analizando semántica...' : 'Escanear y Autocompletar Perfil'}
                </button>

                {atsScore && (
                  <div style={scoreResultBox}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>Score de Compatibilidad ATS:</span>
                      <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{atsScore}%</span>
                    </div>
                    <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#cbd5e1' }}>
                      {recomendacionesATS.map((rec, i) => <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Campos dinámicos de texto */}
              <div style={cardContainer}>
                <h3 style={cardTitleStyle}><FileText size={18} style={{ color: '#3b82f6' }} /> Textos Generados (ATS Mode)</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelFormStyle}>Perfil del Candidato (Extracción Automática)</label>
                  <textarea value={perfilProfesional} onChange={(e) => setPerfilProfesional(e.target.value)} placeholder="Breve resumen de tu trayectoria, especialidades y mayores fortalezas..." style={textareaStyle} />
                </div>

                <div>
                  <label style={labelFormStyle}>Carta de Presentación Inteligente</label>
                  <textarea value={cartaPresentacion} onChange={(e) => setCartaPresentacion(e.target.value)} placeholder="Escribí un mensaje directo para los reclutadores explicando por qué sos el candidato ideal..." style={textareaStyle} />
                </div>
              </div>

            </div>

            {/* SECTORES DINÁMICOS CON LISTAS DESPLEGABLES Y MANUALES */}
            <div style={{ ...cardContainer, marginTop: '24px' }}>
              <h3 style={cardTitleStyle}>Estructura Curricular del Postulante</h3>
              <p style={{ ...textMuted, marginBottom: '20px' }}>Agregá palabras clave seleccionando el menú desplegable de sugerencias o escribí a mano las tuyas.</p>

              <div style={gridThreeCols}>
                
                {/* Bloque Habilidades */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Habilidades Core</h4>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <select onChange={(e) => setNuevaHabilidad(e.target.value)} style={selectInputStyle}>
                      <option value="">-- Sugerencias --</option>
                      {sugerenciasHabilidades.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                    </select>
                    <input type="text" value={nuevaHabilidad} onChange={(e) => setNuevaHabilidad(e.target.value)} placeholder="Otra..." style={inlineInput} />
                    <button onClick={() => agregarItem('hability')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <div style={tagCloud}>
                    {habilidades.map((h, i) => <span key={i} style={tagChip}>{h}</span>)}
                  </div>
                </div>

                {/* Bloque Experiencia */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Experiencia Laboral</h4>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <input type="text" value={nuevoExperiencia} onChange={(e) => setNuevoExperiencia(e.target.value)} placeholder="Puesto, Empresa y Duración..." style={inlineInput} />
                    <button onClick={() => agregarItem('experience')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <ul style={widgetUl}>
                    {experiencias.map((e, i) => <li key={i} style={widgetLi}>{e}</li>)}
                  </ul>
                </div>

                {/* Bloque Estudios */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Estudios y Carreras</h4>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <input type="text" value={nuevoEstudio} onChange={(e) => setNuevoEstudio(e.target.value)} placeholder="Título e Institución..." style={inlineInput} />
                    <button onClick={() => agregarItem('estudio')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <ul style={widgetUl}>
                    {estudios.map((e, i) => <li key={i} style={widgetLi}>{e}</li>)}
                  </ul>
                </div>

              </div>

              <div style={{ ...gridTwoCols, marginTop: '16px' }}>
                {/* Capacitaciones */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Capacitaciones y Certificaciones</h4>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <input type="text" value={nuevoCapacitacion} onChange={(e) => setNuevoCapacitacion(e.target.value)} placeholder="Nombre del programa o curso..." style={inlineInput} />
                    <button onClick={() => agregarItem('capacitacion')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <ul style={widgetUl}>
                    {capacitaciones.map((c, i) => <li key={i} style={widgetLi}>{c}</li>)}
                  </ul>
                </div>

                {/* Conocimientos */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Conocimientos Adicionales</h4>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <input type="text" value={nuevoConocimiento} onChange={(e) => setNuevoConocimiento(e.target.value)} placeholder="Herramientas, frameworks, etc..." style={inlineInput} />
                    <button onClick={() => agregarItem('conocimiento')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <div style={tagCloud}>
                    {conocimientos.map((cn, i) => <span key={i} style={{ ...tagChip, backgroundColor: '#1e1b4b', color: '#a5b4fc' }}>{cn}</span>)}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECCIÓN 2: CALENDARIO DE ENTREVISTAS */}
        {seccionActiva === 'calendario' && (
          <div style={cardContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={cardTitleStyle}><Calendar size={22} style={{ color: '#3b82f6' }} /> Agenda de Videollamadas</h2>
                <p style={textMuted}>Gestioná tus próximas citas técnicas y entrevistas comerciales coordinadas con empresas.</p>
              </div>
              <button onClick={() => setMostrarModalEntrevista(true)} style={btnPrimaryAction}>
                <Plus size={16} /> Agregar Entrevista Manual
              </button>
            </div>

            {/* Listado Visual de Entrevistas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {entrevistas.map((ent) => (
                <div key={ent.id} style={interviewRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={calendarIconBadge}><Clock size={20} /></div>
                    <div>
                      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>Entrevista con {ent.empresa}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                        📅 Fecha: <strong>{ent.fecha}</strong> | ⏰ Hora: <strong>{ent.hora} hs</strong>
                      </p>
                    </div>
                  </div>
                  <span style={liveBadge}>Videollamada Pendiente</span>
                </div>
              ))}
            </div>

            {/* MODAL COMPACTO FLUIDO PARA AGREGAR ENTREVISTAS */}
            {mostrarModalEntrevista && (
              <div style={backdropModal}>
                <div style={modalCard}>
                  <h3 style={{ marginTop: 0, color: '#f8fafc' }}>Agendar Nueva Cita</h3>
                  <form onSubmit={guardarEntrevista}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={labelFormStyle}>Nombre de la Empresa</label>
                      <input type="text" required value={nuevaEmpresa} onChange={(e) => setNuevaEmpresa(e.target.value)} placeholder="Ej: Microsoft Latam" style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelFormStyle}>Fecha</label>
                        <input type="date" required value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} style={inputStyle} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelFormStyle}>Hora</label>
                        <input type="time" required value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setMostrarModalEntrevista(false)} style={{ ...btnNav, border: '1px solid #334155' }}>Cancelar</button>
                      <button type="submit" style={{ ...btnPrimaryAction, margin: 0, width: 'auto' }}>Confirmar y Guardar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 3: ACADEMIA 360 */}
        {seccionActiva === 'academia' && (
          <div style={cardContainer}>
            <h2 style={cardTitleStyle}><BookOpen size={22} style={{ color: '#10b981' }} /> Academia de Capacitación 360</h2>
            <p style={textMuted}>Cursos intensivos diseñados en base a las demandas en tiempo real de los directores de contratación.</p>
            
            <div style={gridTwoCols}>
              <div style={academyCard}>
                <span style={tagChipAcademy}>Especialidad IT</span>
                <h4 style={{ margin: '10px 0 6px 0', color: '#f8fafc' }}>Patrones Avanzados en React y TypeScript</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0' }}>Buscado por el 84% de las empresas de desarrollo este mes.</p>
                <div style={progressContainer}><div style={{ ...progressBar, width: '40%', backgroundColor: '#3b82f6' }}></div></div>
                <span style={progressText}>Progreso: 40% cursado</span>
              </div>

              <div style={academyCard}>
                <span style={{ ...tagChipAcademy, backgroundColor: '#7c3aed' }}>Habilidades Blandas</span>
                <h4 style={{ margin: '10px 0 6px 0', color: '#f8fafc' }}>Oratoria y Negociación en Entrevistas Técnicas</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0' }}>Mejorá tu despliegue ante juntas evaluadoras internacionales.</p>
                <div style={progressContainer}><div style={{ ...progressBar, width: '100%', backgroundColor: '#10b981' }}></div></div>
                <span style={progressText}>✅ Completado con éxito</span>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 4: ANÁLISIS DE POSTULACIONES */}
        {seccionActiva === 'analisis' && (
          <div style={cardContainer}>
            <h2 style={cardTitleStyle}><BarChart2 size={22} style={{ color: '#f59e0b' }} /> Rendimiento y Embudo de Selección</h2>
            <p style={textMuted}>Monitoreo automatizado del estado de tus solicitudes laborales enviadas.</p>

            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155' }}>
                  <th style={thStyle}>Puesto Solicitado</th>
                  <th style={thStyle}>Empresa</th>
                  <th style={thStyle}>Estado Actual</th>
                  <th style={thStyle}>Ajuste de Perfil</th>
                </tr>
              </thead>
              <tbody>
                {postulacionesAnalisis.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={tdStyle}>{p.puesto}</td>
                    <td style={tdStyle}>{p.empresa}</td>
                    <td style={tdStyle}><span style={stateLabelStyle}>{p.estado}</span></td>
                    <td style={{ ...tdStyle, color: '#10b981', fontWeight: 'bold' }}>{p.porcentaje}% Match</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SECCIÓN 5: SALA DE CHAT */}
        {seccionActiva === 'chat' && (
          <div style={cardContainer}>
            <h2 style={cardTitleStyle}><MessageSquare size={22} style={{ color: '#ec4899' }} /> Mensajería Corporativa</h2>
            <p style={textMuted}>Canal de contacto directo con reclutadores corporativos habilitados.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chats.map((c) => (
                <div key={c.id} style={chatRowStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={chatAvatar}>{c.empresa[0]}</div>
                    <div>
                      <h4 style={{ margin: 0, color: '#f8fafc' }}>{c.empresa}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#cbd5e1' }}>{c.ultimoMensaje}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{c.hora}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ================= ESTILOS EN CASCADA COMPATIBLES CON TAILWIND/DARK =================
const dashboardLayout = { display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: '"Segoe UI", Roboto, sans-serif', color: '#f8fafc' };
const sidebarStyle = { width: '280px', backgroundColor: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', boxSizing: 'border-box', position: 'sticky', top: 0, height: '100vh' };
const brandStyle = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' };
const logoIcon = { width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' };
const brandTitle = { fontSize: '18px', margin: 0, fontWeight: 700, letterSpacing: '-0.3px' };
const brandSub = { fontSize: '11px', color: '#94a3b8', display: 'block' };
const userCardNav = { backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.03)' };
const avatarContainer = { position: 'relative', width: '64px', height: '64px', margin: '0 auto 10px auto' };
const avatarPlaceholder = { width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#fff' };
const avatarImg = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' };
const editAvatarBadge = { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #1e293b' };
const userNameText = { margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc' };
const userRoleText = { margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' };
const navGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const btnNav = { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', border: 'none', backgroundColor: 'transparent', color: '#94a3b8', fontSize: '14px', fontWeight: 500, textAlign: 'left', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' };
const btnNavActive = { ...btnNav, backgroundColor: 'rgba(59,130,246,0.1)', color: '#38bdf8', fontWeight: 600 };
const btnLogout = { padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#f43f5e', cursor: 'pointer', fontWeight: 600, fontSize: '14px' };
const mainContentArea = { flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto', maxHeight: '100vh' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '20px' };
const titleMain = { fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' };
const subtitleMain = { margin: '6px 0 0 0', color: '#94a3b8', fontSize: '15px' };
const btnDownloadPDF = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' };
const gridTwoCols = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' };
const gridThreeCols = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' };
const cardContainer = { backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.04)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' };
const cardTitleStyle = { margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' };
const textMuted = { margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' };
const dropzoneBox = { border: '2px dashed #334155', borderRadius: '12px', padding: '24px', textAlign: 'center', margin: '20px 0 16px 0', backgroundColor: 'rgba(15,23,42,0.2)' };
const btnPrimaryAction = { width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' };
const scoreResultBox = { backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '16px', marginTop: '16px' };
const labelFormStyle = { display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600 };
const textareaStyle = { width: '100%', height: '120px', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' };
const listWidgetBox = { backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #233147' };
const listWidgetTitle = { margin: '0 0 12px 0', fontSize: '14px', color: '#f8fafc', fontWeight: 600 };
const inlineInput = { flex: 1, padding: '8px 10px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '13px' };
const btnAddInline = { backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' };
const tagCloud = { display: 'flex', flexWrap: 'wrap', gap: '6px' };
const tagChip = { backgroundColor: 'rgba(59,130,246,0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 };
const widgetUl = { paddingLeft: '16px', margin: 0, fontSize: '13px', color: '#cbd5e1' };
const widgetLi = { marginBottom: '6px' };
const selectInputStyle = { padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', fontSize: '12px' };
const interviewRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #233147' };
const calendarIconBadge = { width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const liveBadge = { backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 };
const backdropModal = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalCard = { backgroundColor: '#1e293b', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '440px', border: '1px solid #334155' };
const academyCard = { backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', marginTop: '16px', border: '1px solid #233147' };
const tagChipAcademy = { backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 };
const progressContainer = { width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', marginBottom: '8px' };
const progressBar = { height: '100%', borderRadius: '3px' };
const progressText = { fontSize: '12px', color: '#64748b' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' };
const thStyle = { padding: '12px', color: '#94a3b8', fontSize: '14px', fontWeight: 600 };
const tdStyle = { padding: '14px 12px', fontSize: '14px', color: '#e2e8f0' };
const stateLabelStyle = { backgroundColor: 'rgba(59,130,246,0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' };
const chatRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #233147' };
const chatAvatar = { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
