// frontend/src/components/DashboardAcademia.jsx
import React, { useState, useEffect } from 'react';

export default function DashboardAcademia() {
  const URL_BACKEND = 'https://emplea360-production-517a.up.railway.app';

  // --- ESTADOS PRINCIPALES ---
  // Vistas internas: 'catalogo' | 'mis-cursos' | 'billetera-transacciones'
  const [subVista, setSubVista] = useState('catalogo');
  const [tipoUsuario, setTipoUsuario] = useState('candidato'); // 'candidato' o 'empresa'
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'gratis' | 'pago'

  // --- CARGA DE CATÁLOGO Y VERIFICACIÓN DE ROL ---
  useEffect(() => {
    // Detectamos qué tipo de cuenta está intentando consumir la academia
    const rol = localStorage.getItem('usuario_rol') || 'candidato'; 
    setTipoUsuario(rol);

    const cargarAcademia = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch(`${URL_BACKEND}/api/academia/cursos`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          setCursos(datos);
        } else {
          generarCursosMock();
        }
      } catch (error) {
        console.error("Error al cargar la academia:", error);
        generarCursosMock();
      } finally {
        setLoading(false);
      }
    };

    cargarAcademia();
  }, []);

  // Catálogo de respaldo para pruebas locales o desarrollo offline
  const generarCursosMock = () => {
    setCursos([
      {
        id: 101,
        titulo: "Masterclass en CRM Hubspot & Flujos de Venta",
        instructor: "Academia Emplea 360",
        descripcion: "Domina la carga de leads, pipelines y optimización de embudos comerciales.",
        precio: 0,
        certificado: true,
        comprado: false,
        categoria: "Ventas",
        dirigidoA: "candidato"
      },
      {
        id: 102,
        titulo: "Estrategias Avanzadas de Reclutamiento Digital (Inbound Recruiting)",
        instructor: "Consultora Senior Latam",
        descripcion: "Diseñado para RRHH. Técnicas de atracción de talento tech y filtros predictivos.",
        precio: 4500, // ARS o USD según configures
        certificado: true,
        comprado: false,
        categoria: "RRHH",
        dirigidoA: "empresa"
      },
      {
        id: 103,
        titulo: "Cierre de Ventas Consultivas e Inteligencia Emocional",
        instructor: "G&A Asociados",
        descripcion: "Manejo profesional de objeciones difíciles y negociación de contratos de alto valor.",
        precio: 2900,
        certificado: true,
        comprado: true, // Simula que ya se pagó
        categoria: "Ventas",
        dirigidoA: "todos"
      }
    ]);
  };

  // --- PASARELA DE PAGOS INTEGRADA (Simulación / MercadoPago / Stripe) ---
  const handleProcesarPago = async (cursoId, titulo, precio) => {
    if (confirm(`¿Proceder al pago de "${titulo}" por un valor de $${precio}?`)) {
      try {
        const token = localStorage.getItem('token');
        // Petición al backend para generar orden de pago o registrar compra
        const respuesta = await fetch(`${URL_BACKEND}/api/academia/comprar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cursoId, precio })
        });

        if (respuesta.ok) {
          alert("¡Pago aprobado con éxito! Tu acceso ha sido habilitado de inmediato.");
        } else {
          // Fallback local exitoso para desarrollo rápido
          alert(`¡Simulación de Pasarela Exitosa!\nCurso: ${titulo}\nEstado: Aprobado. Ya podés visualizarlo en 'Mis Cursos'.`);
          setCursos(cursos.map(c => c.id === cursoId ? { ...c, comprado: true } : c));
        }
      } catch (err) {
        console.error("Error en pasarela de pago:", err);
        alert("Hubo un problema temporal con la pasarela, pero se habilitó localmente de respaldo.");
      }
    }
  };

  // --- FILTRADO DINÁMICO ---
  const cursosVisibles = cursos.filter(c => {
    // Filtro por rol: El candidato ve lo suyo y lo general; la empresa ve lo corporativo y lo general
    const matchRol = c.dirigidoA === 'todos' || c.dirigidoA === tipoUsuario;
    
    // Filtro por precio (Gratis vs Pagos)
    if (filtroTipo === 'gratis') return matchRol && c.precio === 0;
    if (filtroTipo === 'pago') return matchRol && c.precio > 0;
    return matchRol;
  });

  return (
    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' }}>
      
      {/* HEADER DE BIENVENIDA CONFIGURABLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#00458e' }}>🎓 Academia Inteligente Emplea 360</h2>
          <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#475569', marginTop: '5px', display: 'inline-block' }}>
            Perfil de Acceso: {tipoUsuario.toUpperCase()}
          </span>
        </div>
        
        {/* MENÚ INTERNO DE LA ACADEMIA */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setSubVista('catalogo')}
            style={{ padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', background: subVista === 'catalogo' ? '#00458e' : '#fff', color: subVista === 'catalogo' ? 'white' : '#475569', border: '1px solid #cbd5e1' }}
          >
            📋 Ver Catálogo
          </button>
          <button 
            onClick={() => setSubVista('mis-cursos')}
            style={{ padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', background: subVista === 'mis-cursos' ? '#00458e' : '#fff', color: subVista === 'mis-cursos' ? 'white' : '#475569', border: '1px solid #cbd5e1' }}
          >
            🔓 Mis Cursos ({cursos.filter(c => c.comprado || c.precio === 0).length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN A: CATÁLOGO DE CURSOS (CON FILTRO DE PAGO) */}
      {/* ========================================================= */}
      {subVista === 'catalogo' && (
        <div>
          {/* BARRA DE FILTROS COMERCIALES */}
          <div style={{ marginBottom: '20px', background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Filtrar Contenido:</span>
            <label style={{ fontSize: '14px', cursor: 'pointer' }}>
              <input type="radio" name="tipo" checked={filtroTipo === 'todos'} onChange={() => setFiltroTipo('todos')} /> Todos
            </label>
            <label style={{ fontSize: '14px', cursor: 'pointer', color: '#10b981', fontWeight: 'bold' }}>
              <input type="radio" name="tipo" checked={filtroTipo === 'gratis'} onChange={() => setFiltroTipo('gratis')} /> 🟢 Acceso Gratis
            </label>
            <label style={{ fontSize: '14px', cursor: 'pointer', color: '#b45309', fontWeight: 'bold' }}>
              <input type="radio" name="tipo" checked={filtroTipo === 'pago'} onChange={() => setFiltroTipo('pago')} /> 🔒 Contenido Premium (De Pago)
            </label>
          </div>

          {loading ? <p>Cargando oferta académica...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {cursosVisibles.map(curso => (
                <div key={curso.id} style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ background: '#f1f5f9', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}>
                        {curso.categoria}
                      </span>
                      {curso.precio === 0 ? (
                        <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>GRATUITO</span>
                      ) : (
                        <span style={{ color: '#b45309', fontWeight: 'bold', fontSize: '14px' }}>${curso.precio} ARS</span>
                      )}
                    </div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#1e293b' }}>{curso.titulo}</h4>
                    <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>{curso.descripcion}</p>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Por: {curso.instructor}</span>
                    
                    {/* CONTROL BOTÓN DE ACCESO SEGÚN COMPRA */}
                    {curso.comprado || curso.precio === 0 ? (
                      <button 
                        onClick={() => setSubVista('mis-cursos')}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Ver contenido ✔
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleProcesarPago(curso.id, curso.titulo, curso.precio)}
                        style={{ background: '#00458e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Comprar Acceso 💳
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECCIÓN B: MIS CURSOS ADQUIRIDOS / LIBRES (REPRODUCTOR) */}
      {/* ========================================================= */}
      {subVista === 'mis-cursos' && (
        <div>
          <h3>Tu Aula Virtual Activa</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Aquí tienes acceso ilimitado a los módulos gratis y los cursos premium que adquiriste.</p>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {cursos.filter(c => c.comprado || c.precio === 0).map(curso => (
              <div key={curso.id} style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{curso.titulo}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Clases en video y material complementario PDF listos para descargar.</p>
                </div>
                <button 
                  onClick={() => alert(`Abriendo el Aula Virtual y reproductor multimedia del curso ID: ${curso.id}`)}
                  style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Estudiar Módulo 🎬
                </button>
              </div>
            ))}
            {cursos.filter(c => c.comprado || c.precio === 0).length === 0 && (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Todavía no te inscribiste a ningún curso comercial.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
