import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
    const navigate = useNavigate();

    // URL base de tu backend en Railway (Fuera del JSX se comenta con //)
    const URL_BACKEND = 'https://emplea360-production.up.railway.app';

    // 💾 1. DECLARACIÓN DE TODOS TUS ESTADOS
    // Dejamos solo la variable de lectura, o comentamos la línea si no usás el estado todavía:
const [cvFile] = useState(null); 
const [previewFoto] = useState(null); 
const [atsScore] = useState(null);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [atsScore, setAtsScore] = useState(null);

    // Estado para controlar visualmente si hay cambios sin guardar en la nube
    const [tieneCambiosSinGuardar, setTieneCambiosSinGuardar] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // 🌟 Nombre con respaldo inmediato
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
                }
            } catch (error) {
                console.error("Error al sincronizar con Railway:", error);
            }
        };

        cargarNombreDesdeBD();
    }, [navigate, URL_BACKEND]);

    // ... El resto de tu código del return para abajo queda exactamente igual ...
                }
            } catch (error) {
                console.error("Error al sincronizar con Railway:", error);
            }
        };

        cargarNombreDesdeBD();
    }, [navigate, URL_BACKEND]);

    // --- Si usás los otros estados (cvFile, previewFoto, etc.), aseguralos abajo o eliminalos si no se usan todavía ---
