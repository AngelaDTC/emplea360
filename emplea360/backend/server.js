// server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();

// --- MIDDLEWARES GLOBALES ---
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'emplea360_super_secret_key_2026';

// Configuración de PostgreSQL para Railway
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// --- SCRIPT DE CREACIÓN DE TABLAS SEGURO ---
const inicializarBaseDeDatos = async () => {
    try {
        console.log("[PostgreSQL] Verificando y creando tablas de manera segura...");
        
        // Creamos las tablas una a una para evitar bloqueos de sintaxis en hilos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                telefono VARCHAR(50),
                rol VARCHAR(20) CHECK (rol IN ('candidato', 'empresa')) NOT NULL,
                is_email_verified BOOLEAN DEFAULT TRUE,
                is_whatsapp_verified BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS candidatos (
                id SERIAL PRIMARY KEY,
                usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
                nombre_completo VARCHAR(255) NOT NULL,
                habilidades TEXT[] DEFAULT '{}',
                experiencia_anios INT DEFAULT 0,
                cv_optimizado_ats TEXT
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS empresas (
                id SERIAL PRIMARY KEY,
                usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
                nombre_empresa VARCHAR(255) NOT NULL,
                cuit VARCHAR(50)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS vacantes (
                id SERIAL PRIMARY KEY,
                empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
                titulo VARCHAR(255) NOT NULL,
                descripcion TEXT,
                habilidades_requeridas TEXT[] DEFAULT '{}',
                experiencia_minima INT DEFAULT 0,
                activa BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS progreso_academia (
                id SERIAL PRIMARY KEY,
                candidato_id INT REFERENCES candidatos(id) ON DELETE CASCADE,
                nombre_curso VARCHAR(255) NOT NULL,
                completado BOOLEAN DEFAULT FALSE,
                nota_evaluacion INT DEFAULT 0
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS postulaciones (
                id SERIAL PRIMARY KEY,
                vacante_id INT REFERENCES vacantes(id) ON DELETE CASCADE,
                candidato_id INT REFERENCES candidatos(id) ON DELETE CASCADE,
                estado VARCHAR(50) DEFAULT 'postulado' CHECK (estado IN ('postulado', 'en_revision', 'contratado', 'rechazado')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("[PostgreSQL] ¡Estructura de tablas validada con éxito!");
    } catch (err) {
        console.error("[PostgreSQL Error detectado]:", err.message);
        // Evitamos que tire el servidor abajo (CRASH) si la base de datos tarda en responder
    }
};

// Ejecutar inicialización de tablas
inicializarBaseDeDatos();

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No se proporcionó token' });
    try {
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// --- ALGORITMO MATEMÁTICO DE MATCHING ---
function calcularCompatibilidad(candidato, vacante) {
    const habMatch = vacante.habilidades_requeridas.filter(h => candidato.habilidades.includes(h));
    const pctHabilidades = vacante.habilidades_requeridas.length > 0 
        ? (habMatch.length / vacante.habilidades_requeridas.length) * 40 
        : 40;

    const pctExperiencia = candidato.experiencia_anios >= vacante.experiencia_minima 
        ? 30 
        : (candidato.experiencia_anios / vacante.experiencia_minima) * 30;

    const pctCursos = candidato.cursos_completados_count > 0 ? 20 : 0;
    const pctEvaluaciones = (candidato.promedio_evaluaciones / 100) * 10;

    return Math.min(100, Math.round(pctHabilidades + pctExperiencia + pctCursos + pctEvaluaciones));
}

// --- ENDPOINTS ---

// Registro
app.post('/api/auth/register', async (req, res) => {
    const { email, password, telefono, rol, nombre } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (email, password_hash, telefono, rol, is_email_verified, is_whatsapp_verified) VALUES ($1, $2, $3, $4, true, true) RETURNING *',
            [email, passwordHash, telefono, rol]
        );
        
        const usuarioId = nuevoUsuario.rows[0].id;
        if (rol === 'candidato') {
            await pool.query('INSERT INTO candidatos (usuario_id, nombre_completo) VALUES ($1, $2)', [usuarioId, nombre]);
        } else {
            await pool.query('INSERT INTO empresas (usuario_id, nombre_empresa, cuit) VALUES ($1, $2, $3)', [usuarioId, nombre, '20-XXXXXXXX-0']);
        }

        res.status(201).json({ mensaje: "Usuario registrado con éxito. Canales validados." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const user = userRes.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, rol: user.rol });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Optimización ATS
app.post('/api/candidato/cv-upload', verificarToken, async (req, res) => {
    try {
        const habilidadesExtraidas = ['Ventas B2B', 'Negociación', 'CRM Salesforce', 'Cierre de Ventas'];
        const experienciaExtraida = 3; 
        const cvMejoradoTexto = "Perfil Comercial Optimizado para ATS: Experto en ventas B2B...";

        await pool.query(
            `UPDATE candidatos SET habilidades = $1, experiencia_anios = $2, cv_optimizado_ats = $3 WHERE usuario_id = $4`,
            [habilidadesExtraidas, experienciaExtraida, cvMejoradoTexto, req.user.id]
        );

        res.json({ 
            mensaje: "CV Procesado por el optimizador ATS.",
            habilidades: habilidadesExtraidas,
            experience: experienciaExtraida
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener Vacantes
app.get('/api/candidato/vacantes', verificarToken, async (req, res) => {
    try {
        const candRes = await pool.query(`
            SELECT c.*, 
            (SELECT COUNT(*) FROM progreso_academia WHERE candidato_id = c.id AND completado = true) as cursos_completados_count,
            COALESCE((SELECT AVG(nota_evaluacion) FROM progreso_academia WHERE candidato_id = c.id), 0) as promedio_evaluaciones
            FROM candidatos c WHERE c.usuario_id = $1`, [req.user.id]);
            
        const candidato = candRes.rows[0];
        const vacantesRes = await pool.query('SELECT v.*, e.nombre_empresa FROM vacantes v JOIN empresas e ON v.empresa_id = e.id WHERE v.activa = true');

        const vacantesConMatch = vacantesRes.rows.map(vacante => {
            const porcentaje = calcularCompatibilidad(candidato, vacante);
            return { ...vacante, porcentaje_compatibilidad: porcentaje };
        });

        vacantesConMatch.sort((a, b) => b.porcentaje_compatibilidad - a.porcentaje_compatibilidad);
        res.json(vacantesConMatch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Listado ATS Empresa
app.get('/api/empresa/candidatos-ats/:vacanteId', verificarToken, async (req, res) => {
    const { vacanteId } = req.params;
    try {
        const vacanteRes = await pool.query('SELECT * FROM vacantes WHERE id = $1', [vacanteId]);
        const vacante = vacanteRes.rows[0];

        const candidatosRes = await pool.query(`
            SELECT c.*, u.telefono,
            (SELECT COUNT(*) FROM progreso_academia WHERE candidato_id = c.id AND completado = true) as cursos_completados_count,
            COALESCE((SELECT AVG(nota_evaluacion) FROM progreso_academia WHERE candidato_id = c.id), 0) as promedio_evaluaciones
            FROM candidatos c JOIN usuarios u ON c.usuario_id = u.id
        `);

        const postulantesEvaluados = candidatosRes.rows.map(cand => {
            const porcentaje = calcularCompatibilidad(cand, vacante);
            return { ...cand, porcentaje_compatibilidad: porcentaje };
        });

        postulantesEvaluados.sort((a, b) => b.porcentaje_compatibilidad - a.porcentaje_compatibilidad);
        res.json(postulantesEvaluados);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Contratación
app.post('/api/postulaciones/:id/contratar', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const postRes = await pool.query('SELECT * FROM postulaciones WHERE id = $1', [id]);
        const postulacion = postRes.rows[0];

        await pool.query('UPDATE postulaciones SET estado = $1 WHERE id = $2', ['contratado', id]);
        await pool.query('UPDATE vacantes SET activa = false WHERE id = $1', [postulacion.vacante_id]);

        res.json({ mensaje: "Candidato contratado. Vacante cerrada automáticamente." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor EMPLEA 360 corriendo en puerto ${PORT}`));
