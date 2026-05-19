import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardCandidato() {
  const navigate = useNavigate();

  // URL base de tu backend en Railway
  const URL_BACKEND = 'https://emplea360-production.up.railway.app'; 

  // ==========================================
  // 💾 1. DECLARACIÓN DE TODOS TUS ESTADOS
  // ==========================================
  const [activeTab, setActiveTab] = useState('perfil'); 
  const [cvFile, setCvFile] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  
  // 🌟 Estado para el nombre del usuario (Con respaldo de localStorage)
  const [nombreUsuario, setNombreUsuario] = useState(() => {
    return localStorage.getItem('usuario_nombre') || 'Candidato';
  });

  const [perfilCandidato, setPerfilCandidato] = useState('');
  const [cartaPresentacion, setCartaPresentacion] = useState('');
  const [habilidades, setHabilidades] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [experiencias, setExperiencias] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [conocimientos, setConocimientos] = useState([]);

  const [nuevaHabilidad, setNuevaHabilidad] = useState('');
  const [nuevoEstudio, setNuevoEstudio] = useState({ titulo: '', institucion: '', año: '' });
  const [nuevaExperiencia, setNuevaExperiencia] = useState({ puesto: '', empresa: '', periodo: '' });
  const [nuevaCapacitacion, setNuevaCapacitacion] = useState({ nombre: '', entidad: '' });
  const [nuevoConocimiento, setNuevoConocimiento] = useState('');

  const listaHabilidadesSugeridas = ["React.js", "Node.js", "PostgreSQL", "JavaScript", "Metodologías Ágiles", "UI/UX", "Python", "Liderazgo de Equipos", "Gestión Comercial", "Atención al Cliente"];
  const listaConocimientosSugeridas = ["Inglés Técnico", "Excel Avanzado", "Git & GitHub", "Docker", "Bases de Datos Relacionales", "Contabilidad General", "Marketing Digital"];

  const [entrevistas, setEntrevistas] = useState([
    { id: 1, empresa: 'Tech San Juan S.A.', fecha: '2026-05-22', hora: '15:30', estado: 'Pendiente' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [nuevaEntrevista, setNuevaEntrevista] = useState({ empresa: '', fecha: '', hora: '' });
  const diasMes = Array.from({ length: 31 }, (_, i) => i + 1);

  // ==========================================
  // 🔑 2. CARGAR PERFIL DE LA BASE DE DATOS Y LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    const cargarPerfilDesdeBD = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Respaldo inmediato por si la BD tarda: leemos lo que guardó el login
        const nombreLocal = localStorage.getItem('usuario_nombre');
        if (nombreLocal) {
          setNombreUsuario(nombreLocal);
        }

        if (!token) return;

        const respuesta = await fetch(`${URL_BACKEND}/api/candidato/perfil`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          console.log("🔒 Perfil recuperado de PostgreSQL:", datos);
          
          // Si la base de datos trae el nombre, lo actualizamos. 
          // Si viene vacío, dejamos el del localStorage.
          if (datos.nombre_completo && datos.nombre_completo.trim() !== "") {
            setNombreUsuario(datos.nombre_completo);
            localStorage.setItem('usuario_nombre', datos.nombre_completo);
          } else if (datos.nombre && datos.nombre.trim() !== "") {
            setNombreUsuario(datos.nombre);
            localStorage.setItem('usuario_nombre', datos.nombre);
          }
          
          // Cargamos el resto de los campos si existen en la BD
          if (datos.perfil_candidato) setPerfilCandidato(datos.perfil_candidato);
          if (datos.carta_presentacion) setCartaPresentacion(datos.carta_presentacion);
          if (datos.habilidades) setHabilidades(typeof datos.habilidades === 'string' ? JSON.parse(datos.habilidades) : datos.habilidades);
          if (datos.estudios) setEstudios(typeof datos.estudios === 'string' ? JSON.parse(datos.estudios) : datos.estudios);
          if (datos.experiencias) setExperiencias(typeof datos.experiencias === 'string' ? JSON.parse(datos.experiencias) : datos.experiencias);
          if (datos.capacitaciones) setCapacitaciones(typeof datos.capacitaciones === 'string' ? JSON.parse(datos.capacitaciones) : datos.capacitaciones);
          if (datos.conocimientos) setConocimientos(typeof datos.conocimientos === 'string' ? JSON.parse(datos.conocimientos) : datos.conocimientos);
        }
      } catch (error) {
        console.error("Error al cargar los datos iniciales desde la BD:", error);
      }
    };

    cargarPerfilDesdeBD();
  }, [URL_BACKEND]);

  // ==========================================
  // 🔥 3. FUNCIÓN DE PERSISTENCIA AUTOMÁTICA EN LA NUBE
  // ==========================================
  const guardarDatosEnBaseDeDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${URL_BACKEND}/api/candidato/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          perfil_candidato: perfilCandidato,
          carta_presentacion: cartaPresentacion,
          habilidades: JSON.stringify(habilidades), 
          estudios: JSON.stringify(estudios),
          experiencias: JSON.stringify(experiencias),
          capacitaciones: JSON.stringify(capacitaciones),
          conocimientos: JSON.stringify(conocimientos)
        })
      });
    } catch (error) {
      console.error("Error al persistir los datos automáticamente:", error);
    }
  };

  useEffect(() => {
    if (habilidades.length > 0 || perfilCandidato !== '') {
      guardarDatosEnBaseDeDatos();
    }
  }, [perfilCandidato, cartaPresentacion, habilidades, estudios, experiencias, capacitaciones, conocimientos]);

  // ==========================================
  // ⚙️ FUNCIONES DE LÓGICA E INTERACCIÓN
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario_nombre');
    navigate('/');
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      setTimeout(() => {
        setAtsScore({
          score: 92,
          consejos: [
            "Excelente estructura lineal. Formato de columna única detectado.",
            "Palabras clave óptimas para el sector tecnológico / gestión.",
            "Sugerencia: Detallá un poco más tus funciones en el último empleo."
          ]
        });

        setPerfilCandidato(`Profesional proactivo orientado al desarrollo de soluciones eficientes. Mi enfoque principal está en el trabajo en equipo, la adopción de metodologías ágiles y el aporte de valor técnico al crecimiento regional desde mi rol como candidato.`);
        setCartaPresentacion(`Estimado responsable de selección,\n\nMe dirijo a usted con gran entusiasmo para presentar mi postulación a los perfiles activos de su prestigiosa organización. Tras analizar las demandas actuales del sector, considero que mis competencias técnicas y habilidades interpersonales se alinean con sus objetivos comerciales.\n\nAgradezco de antemano su consideración.\n\nAtentamente,\n${nombreUsuario}`);
        setHabilidades(["React.js", "JavaScript", "Node.js", "PostgreSQL"]);
        setEstudios([{ titulo: "Tecnicatura en Desarrollo de Software", institucion: "Universidad Nacional", año: "2025" }]);
        setExperiencias([{ puesto: "Desarrollador Full Stack Trainee", empresa: "Innovación Local S.A.", periodo: "2024 - Presente" }]);
        setCapacitaciones([{ nombre: "Especialización en Arquitecturas Web", entidad: "Academia Emplea 360" }]);
        setConocimientos(["Git & GitHub", "Bases de Datos Relacionales", "Excel Avanzado"]);

        alert("✨ ¡CV procesado con éxito! Se cargaron tus datos y la documentación automática.");
      }, 1200);
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewFoto(URL.createObjectURL(file));
  };

  const addHabilidadManual = () => {
    if (nuevaHabilidad && !habilidades.includes(nuevaHabilidad)) {
      setHabilidades([...habilidades, nuevaHabilidad]);
      setNuevaHabilidad('');
    }
  };

  const addConocimientoManual = () => {
    if (nuevoConocimiento && !conocimientos.includes(nuevoConocimiento)) {
      setConocimientos([...conocimientos, nuevoConocimiento]);
      setNuevoConocimiento('');
    }
  };

  const addEstudioManual = (e) => {
    e.preventDefault();
    if (nuevoEstudio.titulo && nuevoEstudio.institucion) {
      setEstudios([...estudios, nuevoEstudio]);
      setNuevoEstudio({ titulo: '', institucion: '', año: '' });
    }
  };

  const addExperienciaManual = (e) => {
    e.preventDefault();
    if (nuevaExperiencia.puesto && nuevaExperiencia.empresa) {
      setExperiencias([...experiencias, nuevaExperiencia]);
      setNuevaExperiencia({ puesto: '', empresa: '', periodo: '' });
    }
  };

  const addCapacitacionManual = (e) => {
    e.preventDefault();
    if (nuevaCapacitacion.nombre && nuevaCapacitacion.entidad) {
      setCapacitaciones([...capacitaciones, nuevaCapacitacion]);
      setNuevaCapacitacion({ nombre: '', entidad: '' });
    }
  };

  const descargarPdfAts = () => {
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>CV Optimizado - ATS - ${nombreUsuario}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
            .encabezado-ats { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .encabezado-ats h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .encabezado-ats p { margin: 5px 0 0 0; font-size: 12px; color: #555; font-weight: bold; }
            h2 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 25px; text-transform: uppercase; color: #222; }
            p, li { font-size: 13px; }
            .item { margin-bottom: 12px; }
            .item-header { display: flex; justify-content: space-between; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="encabezado-ats">
            <h1>CURRÍCULUM DE ${nombreUsuario.toUpperCase()}</h1>
            <p>EMPLEA 360 - FORMATO ESTÁNDAR DE LECTURA DE SISTEMAS AUTOMATIZADOS (ATS)</p>
          </div>
          <h2>Perfil Profesional</h2>
          <p>${perfilCandidato || 'No especificado.'}</p>
          <h2>Experiencia Laboral</h2>
          ${experiencias.length === 0 ? '<p>No especificada.</p>' : experiencias.map(exp => `<div class="item"><div class="item-header"><span>${exp.puesto} - ${exp.empresa}</span><span>${exp.periodo}</span></div></div>`).join('')}
          <h2>Educación y Formación</h2>
          ${estudios.length === 0 ? '<p>No especificada.</p>' : estudios.map(est => `<div class="item"><div class="item-header"><span>${est.titulo}</span><span>${est.año}</span></div><div>${est.institucion}</div></div>`).join('')}
          <h2>Capacitaciones</h2>
          ${capacitaciones.length === 0 ? '<p>No especificada.</p>' : capacitaciones.map(cap => `<div class="item"><strong>${cap.nombre}</strong> (${cap.entidad})</div>`).join('')}
          <h2>Habilidades Técnicas</h2>
          <p>${habilidades.join(', ') || 'No especificadas.'}</p>
          <h2>Conocimientos Adicionales</h2>
          <p>${conocimientos.join(', ') || 'No especificados.'}</p>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  };

  const abrirModal = () => setShowModal(true);
  const cerrarModal = () => { setShowModal(false); setNuevaEntrevista({ empresa: '', fecha: '', hora: '' }); };
  const handleAddEntrevistaSubmit = (e) => {
    e.preventDefault();
    setEntrevistas([...entrevistas, { id: Date.now(), ...nuevaEntrevista, estado: 'Pendiente' }]);
    cerrarModal();
  };
  const tieneEntrevistaElDia = (dia) => entrevistas.filter(ent => ent.fecha === `2026-05-${dia.toString().padStart(2, '0')}`);

  // Estilo dinámico para los botones activos de la navegación lateral
  const btnStyle = (isActive) => ({
    width: '100%',
    padding: '12px 15px',
    background: isActive ? '#38bdf8' : 'transparent',
    color: isActive ? '#0f172a'
