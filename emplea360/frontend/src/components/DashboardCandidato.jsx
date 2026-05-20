// 1. Estados de Carga y Datos del Candidato (CON SUS MODIFICADORES)
  const [cvFile, setCvFile] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [tieneCambiosSinGuardar, setTieneCambiosSinGuardar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  // 2. Estados de Carga y Datos del Candidato
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

  // Sugerencias para listas desplegables
  const sugerenciasHabilidades = ['Python', 'SQL', 'Excel Avanzado', 'Gestión de Proyectos', 'UI/UX Design', 'TypeScript', 'Docker', 'Administración Financiera'];
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
      
      // Auto-completado inteligente del perfil, carta y listas optimizadas basados en el CV
      setPerfilProfesional(`Perfil ATS Optimizado - ${nombreUsuario}: Especialista con sólida formación técnica y competencias adaptadas a las demandas del mercado actual. Enfocada en la resolución de problemas complejos, implementación de metodologías eficientes y optimización de flujos de trabajo organizacionales.`);
      setCartaPresentacion(`Estimado Equipo de Selección,\n\nMe dirijo a ustedes con el propósito de presentar mi postulación a sus búsquedas activas. Como verán en mi CV adjunto diseñado con Filtros ATS, poseo una preparación alineada con los requisitos clave del sector, aportando competencias críticas en habilidades dinámicas y de gestión.\n\nAgradezco de antemano la lectura de mi perfil y quedo a disposición para coordinar una entrevista.\n\nAtentamente,\n${nombreUsuario}`);
      
      // Enriquecer listas dinámicas automáticamente con términos ATS compatibles
      setHabilidades(prev => [...new Set([...prev, 'Metodologías Ágiles', 'Gestión del Tiempo', 'Resolución de Conflictos'])]);
      setConocimientos(prev => [...new Set([...prev, 'Optimización ATS', 'Sistemas ERP', 'Herramientas de Colaboración'])]);
      
      setAnalizandoATS(false);
    }, 1800);
  };

  // CORRECCIÓN CLAVE: Mapeo exacto de strings para que la adición manual/desplegable funcione
  const agregarItem = (tipo) => {
    if (tipo === 'habilidad' && nuevaHabilidad.trim() !== '') {
      if (!habilidades.includes(nuevaHabilidad)) setHabilidades([...habilidades, nuevaHabilidad]);
      setNuevaHabilidad('');
    }
    if (tipo === 'estudio' && nuevoEstudio.trim() !== '') {
      setEstudios([...estudios, nuevoEstudio]);
      nuevoEstudio('');
    }
    if (tipo === 'experiencia' && nuevoExperiencia.trim() !== '') {
      setExperiencias([...experiencias, nuevoExperiencia]);
      setNuevoExperiencia('');
    }
    if (tipo === 'capacitacion' && nuevoCapacitacion.trim() !== '') {
      setCapacitaciones([...capacitaciones, nuevoCapacitacion]);
      setNuevoCapacitacion('');
    }
    if (tipo === 'conocimiento' && nuevoConocimiento.trim() !== '') {
      if (!conocimientos.includes(nuevoConocimiento)) setConocimientos([...conocimientos, nuevoConocimiento]);
      setNuevoConocimiento('');
    }
  };

  // Guardar Entrevista en el Calendario
  const guardarEntrevista = (e) => {
    e.preventDefault();
    if (!nuevaEmpresa || !nuevaFecha || !nuevaHora) return;
    const nueva = {
      id: Date.now(),
      empresa: nuevaEmpresa,
      fecha: nuevaFecha,
      hora: nuevaHora
    };
    setEntrevistas([...entrevistas, nueva]);
    setNuevaEmpresa(''); setNuevaFecha(''); setNuevaHora('');
    setMostrarModalEntrevista(false);
  };

  // Generación y descarga del PDF con formato ATS estricto
  const descargarPdfATS = () => {
    const doc = new jsPDF();
    
    // Encabezado ATS Directo (Estructura plana legible por software)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); 
    doc.text('CV CON FILTROS ATS', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(nombreUsuario.toUpperCase(), 105, 30, { align: 'center' });
    
    doc.setDrawColor(203, 213, 225);
    doc.line(20, 36, 190, 36);
    
    // Perfil Profesional
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PERFIL PROFESIONAL', 20, 44);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const splitPerfil = doc.splitTextToSize(perfilProfesional || 'Perfil técnico en proceso de carga.', 170);
    doc.text(splitPerfil, 20, 50);
    
    let yPos = 56 + (splitPerfil.length * 5);
    
    // Habilidades Core (Keywords críticas)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('KEYWORDS Y COMPETENCIAS CLAVE', 20, yPos);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(habilidades.join(' | '), 20, yPos + 6);
    
    yPos += 18;
    
    // Experiencias
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TRAYECTORIA LABORAL', 20, yPos);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    experiencias.forEach((exp, idx) => {
      doc.text(`• ${exp}`, 20, yPos + 6 + (idx * 6));
    });
    
    yPos += 12 + (experiencias.length * 6);
    
    // Educación
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('EDUCACIÓN Y CERTIFICACIONES', 20, yPos);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const listadoEducacion = [...estudios, ...capacitaciones];
    listadoEducacion.forEach((edu, idx) => {
      doc.text(`• ${edu}`, 20, yPos + 6 + (idx * 6));
    });

    doc.save(`CV_ATS_${nombreUsuario.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div style={dashboardLayout}>
      
      {/* MENÚ LATERAL DESPLEGABLE */}
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

      {/* ÁREA CENTRAL */}
      <main style={mainContentArea}>
        
        {/* VISTA 1: MI PERFIL Y FILTROS ATS */}
        {seccionActiva === 'perfil' && (
          <div>
            <div style={headerSection}>
              <div>
                <h1 style={titleMain}>Tu Perfil Profesional Inteligente</h1>
                <p style={subtitleMain}>Optimizá tus datos en tiempo real para superar los filtros ATS y generar tus documentos corporativos automáticamente.</p>
              </div>
              <button onClick={descargarPdfATS} style={btnDownloadPDF}>
                <Download size={18} /> Exportar CV con Filtros ATS
              </button>
            </div>

            <div style={gridTwoCols}>
              {/* Bloque de Carga */}
              <div style={cardContainer}>
                <h3 style={cardTitleStyle}><Sparkles size={18} style={{ color: '#10b981' }} /> Optimizador de Filtros ATS</h3>
                <p style={textMuted}>Cargá tu archivo original para extraer analíticas semánticas complejas.</p>
                
                <div style={dropzoneBox}>
                  <Upload size={32} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} style={{ display: 'block', margin: '0 auto 10px auto', color: '#cbd5e1' }} />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Formatos soportados: PDF, DOCX</span>
                </div>

                {cvFile && <p style={{ fontSize: '13px', color: '#10b981', margin: '8px 0' }}>📂 Currículum cargado: <strong>{cvFile.name}</strong></p>}

                <button onClick={simularAnalisisATS} disabled={analizandoATS} style={btnPrimaryAction}>
                  {analizandoATS ? 'Analizando Semántica ATS...' : 'Escanear y Autocompletar Perfil'}
                </button>

                {atsScore && (
                  <div style={scoreResultBox}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>Puntuación del CV:</span>
                      <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>{atsScore}% Match</span>
                    </div>
                    <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                      {recomendacionesATS.map((rec, i) => <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Editores Automáticos */}
              <div style={cardContainer}>
                <h3 style={cardTitleStyle}><FileText size={18} style={{ color: '#3b82f6' }} /> Documentación Generada</h3>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelFormStyle}>Perfil del Candidato (Sincronizado)</label>
                  <textarea value={perfilProfesional} onChange={(e) => setPerfilProfesional(e.target.value)} placeholder="Breve resumen de tu trayectoria, especialidades y mayores fortalezas..." style={textareaStyle} />
                </div>

                <div>
                  <label style={labelFormStyle}>Carta de Presentación</label>
                  <textarea value={cartaPresentacion} onChange={(e) => setCartaPresentacion(e.target.value)} placeholder="Tu carta de presentación autogenerada para aplicar directamente..." style={textareaStyle} />
                </div>
              </div>
            </div>

            {/* Listas Desplegables y Manuales Combinadas */}
            <div style={{ ...cardContainer, marginTop: '24px' }}>
              <h3 style={cardTitleStyle}>Secciones Curriculares Dinámicas</h3>
              <p style={{ ...textMuted, marginBottom: '20px' }}>Completá seleccionando del desplegable o escribiendo manualmente.</p>

              <div style={gridThreeCols}>
                {/* Habilidades */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Habilidades Core</h4>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                    <select onChange={(e) => setNuevaHabilidad(e.target.value)} value={nuevaHabilidad} style={selectInputStyle}>
                      <option value="">-- Buscar --</option>
                      {sugerenciasHabilidades.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                    </select>
                    <input type="text" value={nuevaHabilidad} onChange={(e) => setNuevaHabilidad(e.target.value)} placeholder="Otra..." style={inlineInput} />
                    <button onClick={() => agregarItem('habilidad')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <div style={tagCloud}>
                    {habilidades.map((h, i) => <span key={i} style={tagChip}>{h}</span>)}
                  </div>
                </div>

                {/* Experiencias */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Experiencia Laboral</h4>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                    <input type="text" value={nuevoExperiencia} onChange={(e) => setNuevoExperiencia(e.target.value)} placeholder="Puesto, Empresa..." style={inlineInput} />
                    <button onClick={() => agregarItem('experiencia')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <ul style={widgetUl}>
                    {experiencias.map((exp, i) => <li key={i} style={widgetLi}>{exp}</li>)}
                  </ul>
                </div>

                {/* Estudios */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Estudios</h4>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                    <input type="text" value={nuevoEstudio} onChange={(e) => setNuevoEstudio(e.target.value)} placeholder="Título, Institución..." style={inlineInput} />
                    <button onClick={() => agregarItem('estudio')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <ul style={widgetUl}>
                    {estudios.map((est, i) => <li key={i} style={widgetLi}>{est}</li>)}
                  </ul>
                </div>
              </div>

              <div style={{ ...gridTwoCols, marginTop: '16px' }}>
                {/* Capacitaciones */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Capacitaciones</h4>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                    <input type="text" value={nuevoCapacitacion} onChange={(e) => setNuevoCapacitacion(e.target.value)} placeholder="Certificación o curso..." style={inlineInput} />
                    <button onClick={() => agregarItem('capacitacion')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <ul style={widgetUl}>
                    {capacitaciones.map((cap, i) => <li key={i} style={widgetLi}>{cap}</li>)}
                  </ul>
                </div>

                {/* Conocimientos */}
                <div style={listWidgetBox}>
                  <h4 style={listWidgetTitle}>Conocimientos Técnicos</h4>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                    <select onChange={(e) => setNuevoConocimiento(e.target.value)} value={nuevoConocimiento} style={selectInputStyle}>
                      <option value="">-- Buscar --</option>
                      {sugerenciasConocimientos.map((sc, idx) => <option key={idx} value={sc}>{sc}</option>)}
                    </select>
                    <input type="text" value={nuevoConocimiento} onChange={(e) => setNuevoConocimiento(e.target.value)} placeholder="Otro..." style={inlineInput} />
                    <button onClick={() => agregarItem('conocimiento')} style={btnAddInline}><Plus size={14} /></button>
                  </div>
                  <div style={tagCloud}>
                    {conocimientos.map((con, i) => <span key={i} style={{ ...tagChip, backgroundColor: '#1e1b4b', color: '#a5b4fc' }}>{con}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: CALENDARIO DE ENTREVISTAS */}
        {seccionActiva === 'calendario' && (
          <div style={cardContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={cardTitleStyle}><Calendar size={22} style={{ color: '#3b82f6' }} /> Calendario de Videollamadas</h2>
                <p style={textMuted}>Registrá tus citas. Recordá ingresar la información obligatoria (Nombre de Empresa, Fecha y Hora).</p>
              </div>
              <button onClick={() => setMostrarModalEntrevista(true)} style={btnPrimaryAction}>
                <Plus size={16} /> Agregar Entrevista
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {entrevistas.map((ent) => (
                <div key={ent.id} style={interviewRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={calendarIconBadge}><Clock size={20} /></div>
                    <div>
                      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>Videollamada de Entrevista: {ent.empresa}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                        📅 Fecha pautada: <strong>{ent.fecha}</strong> | ⏰ Horario: <strong>{ent.hora} hs</strong>
                      </p>
                    </div>
                  </div>
                  <span style={liveBadge}>Agendada</span>
                </div>
              ))}
            </div>

            {/* MODAL DE ENTREVISTAS */}
            {mostrarModalEntrevista && (
              <div style={backdropModal}>
                <div style={modalCard}>
                  <h3 style={{ marginTop: 0, color: '#f8fafc', marginBottom: '16px' }}>Agendar Entrevista</h3>
                  <form onSubmit={guardarEntrevista}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={labelFormStyle}>Nombre de la Empresa</label>
                      <input type="text" required value={nuevaEmpresa} onChange={(e) => setNuevaEmpresa(e.target.value)} placeholder="Ej: Tech Latam" style={inputStyle} />
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
                      <button type="button" onClick={() => setMostrarModalEntrevista(false)} style={btnSecondary}>Cancelar</button>
                      <button type="submit" style={{ ...btnPrimaryAction, margin: 0, width: 'auto' }}>Guardar Cita</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISTA 3: ACADEMIA */}
        {seccionActiva === 'academia' && (
          <div style={cardContainer}>
            <h2 style={cardTitleStyle}><BookOpen size={22} style={{ color: '#10b981' }} /> Academia 360</h2>
            <p style={textMuted}>Cursos y especializaciones sobre las habilidades de alta demanda que los empresarios necesitan.</p>
            <div style={gridTwoCols}>
              <div style={academyCard}>
                <span style={tagChipAcademy}>Especialidad Corporativa</span>
                <h4 style={{ margin: '10px 0 6px 0', color: '#f8fafc' }}>Gestión de Proyectos y metodologías de Alto Rendimiento</h4>
                <div style={progressContainer}><div style={{ ...progressBar, width: '40%', backgroundColor: '#3b82f6' }}></div></div>
                <span style={progressText}>Progreso: 40% cursado</span>
              </div>
              <div style={academyCard}>
                <span style={{ ...tagChipAcademy, backgroundColor: '#7c3aed' }}>Habilidades Demandadas</span>
                <h4 style={{ margin: '10px 0 6px 0', color: '#f8fafc' }}>Comunicación Asertiva y Negociación en Entrevistas</h4>
                <div style={progressContainer}><div style={{ ...progressBar, width: '100%', backgroundColor: '#10b981' }}></div></div>
                <span style={progressText}>✅ Curso Completado</span>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 4: ANÁLISIS */}
        {seccionActiva === 'analisis' && (
          <div style={cardContainer}>
            <h2 style={cardTitleStyle}><BarChart2 size={22} style={{ color: '#f59e0b' }} /> Análisis de Postulaciones</h2>
            <p style={textMuted}>Seguimiento detallado de cómo van tus procesos de selección y el porcentaje de ajuste con las empresas.</p>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155' }}>
                  <th style={thStyle}>Puesto</th>
                  <th style={thStyle}>Empresa</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Compatibilidad</th>
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

        {/* VISTA 5: CHAT */}
        {seccionActiva === 'chat' && (
          <div style={cardContainer}>
            <h2 style={cardTitleStyle}><MessageSquare size={22} style={{ color: '#ec4899' }} /> Sector de Chat (Candidatos - Empresas)</h2>
            <p style={textMuted}>Canal directo de comunicación interactiva con los reclutadores autorizados.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
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

// Estilos de interfaz unificados en constantes de ejecución
const dashboardLayout = { display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: '"Segoe UI", Roboto, sans-serif', color: '#f8fafc' };
const sidebarStyle = { width: '280px', backgroundColor: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', boxSizing: 'border-box', position: 'sticky', top: 0, height: '100vh' };
const brandStyle = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' };
const logoIcon = { width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' };
const brandTitle = { fontSize: '18px', margin: 0, fontWeight: 700 };
const brandSub = { fontSize: '11px', color: '#94a3b8', display: 'block' };
const userCardNav = { backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.03)' };
const avatarContainer = { position: 'relative', width: '64px', height: '64px', margin: '0 auto 10px auto' };
const avatarPlaceholder = { width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' };
const avatarImg = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' };
const editAvatarBadge = { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #1e293b' };
const userNameText = { margin: 0, fontSize: '15px', fontWeight: 600 };
const userRoleText = { margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' };
const navGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const btnNav = { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', border: 'none', backgroundColor: 'transparent', color: '#94a3b8', fontSize: '14px', fontWeight: 500, textAlign: 'left', borderRadius: '8px', cursor: 'pointer' };
const btnNavActive = { ...btnNav, backgroundColor: 'rgba(59,130,246,0.1)', color: '#38bdf8', fontWeight: 600 };
const btnLogout = { padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#f43f5e', cursor: 'pointer', fontWeight: 600 };
const mainContentArea = { flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto', maxHeight: '100vh' };
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '20px' };
const titleMain = { fontSize: '26px', fontWeight: 700, margin: 0 };
const subtitleMain = { margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' };
const btnDownloadPDF = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' };
const gridTwoCols = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' };
const gridThreeCols = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' };
const cardContainer = { backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.04)' };
const cardTitleStyle = { margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' };
const textMuted = { margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' };
const dropzoneBox = { border: '2px dashed #334155', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '16px 0', backgroundColor: 'rgba(15,23,42,0.2)' };
const btnPrimaryAction = { width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const scoreResultBox = { backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '14px', marginTop: '14px' };
const labelFormStyle = { display: 'block', marginBottom: '6px', color: '#cbd5e1', fontSize: '13px', fontWeight: 600 };
const textareaStyle = { width: '100%', height: '110px', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' };
const listWidgetBox = { backgroundColor: '#0f172a', padding: '14px', borderRadius: '12px', border: '1px solid #233147' };
const listWidgetTitle = { margin: '0 0 10px 0', fontSize: '14px', color: '#f8fafc', fontWeight: 600 };
const inlineInput = { flex: 1, padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '13px', width: '60px' };
const btnAddInline = { backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 10px', cursor: 'pointer' };
const tagCloud = { display: 'flex', flexWrap: 'wrap', gap: '6px' };
const tagChip = { backgroundColor: 'rgba(59,130,246,0.15)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' };
const widgetUl = { paddingLeft: '16px', margin: 0, fontSize: '13px', color: '#cbd5e1' };
const widgetLi = { marginBottom: '4px' };
const selectInputStyle = { padding: '8px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', fontSize: '12px', maxWidth: '90px' };
const interviewRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #233147' };
const calendarIconBadge = { width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const liveBadge = { backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 };
const backdropModal = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalCard = { backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid #334155' };
const btnSecondary = { padding: '10px 14px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid #334155', color: '#cbd5e1', cursor: 'pointer' };
const academyCard = { backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', marginTop: '12px', border: '1px solid #233147' };
const tagChipAcademy = { backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' };
const progressContainer = { width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', marginBottom: '8px', marginTop: '12px' };
const progressBar = { height: '100%', borderRadius: '3px' };
const progressText = { fontSize: '12px', color: '#64748b' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '16px', textAlign: 'left' };
const thStyle = { padding: '10px', color: '#94a3b8', fontSize: '14px' };
const tdStyle = { padding: '12px 10px', fontSize: '14px' };
const stateLabelStyle = { backgroundColor: 'rgba(59,130,246,0.15)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' };
const chatRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #233147' };
const chatAvatar = { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
