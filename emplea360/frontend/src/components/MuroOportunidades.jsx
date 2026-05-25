import React, { useState, useEffect } from 'react';

export default function MuroOportunidades({ tipoUsuario, usuarioId }) {
  const [oportunidades, setOportunidades] = useState([]);
  const [filtro, setFiltro] = useState('');

  // Simulación de carga de datos (reemplazar con tu API/Firebase)
  useEffect(() => {
    const datosMock = [
      { id: 1, empresaId: 'emp_123', titulo: 'Frontend Developer React', empresa: 'Tech Innovators', ubicacion: 'Remoto', descripcion: 'Buscamos experto en React y Tailwind.' },
      { id: 2, empresaId: 'emp_456', titulo: 'Product Designer', empresa: 'Creative Studio', ubicacion: 'Buenos Aires', descripcion: 'Diseño de interfaces UI/UX.' },
    ];
    setOportunidades(datosMock);
  }, []);

  const handlePostularme = (id) => {
    alert(`Te has postulado a la vacante con ID: ${id}`);
    // Aquí iría la lógica para conectar con tu backend
  };

  const handleEliminar = (id) => {
    setOportunidades(oportunidades.filter(op => op.id !== id));
    alert(`Vacante ${id} eliminada`);
  };

  const vacantesFiltradas = oportunidades.filter(op =>
    op.titulo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Muro de Oportunidades</h2>
        
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por puesto..."
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setFiltro(e.target.value)}
        />

        {/* Lista de Tarjetas */}
        <div className="space-y-4">
          {vacantesFiltradas.map((op) => (
            <div key={op.id} className="p-5 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col justify-between sm:flex-row items-start sm:items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{op.titulo}</h3>
                <p className="text-sm font-medium text-blue-600">{op.empresa} • <span className="text-gray-500">{op.ubicacion}</span></p>
                <p className="text-gray-600 mt-2 text-sm">{op.descripcion}</p>
              </div>
              
              {/* Acciones condicionales según el tipo de usuario */}
              <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                {tipoUsuario === 'candidato' && (
                  <button
                    onClick={() => handlePostularme(op.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    Postularme
                  </button>
                )}

                {tipoUsuario === 'empresa' && op.empresaId === usuarioId && (
                  <div className="space-x-2">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition">
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(op.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
