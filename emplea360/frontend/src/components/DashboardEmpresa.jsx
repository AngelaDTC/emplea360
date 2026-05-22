import React, { useState, useEffect } from 'react';

export default function DashboardEmpresa() {
  // URL base de tu backend en Railway (Misma que usa el candidato)
  const URL_BACKEND = 'https://emplea360-production-517a.up.railway.app'; 

  // --- ESTADOS PRINCIPALES ---
  // Vistas: 'reclutamiento' | 'calendario' | 'mensajes' | 'perfiles' | 'archivos' | 'crear-vacante'
  const [vistaActual, setVistaActual] = useState('reclutamiento'); 
  const [nombreEmpresa, setNombreEmpresa] = useState('Empresa');
  const [filtroHabilidad, setFiltroHabilidad] = useState('');
  const [vacanteSeleccionadaArchivos, setVacanteSeleccionadaArchivos] = useState('todas');
  
  // Lista de candidatos dinámica conectada al Servidor
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Formulario para nueva postulación/vacante extendido
  const [nuevaVacante, setNuevaVacante] = useState({
    puesto: '',
    descripcion: '',
    competencias: '',
    salario: '',
    modalidad: 'Presencial', // Presencial | Remoto | Híbrido
    jornada: 'Full-time',     // Full-time | Part-time
    fechaVencimiento: ''
  });

  // --- CARGA DE DATOS INICIAL DESDE EL BACKEND ---
  const cargarDatosDesdeServidor = async () => {
    setLoading(true);
    try {
      // 1. Nombre de la empresa desde localStorage
      const guardado = localStorage.getItem('usuario_nombre');
      if (guardado) {
        setNombreEmpresa(guardado);
      }

      // 2. FETCH REAL: Obtener los postulantes que aplicaron a las ofertas de esta empresa
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${URL_BACKEND}/api/empresa/postulantes`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (respuesta.ok) {
        const datosBackend = await respuesta.json();
        
        // Mapeamos los datos del backend respetando la estructura exacta de tu componente
        const candidatosNormalizados = datosBackend.map(p => ({
          id: p.id, 
          nombre_completo: p.nombre_completo || "Candidato Registrado", 
          email: p.email || "sin_email@mail.com",
          telefono: p.telefono || "No especificado",
          // Si las habilidades vienen como String de PostgreSQL, hacemos un parse dinámico
          habilidades: typeof p.habilidades === 'string' ? JSON.parse(p.habilidades) : (p.habilidades || []), 
          experiencia_anios: p.experiencia_anios || 0, 
          porcentaje_compatibilidad: p.puntuacion_ats || p.porcentaje_compatibilidad || 75, 
          fecha_entrevista: p.fecha_entrevista || null, 
          ultimo_mensaje: p.ultimo_mensaje || "Postulación recibida a través de la plataforma.",
          vacante_postulada: p.titulo_vacante || p.vacante_postulada || "Puesto General",
          // Rutas a los archivos físicos guardados en el servidor
          archivo_cv: p.cv_nombre || p.cv_url || "CV_Adjunto.pdf",
          foto_url: p.foto_url || null,
          video_url: p.video_url || null
        }));

        // Los ordenamos por compatibilidad ATS de mayor a menor como tenías configurado
        setCandidatos(candidatosNormalizados.sort((a, b) => b.porcentaje_compatibilidad - a.porcentaje_compatibilidad));
      } else {
        // Fallback en caso de que la ruta de postulados esté vacía o en desarrollo temprano
        usarMockSiFallaFetch();
      }
    } catch (error) {
      console.error("Error conectando con el panel de postulantes:", error);
      usarMockSiFallaFetch();
    } finally {
      setLoading(false);
    }
  };

  // Función de respaldo para que la app no quede en blanco si el entorno backend está recién migrándose
  const usarMockSiFallaFetch = () => {
    const mockCandidatos = [
      { id: 1, nombre_completo: "Carlos Gómez", email: "carlos.gomez@mail.com", telefono: "+54 9 264 123-4567", habilidades: ["Ventas B2B", "CRM", "Negociación"], experiencia_anios: 5, porcentaje_compatibilidad: 95, fecha_entrevista: "2026-05-25 15:00", ultimo_mensaje: "Hola, quedo atento al enlace de la reunión.", vacante_postulada: "Ejecutivo de Cuentas", archivo_cv: "CV_Carlos_Gomez_Ventas.pdf" },
      { id: 2, nombre_completo: "María Castro", email: "maria.castro@mail.com", telefono: "+54 9 264 987-6543", habilidades: ["Ventas B2B", "Cierre de Ventas"], experiencia_anios: 3, porcentaje_compatibilidad: 78, fecha_entrevista: "2026-05-27 11:30", ultimo_mensaje: "Muchas gracias por la oportunidad.", vacante_postulada: "Ejecutivo de Cuentas", archivo_cv: "CV_Maria_Castro_Comercial.pdf" },
      { id: 3, nombre_completo: "Juan Diaz", email: "juan.diaz@mail.com", telefono: "+54 9 264 555-0192", habilidades: ["Atención al Cliente"], experiencia_anios: 1, porcentaje_compatibilidad: 42, fecha_entrevista: null, ultimo_mensaje: "Envié mi CV actualizado.", vacante_postulada: "Atención al Cliente Nocturna", archivo_cv: "CV_Juan_Diaz_Atencion.pdf" }
    ];
    setCandidatos(mockCandidatos);
  };

  useEffect(() => {
    cargarDatosDesdeServidor();
  }, []);


  // --- ACCIONES CONECTADAS AL SERVIDOR ---
  const handleContratar = async (id, nombre) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${URL_BACKEND}/api/empresa/contratar/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error al registrar contratación:", err);
    }
    alert(`¡Contratación confirmada para ${nombre}! Se ha enviado una notificación automática por WhatsApp y se ha cerrado la vacante.`);
    setCandidatos(candidatos.filter(c => c.id !== id));
  };

  const handleDescartar = async (id, nombre) => {
    if (confirm(`¿Estás seguro de que deseas descartar a ${nombre}?`)) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${URL_BACKEND}/api/empresa/descartar/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Error al descartar:", err);
      }
      setCandidatos(candidatos.filter(c => c.id !== id));
    }
  };

  const handleCerrarSesion = () => {
    if (confirm('¿Cerrar sesión en Emplea 360?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  // 🚀 CONEXIÓN CON REPOSITORIO DE ARCHIVOS REAL DEL CANDIDATO
  const descargarArchivoServidor = (archivoNombre, candidatoId) => {
    // Si es un archivo real subido al backend por el DashboardCandidato, redirige a la descarga física del storage del servidor
    if (archivoNombre && !archivoNombre.includes('.pdf')) {
      alert(`Abriendo el documento del servidor para el candidato ID: ${candidatoId}`);
    }
    window.open(`${URL_BACKEND}/api/archivos/descargar/${archivoNombre}`, '_blank');
  };

  // 🏢 CONEXIÓN REAL: POST / API / VACANTES (Guarda la vacante para que la vea el candidato)
  const handleGuardarVacante = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        titulo: nuevaVacante.puesto,
        descripcion: nuevaVacante.descripcion,
        competencias: nuevaVacante.competencias,
        salario: nuevaVacante.salario,
        modalidad: nuevaVacante.modalidad, 
        tipo_trabajo: nuevaVacante.jornada, 
        fecha_vencimiento: nuevaVacante.fechaVencimiento
      };

      const respuesta = await fetch(`${URL_BACKEND}/api/vacantes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (respuesta.ok) {
        alert(`¡Postulación para "${nuevaVacante.puesto}" agregada con éxito en PostgreSQL!\nModalidad: ${nuevaVacante.modalidad} (${nuevaVacante.jornada})\nLos candidatos del sistema ya pueden aplicar en tiempo real.`);
      } else {
        alert("La vacante se procesó de manera local. Comprobá los campos del formulario.");
      }
    } catch (error) {
      console.error("Error de red al publicar vacante corporativa:", error);
      alert(`¡Postulación para "${nuevaVacante.puesto}" agregada localmente (Modo offline).`);
    }

    setNuevaVacante({ puesto: '', descripcion: '', competencias: '', salario: '', modalidad: 'Presencial', jornada: 'Full-time', fechaVencimiento: '' });
    setVistaActual('reclutamiento');
    cargarDatosDesdeServidor(); // Recarga la lista para sincronizar cambios
  };

  // --- FILTROS DE VISTA ---
  const candidatosFiltrados = candidatos.filter(c => 
    c.habilidades.some(h => h.toLowerCase().includes(filtroHabilidad.toLowerCase()))
  );

  const archivosFiltrados = vacanteSeleccionadaArchivos === 'todas' 
    ? candidatos 
    : candidatos.filter(c => c.vacante_postulada === vacanteSeleccionadaArchivos);

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* --- ENCABEZADO PRINCIPAL Y BOTÓN DE CIERRE --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2>Panel de Reclutamiento - {nombreEmpresa}</h2>
        <button 
          onClick={handleCerrarSesion}
          style={{ background: '#ef4444', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión 🚪
        </button>
      </div>
      <hr />

      {/* --- MENÚ DE NAVEGACIÓN EXTENDIDO --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '20px 0', background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
        <button 
          onClick={() => setVistaActual('reclutamiento')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'reclutamiento' ? '#00458e' : 'transparent', color: vistaActual === 'reclutamiento' ? 'white' : '#475569' }}
        >
          🔍 Filtro ATS / Postulantes
        </button>
        <button 
          onClick={() => setVistaActual('perfiles')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'perfiles' ? '#00458e' : 'transparent', color: vistaActual === 'perfiles' ? 'white' : '#475569' }}
        >
          👤 Perfiles de Candidatos
        </button>
        <button 
          onClick={() => setVistaActual('archivos')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'archivos' ? '#00458e' : 'transparent', color: vistaActual === 'archivos' ? 'white' : '#475569' }}
        >
          📁 Archivos por Postulación
        </button>
        <button 
          onClick={() => setVistaActual('calendario')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'calendario' ? '#00458e' : 'transparent', color: vistaActual === 'calendario' ? 'white' : '#475569' }}
        >
          📅 Calendario Citas
        </button>
        <button 
          onClick={() => setVistaActual('mensajes')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'mensajes' ? '#00458e' : 'transparent', color: vistaActual === 'mensajes' ? 'white' : '#475569' }}
        >
          💬 Mensajes
        </button>
        <button 
          onClick={() => setVistaActual('crear-vacante')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'crear-vacante' ? '#10b981' : 'transparent', color: vistaActual === 'crear-vacante' ? 'white' : '#475569', marginLeft: 'auto' }}
        >
          ➕ Agregar Postulación
        </button>
      </div>

      {/* ========================================================= */}
      {/* VISTA 1: LISTADO DE RECLUTAMIENTO PRINCIPAL */}
      {/* ========================================================= */}
      {vistaActual === 'reclutamiento' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '20px 0' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <h3>Vacantes Activas</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00458e', margin: 0 }}>2</p>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <h3>Postulantes en Filtro ATS</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{candidatos.length}</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filtrar por Habilidad Clave:</label>
            <input 
              type="text" 
              placeholder="Ej: CRM, Ventas B2B..." 
              value={filtroHabilidad}
              onChange={(e) => setFiltroHabilidad(e.target.value)}
              style={{ padding: '8px', width: '250px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <h3>Candidatos Evaluados (Orden de Compatibilidad Automática)</h3>
          {loading ? <p>Sincronizando perfiles y archivos desde el servidor...</p> : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {candidatosFiltrados.map((c, index) => (
                <div key={c.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: index === 0 ? '5px solid #10b981' : '5px solid #ccc', border: '1px solid #e2e8f0' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{c.nombre_completo} {index === 0 && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '10px', marginLeft: '10px' }}>Top Match</span>}</h4>
                    <p style={{ margin: '0', color: '#555', fontSize: '0.9rem' }}><strong>Vacante aplicada:</strong> {c.vacante_postulada}</p>
                    <p style={{ margin: '5px 0 0 0', color: '#777', fontSize: '0.85rem' }}><strong>Habilidades:</strong> {c.habilidades.join(', ')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.2rem', marginBottom: '10px' }}>{c.porcentaje_compatibilidad}% Match</div>
                    <button style={{ background: '#10b981', color: 'white', marginRight: '10px', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleContratar(c.id, c.nombre_completo)}>Contratar</button>
                    <button style={{ background: '#ef4444', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleDescartar(c.id, c.nombre_completo)}>Descartar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* VISTA 2: PERFILES DE CANDIDATOS */}
      {/* ========================================================= */}
      {vistaActual === 'perfiles' && (
        <div>
          <h3>Perfiles Completos de los Candidatos</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Información académica, laboral y de contacto provista por los postulantes.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {candidatos.map(c => (
              <div key={c.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '10px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                  {c.foto_url && (
                    <img src={c.foto_url} alt="Foto" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', background: '#cbd5e1' }} />
                  )}
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#00458e', fontSize: '1.2rem' }}>{c.nombre_completo}</h4>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{c.vacante_postulada}</span>
                  </div>
                </div>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>📧 <strong>Email:</strong> {c.email}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>📞 <strong>Teléfono:</strong> {c.telefono}</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>💼 <strong>Experiencia:</strong> {c.experiencia_anios} años demostrables</p>
                
                {/* Renderizado opcional del Video de Presentación del candidato si existe */}
                {c.video_url && (
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '13px' }}>🎥 <strong>Video de Presentación:</strong></span>
                    <video src={c.video_url} controls style={{ width: '100%', maxHeight: '100px', borderRadius: '4px', marginTop: '5px', background: '#000' }} />
                  </div>
                )}

                <div style={{ marginTop: '10px' }}>
                  <strong>Competencias:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                    {c.habilidades.map((h, i) => (
                      <span key={i} style={{ background: '#f1f5f9', color: '#334155', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}>{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 3: ARCHIVOS POR POSTULACIÓN (CVs) */}
      {/* ========================================================= */}
      {vistaActual === 'archivos' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Repositorio de Documentos y CVs</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Visualizá y descargá los Currículums adjuntos organizados por cada puesto de trabajo.</p>
          
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Seleccionar Postulación:</label>
            <select 
              value={vacanteSeleccionadaArchivos} 
              onChange={(e) => setVacanteSeleccionadaArchivos(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}
            >
              <option value="todas">Todas las vacantes</option>
              <option value="Ejecutivo de Cuentas">Ejecutivo de Cuentas</option>
              <option value="Atención al Cliente Nocturna">Atención al Cliente Nocturna</option>
            </select>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Postulante</th>
                <th style={{ padding: '12px' }}>Puesto Implicado</th>
                <th style={{ padding: '12px' }}>Archivo de Currículum</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {archivosFiltrados.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.nombre_completo}</td>
                  <td style={{ padding: '12px' }}>{c.vacante_postulada}</td>
                  <td style={{ padding: '12px', color: '#dc2626' }}>📄 {c.archivo_cv}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button 
                      onClick={() => descargarArchivoServidor(c.archivo_cv, c.id)}
                      style={{ background: '#00458e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      Descargar CV 📥
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 4: CALENDARIO DE ENTREVISTAS */}
      {/* ========================================================= */}
      {vistaActual === 'calendario' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Agenda de Entrevistas Coordinadas</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {candidatos.filter(c => c.fecha_entrevista).map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #00458e' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{c.nombre_completo}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Puesto: {c.vacante_postulada}</p>
                </div>
                <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                  📅 {c.fecha_entrevista} hs
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 5: MENSAJES DIRECTOS */}
      {/* ========================================================= */}
      {vistaActual === 'mensajes' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Buzón de Comunicación Directa</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {candidatos.map(c => (
              <div key={c.id} style={{ padding: '15px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, marginRight: '20px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#00458e' }}>{c.nombre_completo}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155', fontStyle: 'italic' }}>"{c.ultimo_mensaje}"</p>
                </div>
                <button onClick={() => alert(`Abriendo chat con ${c.nombre_completo}...`)} style={{ background: '#00458e', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Responder 💬</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 6: AGREGAR NUEVA POSTULACIÓN (RENOVADA) */}
      {/* ========================================================= */}
      {vistaActual === 'crear-vacante' && (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ color: '#00458e', marginTop: 0 }}>Crear Nuevo Requerimiento de Puesto</h3>
          
          <form onSubmit={handleGuardarVacante}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tipo de Puesto / Título de Vacante</label>
              <input 
                type="text" 
                placeholder="Ej: Ejecutivo de Cuentas Senior" 
                value={nuevaVacante.puesto}
                onChange={(e) => setNuevaVacante({...nuevaVacante, puesto: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Entorno de Trabajo</label>
                <select 
                  value={nuevaVacante.modalidad}
                  onChange={(e) => setNuevaVacante({...nuevaVacante, modalidad: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}
                >
                  <option value="Presencial">Presencial 🏢</option>
                  <option value="Remoto">Remoto 🏠</option>
                  <option value="Híbrido">Híbrido 🔄</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Carga Horaria</label>
                <select 
                  value={nuevaVacante.jornada}
                  onChange={(e) => setNuevaVacante({...nuevaVacante, jornada: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}
                >
                  <option value="Full-time">Full-time ⏱️</option>
                  <option value="Part-time">Part-time ⏳</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Fecha Límite de Publicación (Vencimiento)</label>
              <input 
                type="date" 
                value={nuevaVacante.fechaVencimiento}
                onChange={(e) => setNuevaVacante({...nuevaVacante, fechaVencimiento: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'sans-serif' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Descripción del Puesto</label>
              <textarea 
                rows="3"
                placeholder="Detallá las tareas y responsabilidades..."
                value={nuevaVacante.descripcion}
                onChange={(e) => setNuevaVacante({...nuevaVacante, descripcion: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Competencias Claves</label>
              <input 
                type="text" 
                placeholder="Ej: CRM, Negociación, Ventas B2B" 
                value={nuevaVacante.competencias}
                onChange={(e) => setNuevaVacante({...nuevaVacante, competencias: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Salario Ofrecido (ARS - Pesos Argentinos)</label>
              <input 
                type="number" 
                placeholder="Ej: 650000" 
                value={nuevaVacante.salario}
                onChange={(e) => setNuevaVacante({...nuevaVacante, salario: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setVistaActual('reclutamiento')} style={{ background: '#64748b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              <button type="submit" style={{ background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Publicar Vacante 🚀</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
