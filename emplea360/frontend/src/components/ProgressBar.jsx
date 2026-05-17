import React from 'react';

export default function ProgressBar({ porcentaje }) {
  return (
    <div style={{margin: '10px 0'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
        <span style={{fontWeight: 'bold', fontSize: '0.9rem'}}>Compatibilidad con la vacante</span>
        <span style={{fontWeight: 'bold', color: '#10b981'}}>{porcentaje}%</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${porcentaje}%` }}></div>
      </div>
    </div>
  );
}
