import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';

export default function DashboardCandidato() {
  const [vacantes, setVacantes] = useState([]);
  const [perfil, setPerfil] = useState({ habilidades: [], experiencia: 0 });
  const [cargandoCV, setCargandoCV] = useState(false);

  useEffect(() => {
    obtenerVacantes();
  }, []);

  const obtenerVacantes = async () => {
    // LLamada simulada al backend en Railway
    const mockVacantes = [
      { id: 1, titulo: "Ejecutivo de Cuentas Senior", nombre_empresa: "San Juan Tec", porcentaje_compatibilidad: 88 },
      { id: 2, titulo: "Asesor Comercial de Intangibles", nombre_empresa: "Cuyo Seguros", porcentaje_compatibilidad: 65 }
    ];
    setVacantes(mockVacantes);
  };

  const handleCargarCV = async () => {
    setCargandoCV(true);
    // Simulación de respuesta inmediata del motor de optimización ATS del backend
    setTimeout(() => {
      setPerfil({
        habilidades: ['Ventas B2B', 'Negociación', 'CRM Salesforce', 'Cierre de Ventas'],
        experiencia: 3
      });
      setCargandoCV(false);
      alert("¡CV optimizado para filtros ATS! El perfil se ha autocompletado con éxito.");
    }, 2000);
  };

  return (
    <div style={{padding: '30px', maxWidth: '1200px', margin: '0 auto'}}>
      <h2>Panel del Candidato</h2>
      <hr/>
      
      {/* Sección Optimización de CV */}
      <section style={{background: '#fff', padding: '20px', borderRadius: '8px', margin: '20px 0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
        <h3>Optimizar mi CV para Filtros ATS</h3>
        <p style={{color: '#666'}}>Sube tu currículum en formato PDF o Word. Nuestro sistema lo transformará y reestructurará de manera inteligente para maximizar el match.</p>
        <button className="btn-primary" onClick={handleCargarCV} disabled={cargandoCV}>
          {cargandoCV ? "Analizando y Mejorando CV..." : "Subir y Analizar Currículum"}
        </button>

        {perfil.habilidades.length > 0 && (
          <div style={{marginTop: '15px', background: '#f0fdf4', padding: '15px', borderRadius: '6px'}}>
            <h4>Datos extraídos y optimizados en tu perfil:</h4>
            <p><strong>Años de Experiencia Comercial:</strong> {perfil.experiencia}</p>
            <p><strong>Keywords / Habilidades Clave:</strong> {perfil.habilidades.join(', ')}</p>
          </div>
        )}
      </section>

      {/* Listado de Ofertas con Match Inteligente */}
      <section>
        <h3>Ofertas Recomendadas en San Juan</h3>
        <div style={{display: 'grid', gap: '20px', marginTop: '15px'}}>
          {vacantes.map(v => (
            <div key={v.id} style={{background: '#fff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #00458e'}}>
              <h4 style={{margin: '0 0 5px 0'}}>{v.titulo}</h4>
              <p style={{margin: '0 0 15px 0', color: '#555'}}>{v.nombre_empresa}</p>
              <ProgressBar porcentaje={v.porcentaje_compatibilidad} />
              <button className="btn-primary" style={{marginTop: '10px', padding: '8px 16px'}}>Postularse</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
