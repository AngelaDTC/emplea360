import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
    const navigate = useNavigate();

    // URL base de tu backend en Railway
    const URL_BACKEND = 'https://emplea360-production.up.railway.app';

    // 💾 DECLARACIÓN DE ESTADOS LIMPIOS (Sin duplicados y sin romper Vercel)
    const [cvFile] = useState(null); 
    const [previewFoto] = useState(null); 
    const [atsScore] = useState(null);
    const [tieneCambiosSinGuardar, setTieneCambiosSinGuardar] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // 🌟 Nombre con respaldo inmediato en localStorage
    const [nombreUsuario, setNombreUsuario] = useState(() => {
        return localStorage.getItem('usuario_nombre') || 'Candidato';
    });

    // 🔄 EFECTO COMPLETO PARA TRAER EL NOMBRE DE LA BASE DE DATOS
    useEffect(() => {
        const cargarNombreDesdeBD = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const respuesta = await fetch(`${URL_BACKEND}/api/candidato/perfil`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    const nombreReal = datos.nombre || datos.nombre_completo;
                    if (nombreReal && nombreReal.trim() !== "") {
                        setNombreUsuario(nombreReal);
                        localStorage.setItem('usuario_nombre', nombreReal);
                    }
                } else if (respuesta.status === 403) {
                    console.error("Token inválido o vencido (403). Redirigiendo a Login...");
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error al sincronizar con Railway:", error);
            }
        };

        cargarNombreDesdeBD();
    }, [navigate, URL_BACKEND]);

    // De acá para abajo pegás tu 'return (' normal del diseño del componente...
    
