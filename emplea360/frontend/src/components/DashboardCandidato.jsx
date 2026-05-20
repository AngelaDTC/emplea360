import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
    const navigate = useNavigate();

    // URL base de tu backend en Railway
    const URL_BACKEND = 'https://emplea360-production.up.railway.app';

    // ==========================================
    // 💾 1. DECLARACIÓN DE TODOS TUS ESTADOS
    // ⚡ OPTIMIZACIÓN: Carga inmediata usando localStorage como Caché
    // ==========================================
    const [activeTab, setActiveTab] = useState('perfil');
    
    // 🌟 Nombre con respaldo inmediato
    const [nombreUsuario, setNombreUsuario] = useState(() => {
        return localStorage.getItem('usuario_nombre') || 'Candidato';
    });

    // 🔄 EFECTO COMPLETO SIN VARIABLES MUERTAS PARA PASAR EL LINTER
    useEffect(() => {
        const cargarNombreDesdeBD = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login'); // Usamos navigate para que no acuse desuso
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

    // --- Si usás los otros estados (cvFile, previewFoto, etc.), aseguralos abajo o eliminalos si no se usan todavía ---
