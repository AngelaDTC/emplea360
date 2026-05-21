import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, FileText, Calendar, MessageSquare, Briefcase, Users, 
  LogOut, MapPin, Clock, CalendarDays, Search, Building2, Eye, CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // 🔑 Detectar el Rol del usuario (Forzado en 'candidato' para desarrollo de esta sección)
  const [userRol, setUserRol] = useState(
    () => localStorage.getItem('usuario_rol') || 'candidato' 
  );

  // Menú de navegación adaptado con las secciones exclusivas del candidato
  const [seccionActiva, setSeccionActiva] = useState('buscar-vacantes'); 
  const [nombreUsuario, setNombreUsuario] = useState('Angela Tapias');

  // --- [ESTADO: FILTROS DE BÚSQUEDA] ---
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('Todos');
  const [filtroJornada, setFiltroJornada] = useState('Todos');

  // --- [BASE DE DATOS SIMULADA: VACANTES DISPONIBLES EN LA PLATAFORMA] ---
  const [vacantesGlobales, setVacantesGlobales] = useState([
    { 
      id: 1, 
      empresa: 'Tech Solutions S.A.', 
      puesto: 'Desarrollador React Junior', 
      descripcion: 'Buscamos un perfil proactivo para sumarse al equipo de Frontend.', 
      competencias: 'React, JavaScript, Git', 
      salario: '450000',
      modalidad: 'Remoto',
      jornada: 'Full-time',
      vencimiento: '2026-07-30'
    },
    { 
      id: 2, 
      empresa: 'Global Corp', 
      puesto: 'Diseñador UI/UX Senior', 
      descripcion: 'Responsable de iterar la arquitectura de información y flujos visuales de nuestra Fintech.', 
      competencias: 'Figma, Design Systems, Testing con Usuarios', 
      salario: '850000',
      modalidad: 'Híbrido',
      jornada: 'Full-time',
      vencimiento: '2026-06-15'
    },
    { 
      id: 3, 
      empresa: 'Innovar Digital', 
      puesto: 'Data Analyst Part-time', 
      descripcion: 'Armado de dashboards y cruce de datos comerciales en SQL y PowerBI.', 
      competencias: 'SQL, Python, PowerBI', 
      salario: '320000',
      modalidad: 'Presencial',
      jornada: 'Part-time',
      vencimiento: '2026-08-05'
    }
  ]);

  // --- [ESTADO: POSTULACIONES EFECTUADAS POR EL CANDIDATO] ---
  const [misPostulaciones, setMisPostulaciones] = useState([
    { id: 1, puesto: 'Desarrollador React Junior', empresa: 'Tech Solutions S.A.', fechaAplicacion: '2026-05-18', estado: 'En Revisión' }
  ]);

  // --- [ESTADO: PERFILES DE EMPRESAS DISPONIBLES] ---
  const [perfilesEmpresas, setPerfilesEmpresas] = useState([
    { id: 501, nombre: 'Tech Solutions S.A.', rubro: 'Software & Cloud', ubicacion: 'Buenos Aires, Argentina', descripcion: 'Líderes en transformación digital y outsourcing de talento IT para LATAM.', empleados: '150-500' },
    { id: 502, nombre: 'Global Corp', rubro: 'Fintech & Banca', ubicacion: 'Córdoba, Argentina', descripcion: 'Ecosistema financiero abierto enfocado en microcréditos y accesibilidad digital.', empleados: '500+' },
    { id: 503, nombre: 'Innovar Digital', rubro: 'Marketing & Data', ubicacion: 'Mendoza, Argentina', descripcion: 'Agencia boutique enfocada en analítica avanzada y Growth Hack corporativo.', empleados: '10-50' }
  ]);

  // --- [FUNCIONES DE ACCIÓN] ---
  const handlePostularse = (vacante) => {
    // Evitar duplicados
    if (misPostulaciones.some(p => p.puesto === vacante.puesto && p.empresa === vacante.empresa)) {
      alert('Ya te has postulado a esta vacante anteriormente.');
      return;
    }
    
    const nuevaPostulacion = {
      id: Date.now(),
      puesto: vacante.puesto,
      empresa: vacante.empresa,
      fechaAplicacion: new Date().toISOString().split('T')[0],
      estado: 'CV Recibido'
    };
    
    setMisPostulaciones([nuevaPostulacion, ...misPostulaciones]);
    alert(`¡Postulación enviada con éxito a ${vacante.empresa}! Tu CV fue cargado automáticamente.`);
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate('/auth');
  };

  // --- [LÓGICA DE FILTRADO DINÁMICO DE VACANTES] ---
  const vacantesFiltradas = vacantesGlobales.filter(v => {
    const cumpleTexto = v.puesto.toLowerCase().includes(busquedaTexto.toLowerCase()) || 
                        v.empresa.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
                        v.competencias.toLowerCase().includes(busquedaTexto.toLowerCase());
    const cumpleModalidad = filtroModalidad === 'Todos' || v.modalidad === filtroModalidad;
    const cumpleJornada = filtroJornada === 'Todos' || v.jornada === filtroJornada;
    return cumpleTexto && cumpleModalidad && cumpleJornada;
  });

  return (
    <div style={dashboardLayout}>
      
      {/* MENÚ LATERAL DEL CANDIDATO */}
      <aside style={sidebarStyle}>
        <div>
          <div style={brandStyle}>
            <div style={logoIcon}>360</div>
            <div>
              <h2 style={brandTitle}>Emplea360</h2>
              <span style={brandSub}>Portal de Talento</span>
            </div>
          </div>

          <div style={userCardNav}>
            <div style={avatarPlaceholder}>{nombreUsuario[0]}</div>
            <h4 style={userNameText}>{nombreUsuario}</h4>
            <p style={{ ...userRoleText, color: '#10b981' }}>Candidato Activo</p>
          </div>

          <nav style={navGroup}>
            <button onClick={() => setSeccionActiva('buscar-vacantes')} style={seccionActiva === 'buscar-vacantes' ? btnNavActive : btnNav}>
              <Search size={18} /> <span>Explorar Vacantes</span>
            </button>
            <button onClick={() => setSeccionActiva('mis-postulaciones')} style={seccionActiva === 'mis-postulaciones' ? btnNavActive : btnNav}>
              <Briefcase size={18} /> <span>Mis Postulaciones</span>
            </button>
            <button onClick={() => setSeccionActiva('empresas')} style={seccionActiva === 'empresas' ? btnNavActive : btnNav}>
              <Building2 size={18} /> <span>Perfiles de Empresas</span>
            </button>
          </nav>
        </div>

        <button onClick={handleCerrarSesion} style={btnLogout}>
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main style={mainContentArea}>
        
        {/* ============================================== */}
        {/* SECCIÓN 1: EXPLORAR VACANTES (BUSCAR Y FILTRAR) */}
        {/* ============================================== */}
        {seccionActiva === 'buscar-vacantes' && (
          <div>
            <div style={headerSection}>
              <div>
                <h1 style={titleMain}>Ofertas de Empleo Disponibles</h1>
                <p style={subtitleMain}>Filtra por modalidad de trabajo, salario y encuentra tu próximo desafío laboral.</p>
              </div>
            </div>

            {/* BARRA DE FILTROS AVANZADA */}
            <div style={searchFilterBar}>
              <div style={{ flex: 2, position: 'relative' }}>
                <input 
                  type="text" 
                  value={busquedaTexto}
                  onChange={(e) => setBusquedaTexto(e.target.value)}
                  placeholder="Buscar por puesto, empresa o tecnología (Ej: React)..." 
                  style={{ ...inlineInputFull, paddingLeft: '38px' }}
                />
                <Search size={16} style={searchIconInside} />
              </div>
              
              <div style={{ flex: 1 }}>
                <select value={filtroModalidad} onChange={(e) => setFiltroModalidad(e.target.value)} style={selectStyle}>
                  <option value="Todos">🌍 Todas las Modalidades</option>
                  <option value="Remoto">💻 Remoto</option>
                  <option value="Presencial">🏢 Presencial</option>
                  <option value="Híbrido">🌐 Híbrido</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <select value={filtroJornada} onChange={(e) => setFiltroJornada(e.target.value)} style={selectStyle}>
                  <option value="Todos">⏰ Todas las Jornadas</option>
                  <option value="Full-time">⏱️ Full-time</option>
                  <option value="Part-time">⏳ Part-time</option>
                </select>
              </div>
            </div>

            {/* FEED DE VACANTES FILTRADAS */}
            <div style={vacanciesGrid}>
              {vacanciesGrid.length === 0 || vacantesFiltradas.length === 0 ? (
                <div style={noResultsBox}>No se encontraron vacantes coincidentes con los filtros aplicados.</div>
              ) : (
                vacantesFiltradas.map((v) => (
                  <div key={v.id} style={vacancyCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={companyLabelText}><Building2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> {v.empresa}</span>
                        <h3 style={vacancyTitleText}>{v.puesto}</h3>
                      </div>
                      <span style={salaryBadge}>$ {Number(v.salario).toLocaleString('es-AR')} ARS</span>
                    </div>

                    <div style={tagRowStyle}>
                      <span style={pillBadge}><MapPin size={11} /> {v.modalidad}</span>
                      <span style={pillBadge}><Clock size={11} /> {v.jornada}</span>
                      <span style={{ ...pillBadge, backgroundColor: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
                        <CalendarDays size={11} /> Cierra: {v.vencimiento}
                      </span>
                    </div>

                    <p style={vacancyDescriptionText}>{v.descripcion}</p>
                    
                    <div style={{ marginBottom: '16px', fontSize: '13px' }}>
                      <strong style={{ color: '#94a3b8' }}>Requisitos:</strong> <span style={{ color: '#cbd5e1' }}>{v.competencias}</span>
                    </div>

                    <button onClick={() => handlePostularse(v)} style={btnApplyJob}>
                      Enviar mi Currículum
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SECCIÓN 2: PUESTOS SOLICITADOS (MIS POSTULACIONES) */}
        {/* ============================================== */}
        {seccionActiva === 'mis-postulaciones' && (
          <div style={cardContainer}>
            <h2 style={cardTitleStyle}><Briefcase size={22} style={{ color: '#10b981' }} /> Historial de Puestos Solicitados</h2>
            <p style={{ margin: '-4px 0 20px 0', fontSize: '14px', color: '#94a3b8' }}>
              Revisa el estado en tiempo real de los procesos de selección en los que estás participando.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {misPostulaciones.map((p) => (
                <div key={p.id} style={myApplicationRow}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>{p.puesto}</h4>
                    <span style={{ fontSize: '13px', color: '#38bdf8' }}>{p.empresa} • Solicitado el {p.fechaAplicacion}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={statusBadge}>{p.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SECCIÓN 3: PERFILES DE LAS EMPRESAS            */}
        {/* ============================================== */}
        {seccionActiva === 'empresas' && (
          <div style={cardContainer}>
            <h2 style={cardTitleStyle}><Building2 size={22} style={{ color: '#3b82f6' }} /> Directorio de Empresas Asociadas</h2>
            <p style={{ margin: '-4px 0 20px 0', fontSize: '14px', color: '#94a3b8' }}>
              Conoce en profundidad la cultura, ubicación y rubros industriales de las organizaciones registradas.
            </p>

            <div style={candidateGrid}>
              {perfilesEmpresas.map((emp) => (
                <div key={emp.id} style={companyProfileCard}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={companySquareLogo}>{emp.nombre[0]}</div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>{emp.nombre}</h4>
                        <span style={{ fontSize: '11px', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{emp.rubro}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '10px 0' }}>{emp.descripcion}</p>
                  </div>

                  <div style={companyCardFooter}>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                      📍 {emp.ubicacion} <br/> 👥 {emp.empleados} empleados
                    </div>
                    <button onClick={() => { setBusquedaTexto(emp.nombre); setSeccionActiva('buscar-vacantes'); }} style={btnViewVacancies}>
                      Ver Vacantes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ==============================================
// HOJA DE ESTILOS CSS IN JS (ADAPTACIONES)
// ==============================================
const dashboardLayout = { display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: '"Segoe UI", Roboto, sans-serif', color: '#f8fafc' };
const sidebarStyle = { width: '280px', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', boxSizing: 'border-box', borderRight: '1px solid #334155' };
const brandStyle = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' };
const logoIcon = { width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const brandTitle = { fontSize: '18px', margin: 0, fontWeight: 700 };
const brandSub = { fontSize: '11px', color: '#94a3b8' };
const userCardNav = { backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '24px' };
const avatarPlaceholder = { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', margin: '0 auto 10px auto', color: '#fff' };
const userNameText = { margin: 0, fontSize: '15px' };
const userRoleText = { margin: '2px 0 0 0', fontSize: '12px', fontWeight: 500 };
const navGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const btnNav = { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', border: 'none', backgroundColor: 'transparent', color: '#94a3b8', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' };
const btnNavActive = { ...btnNav, backgroundColor: 'rgba(59,130,246,0.1)', color: '#38bdf8', fontWeight: 600 };
const btnLogout = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)', backgroundColor: 'rgba(244,63,94,0.05)', color: '#f43f5e', cursor: 'pointer', fontWeight: 600, fontSize: '14px' };

const mainContentArea = { flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto' };
const headerSection = { display: 'flex', justifyContent: 'space-between', marginBottom: '24px' };
const titleMain = { fontSize: '26px', margin: 0 };
const subtitleMain = { margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' };
const cardContainer = { backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', height: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' };
const cardTitleStyle = { margin: '0 0 8px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' };

const inlineInputFull = { width: '100%', padding: '11px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', boxSizing: 'border-box', fontSize: '14px' };
const selectStyle = { width: '100%', padding: '11px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', boxSizing: 'border-box', fontSize: '14px', cursor: 'pointer' };

// Barra de Filtros
const searchFilterBar = { display: 'flex', gap: '12px', marginBottom: '24px', backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' };
const searchIconInside = { position: 'absolute', left: '14px', top: '13px', color: '#64748b' };

// Grilla de Vacantes
const vacanciesGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' };
const vacancyCard = { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const companyLabelText = { fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '2px' };
const vacancyTitleText = { margin: 0, fontSize: '18px', color: '#f8fafc' };
const vacancyDescriptionText = { fontSize: '13px', color: '#cbd5e1', margin: '12px 0', lineHeight: '1.5' };
const salaryBadge = { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', height: 'fit-content' };
const tagRowStyle = { display: 'flex', gap: '6px', margin: '10px 0', flexWrap: 'wrap' };
const pillBadge = { display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f172a', color: '#cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' };
const btnApplyJob = { width: '100%', padding: '11px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'background 0.2s' };
const noResultsBox = { padding: '40px', backgroundColor: '#1e293b', borderRadius: '12px', textAling: 'center', color: '#64748b', width: '100%', gridColumn: '1 / -1', textAlign: 'center' };

// Mis Postulaciones
const myApplicationRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' };
const statusBadge = { backgroundColor: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 };

// Tarjetas de Empresas
const candidateGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '15px' };
const companyProfileCard = { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' };
const companySquareLogo = { width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#fff' };
const companyCardFooter = { borderTop: '1px solid #334155', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' };
const btnViewVacancies = { padding: '6px 12px', backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 };
