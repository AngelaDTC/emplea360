// frontend/src/components/DashboardEmpresa.jsx
import React, { useState, useEffect } from 'react';

export default function DashboardEmpresa() {
  // --- ESTADOS PRINCIPALES ---
  const [vistaActual, setVistaActual] = useState('reclutamiento'); // 'reclutamiento' | 'calendario' | 'mensajes' | 'crear-vacante'
  const [nombreEmpresa, setNombreEmpresa] = useState('Empresa');
  const [filtroHabilidad, setFiltroHabilidad] = useState('');
  
  // Lista de candidatos dinámica
  const [candidatos, setCandidatos] = useState([]);

  // Formulario para nueva postulación/vacante
  const [nuevaVacante, setNuevaVacante] = useState({
    puesto: '',
    descripcion: '',
    competencias: '',
    salario: ''
  });

  // --- CARGA DE DATOS INICIAL ---
  useEffect(() => {
    const guardado = localStorage.getItem('usuario_nombre');
    if (guardado) {
      setNombreEmpresa(guardado);
    }

    const mockCandidatos = [
      { id: 1, nombre_completo: "Carlos Gómez", habilidades: ["Ventas B2B", "CRM", "Negociación"], experiencia_anios: 5, porcentaje_compatibilidad: 95, fecha_entrevista: "2026-05-25 15:00", ultimo_mensaje: "Hola, quedo atento al enlace de la reunión." },
      { id: 2, nombre_completo: "María Castro", habilidades: ["Ventas B2B", "Cierre de Ventas"], experiencia_anios: 3, porcentaje_compatibilidad: 78, fecha_entrevista: "2026-05-27 11:30", ultimo_mensaje: "Muchas gracias por la oportunidad." },
      { id: 3, nombre_completo: "Juan Diaz", habilidades: ["Atención al Cliente"], experiencia_anios: 1, porcentaje_compatibilidad: 42, fecha_entrevista: null, ultimo_mensaje: "Envié mi CV actualizado." }
    ];
    setCandidatos(mockCandidatos.sort((a, b) => b.porcentaje_compatibilidad - a.porcentaje_compatibilidad));
  }, []);

  // --- ACCIONES ACCESORIAS ---
  const handleContratar = (id, nombre) => {
    alert(`¡Contratación confirmada para ${nombre}! Se ha enviado una notificación automática por WhatsApp y se ha cerrado la vacante.`);
    setCandidatos(candidatos.filter(c => c.id !== id));
  };

  const handleDescartar = (id, nombre) => {
    if (confirm(`¿Estás seguro de que deseas descartar a ${nombre}?`)) {
      setCandidatos(candidatos.filter(c => c.id !== id));
    }
  };

  const handleCerrarSesion = () => {
    if (confirm('¿Cerrar sesión en Emplea 360?')) {
      localStorage.clear();
      window.location.href = '/'; // O usar navigate('/') si pasás el hook por props
    }
  };

  const handleGuardarVacante = (e) => {
    e.preventDefault();
    alert(`¡Postulación para "${nuevaVacante.puesto}" agregada con éxito!\nLos candidatos ahora podrán visualizarla y subir sus CVs desde su panel.`);
    setNuevaVacante({ puesto: '', descripcion: '', competencias: '', salario: '' });
    setVistaActual('reclutamiento'); // Volver al panel principal
  };

  // Filtrado de candidatos en base a la barra de búsqueda
  const candidatosFiltrados = candidatos.filter(c => 
    c.habilidades.some(h => h.toLowerCase().includes(filtroHabilidad.toLowerCase()))
  );

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

      {/* --- MENÚ DESPLEGABLE / BARRA DE NAVEGACIÓN --- */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0', background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
        <button 
          onClick={() => setVistaActual('reclutamiento')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'reclutamiento' ? '#00458e' : 'transparent', color: vistaActual === 'reclutamiento' ? 'white' : '#475569' }}
        >
          🔍 Filtro ATS / Postulantes
        </button>
        <button 
          onClick={() => setVistaActual('calendario')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'calendario' ? '#00458e' : 'transparent', color: vistaActual === 'calendario' ? 'white' : '#475569' }}
        >
          📅 Calendario de Entrevistas
        </button>
        <button 
          onClick={() => setVistaActual('mensajes')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'mensajes' ? '#00458e' : 'transparent', color: vistaActual === 'mensajes' ? 'white' : '#475569' }}
        >
          💬 Mensajes Directos
        </button>
        <button 
          onClick={() => setVistaActual('crear-vacante')}
          style={{ padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: vistaActual === 'crear-vacante' ? '#10b981' : 'transparent', color: vistaActual === 'crear-vacante' ? 'white' : '#475569', marginLeft: 'auto' }}
        >
          ➕ Agregar Postulación (Puesto)
        </button>
      </div>

      {/* ========================================================= */}
      {/* VISTA 1: LISTADO DE RECLUTAMIENTO PRINCIPAL (TU VISTA ORIGINAL) */}
      {/* ========================================================= */}
      {vistaActual === 'reclutamiento' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '20px 0' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <h3>Vacantes Activas</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00458e', margin: 0 }}>1</p>
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
          <div style={{ display: 'grid', gap: '15px' }}>
            {candidatosFiltrados.map((c, index) => (
              <div key={c.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: index === 0 ? '5px solid #10b981' : '5px solid #ccc', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{c.nombre_completo} {index === 0 && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '10px', marginLeft: '10px' }}>Top Match</span>}</h4>
                  <p style={{ margin: '0', color: '#555', fontSize: '0.9rem' }}><strong>Experiencia:</strong> {c.experiencia_anios} años</p>
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
        </>
      )}

      {/* ========================================================= */}
      {/* VISTA 2: CALENDARIO DE ENTREVISTAS COORDINADAS */}
      {/* ========================================================= */}
      {vistaActual === 'calendario' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Agenda de Entrevistas Coordinadas</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Cronograma de citas programadas automáticamente tras el primer filtro ATS.</p>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {candidatos.filter(c => c.fecha_entrevista).map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #00458e' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{c.nombre_completo}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Puesto: Especialista en Ventas</p>
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
      {/* VISTA 3: MENSAJES DIRECTOS (POSTULANTES QUE ENVIARON CV) */}
      {/* ========================================================= */}
      {vistaActual === 'mensajes' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Buzón de Comunicación Directa</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Chats e interacciones inmediatas con postulantes activos.</p>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {candidatos.map(c => (
              <div key={c.id} style={{ padding: '15px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, marginRight: '20px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#00458e' }}>{c.nombre_completo}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155', fontStyle: 'italic' }}>
                    "{c.ultimo_mensaje || 'Sin mensajes recientes.'}"
                  </p>
                </div>
                <button 
                  onClick={() => alert(`Abriendo chat privado de WhatsApp o interno con ${c.nombre_completo}...`)}
                  style={{ background: '#00458e', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Responder 💬
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 4: AGREGAR NUEVA POSTULACIÓN / REQUERIMIENTO */}
      {/* ========================================================= */}
      {vistaActual === 'crear-vacante' && (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ color: '#00458e', marginTop: 0 }}>Crear Nuevo Requerimiento de Puesto</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
            Completá los campos del puesto. Los candidatos que apliquen tendrán la posibilidad de cargar directamente su currículum desde la plataforma.
          </p>

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

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Descripción del Puesto</label>
              <textarea 
                rows="4"
                placeholder="Detallá las tareas, responsabilidades y el día a día de la posición..."
                value={nuevaVacante.descripcion}
                onChange={(e) => setNuevaVacante({...nuevaVacante, descripcion: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Competencias Claves Requeridas</label>
              <input 
                type="text" 
                placeholder="Ej: CRM, Negociación, Ventas B2B (Separadas por coma)" 
                value={nuevaVacante.competencias}
                onChange={(e) => setNuevaVacante({...nuevaVacante, competencias: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>SalarioOfrecido (en ARS - Pesos Argentinos)</label>
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
              <button 
                type="button" 
                onClick={() => setVistaActual('reclutamiento')}
                style={{ background: '#64748b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                style={{ background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Publicar Vacante 🚀
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
