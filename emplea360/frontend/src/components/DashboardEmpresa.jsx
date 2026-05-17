// frontend/src/components/DashboardEmpresa.jsx
import React, { useState, useEffect } from 'react';

export default function DashboardEmpresa() {
  const [candidatos, setCandidatos] = useState([]);
  const [filtroHabilidad, setFiltroHabilidad] = useState('');

  useEffect(() => {
    // Simulación de carga de datos ordenados por compatibilidad (Filtro ATS del backend)
    const mockCandidatos = [
      { id: 1, nombre_completo: "Carlos Gómez", habilidades: ["Ventas B2B", "CRM", "Negociación"], experiencia_anios: 5, porcentaje_compatibilidad: 95, estado: "pendiente" },
      { id: 2, nombre_completo: "María Castro", habilidades: ["Ventas B2B", "Cierre de Ventas"], experiencia_anios: 3, porcentaje_compatibilidad: 78, estado: "pendiente" },
      { id: 3, nombre_completo: "Juan Diaz", habilidades: ["Atención al Cliente"], experiencia_anios: 1, porcentaje_compatibilidad: 42, estado: "pendiente" }
    ];
    // Garantiza que los mejores calificados aparezcan primero
    setCandidatos(mockCandidatos.sort((a, b) => b.porcentaje_compatibilidad - a.porcentaje_compatibilidad));
  }, []);

  const handleContratar = (id, nombre) => {
    alert(`¡Contratación confirmada para ${nombre}! Se ha enviado una notificación automática por WhatsApp y se ha cerrado la vacante.`);
    setCandidatos(candidatos.filter(c => c.id !== id));
  };

  const candidatosFiltrados = candidatos.filter(c => 
    c.habilidades.some(h => h.toLowerCase().includes(filtroHabilidad.toLowerCase()))
  );

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Panel de Reclutamiento - Empresa</h2>
      <hr />

      {/* Métricas e Indicadores Rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '20px 0' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h3>Vacantes Activas</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00458e', margin: 0 }}>1</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h3>Postulantes en Filtro ATS</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{candidatos.length}</p>
        </div>
      </div>

      {/* Barra de Filtros Avanzada */}
      <div style={{ marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filtrar por Habilidad Clave:</label>
        <input 
          type="text" 
          placeholder="Ej: CRM, Ventas B2B..." 
          value={filtroHabilidad}
          onChange={(e) => setFiltroHabilidad(e.target.value)}
          style={{ padding: '8px', width: '250px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
      </div>

      {/* Listado de Candidatos Inteligente */}
      <h3>Candidatos Evaluados (Orden de Compatibilidad Automática)</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {candidatosFiltrados.map((c, index) => (
          <div key={c.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: index === 0 ? '5px solid #10b981' : '5px solid #ccc' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>{c.nombre_completo} {index === 0 && <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '10px', marginLeft: '10px' }}>Top Match</span>}</h4>
              <p style={{ margin: '0', color: '#555', fontSize: '0.9rem' }}><strong>Experiencia:</strong> {c.experiencia_anios} años</p>
              <p style={{ margin: '5px 0 0 0', color: '#777', fontSize: '0.85rem' }}><strong>Habilidades:</strong> {c.habilidades.join(', ')}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.2rem', marginBottom: '10px' }}>{c.porcentaje_compatibilidad}% Match</div>
              <button className="btn-primary" style={{ background: '#10b981', color: 'white', marginRight: '10px' }} onClick={() => handleContratar(c.id, c.nombre_completo)}>Contratar</button>
              <button className="btn-primary" style={{ background: '#ef4444', color: 'white' }}>Descartar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
