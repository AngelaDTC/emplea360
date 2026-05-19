const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'emplea360_super_secret_key_2026';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const codigosVerificacion = new Map();

// Variables de entorno para UltraMsg o similar
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || ''; 
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || '';

const esperarSegundos = (segundos) => new Promise(resolve => setTimeout(resolve, segundos * 1000));

async function enviarWhatsAppRealConDemora(telefonoUsuario, nombreUsuario, codigo) {
    if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
        console.log(`[Simulación] Esperando 30 segundos para el número ${telefonoUsuario}...`);
        await esperarSegundos(30);
        console.log(`[Simulación] Pasaron los 30s. Mensaje listo: Código ${codigo}`);
        return;
    }

    const numeroDestino = telefonoUsuario.replace('+', '').trim();
    const mensaje = `Hola ${nombreUsuario}, tu código de verificación para entrar a Emplea 360 es: *${codigo}*`;

    try {
        await esperarSegundos(30);
        await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: WHATSAPP_API_TOKEN,
                to: numeroDestino,
                body: mensaje
            })
        });
        console.log(`🚀 [WhatsApp Real] Despachado tras 30s a ${numeroDestino}`);
    } catch (error) {
        console.error("Error en envío externo:", error.message);
    }
}

// --- 🛡️ MIDDLEWARE DE AUTENTICACIÓN (Declarado ARRIBA para evitar ReferenceErrors) ---
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'Token no provisto.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido o expirado.' });
        req.usuarioId = decoded.id; // Guardamos el ID del usuario autenticado
        next();
    });
};

// --- 🌐 ENDPOINTS DE AUTENTICACIÓN ---

app.post('/api/auth/register', async (req, res) => {
    const { email, password, telefono, rol, nombre } = req.body;
    try {
        const existeUser = await pool.query('SELECT * FROM usuarios WHERE email = $1 OR telefono = $2', [email, telefono]);
        if (existeUser.rows.length > 0) {
            return res.status(400).json({ error: 'El email o el teléfono ya están registrados.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        
        codigosVerificacion.set(email, {
            email, passwordHash, telefono, rol, nombre, codigo,
            expira: Date.now() + 15 * 60 * 1000
        });

        enviarWhatsAppRealConDemora(telefono, nombre, codigo);

        console.log(`\n🔑 [BACKEND LOG] Código generado para ${email}: ${codigo}\n`);

        res.status(200).json({ 
            mensaje: "Código despachado con éxito.",
            bypassCode: codigo 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/verify-register', async (req, res) => {
    const { email, code } = req.body;
    try {
        const datosTemporales = codigosVerificacion.get(email);
        if (!datosTemporales) return res.status(400).json({ error: 'El código expiró o no existe.' });
        if (datosTemporales.codigo !== code) return res.status(400).json({ error: 'Código incorrecto.' });

        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (email, password_hash, telefono, rol, is_email_verified, is_whatsapp_verified) VALUES ($1, $2, $3, $4, true, true) RETURNING *',
            [datosTemporales.email, datosTemporales.passwordHash, datosTemporales.telefono, datosTemporales.rol]
        );
        
        const usuarioId = nuevoUsuario.rows[0].id;
        if (datosTemporales.rol === 'candidato') {
            await pool.query('INSERT INTO candidatos (usuario_id, nombre_completo) VALUES ($1, $2)', [usuarioId, datosTemporales.nombre]);
        } else {
            await pool.query('INSERT INTO empresas (usuario_id, nombre_empresa, cuit) VALUES ($1, $2, $3)', [usuarioId, datosTemporales.nombre, '20-XXXXXXXX-0']);
        }

        codigosVerificacion.delete(email);
        res.status(201).json({ mensaje: "Cuenta activada con éxito." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM usuarios WHERE email = $1 OR telefono = $2', [identifier, identifier]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        const user = userRes.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta.' });

        const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, rol: user.rol });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email, telefono } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND telefono = $2', [email, telefono]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Datos no encontrados.' });

        const codigoRecovery = Math.floor(100000 + Math.random() * 900000).toString();
        enviarWhatsAppRealConDemora(telefono, userRes.rows[0].email, codigoRecovery);

        res.json({ mensaje: "Código enviado.", bypassCode: codigoRecovery });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- 💾 ENDPOINT UNIFICADO: GUARDAR PERFIL COMPLETO (Se ejecuta buscando por usuario_id) ---
app.put('/api/candidato/perfil', verificarToken, async (req, res) => {
    const { 
        perfil_candidato, 
        carta_presentacion, 
        habilidades, 
        estudios, 
        experiencias, 
        capacitaciones, 
        conocimientos,
        foto_base64,
        cv_base64,
        ats_score,
        ats_consejos
    } = req.body;

    try {
        const consulta = `
            UPDATE candidatos 
            SET 
                perfil_candidato = COALESCE($1, perfil_candidato), 
                carta_presentacion = COALESCE($2, carta_presentacion), 
                habilidades = COALESCE($3, habilidades), 
                estudios = COALESCE($4, estudios), 
                experiencias = COALESCE($5, experiences), 
                capacitaciones = COALESCE($6, capacitaciones), 
                conocimientos = COALESCE($7, conocimientos),
                foto_base64 = COALESCE($8, foto_base64), 
                cv_base64 = COALESCE($9, cv_base64),
                ats_score = COALESCE($10, ats_score),
                ats_consejos = COALESCE($11, ats_consejos)
            WHERE usuario_id = $12
            RETURNING *;
        `;

        const valores = [
            perfil_candidato || null, 
            carta_presentacion || null, 
            habilidades || null, 
            estudios || null, 
            experiencias || null, 
            capacitaciones || null, 
            conocimientos || null,
            foto_base64 || null,
            cv_base64 || null,
            ats_score || null,
            ats_consejos || null,
            req.usuarioId // Sincronizado correctamente con el middleware
        ];

        const resultado = await pool.query(consulta, valores);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "Perfil de candidato no encontrado." });
        }

        res.status(200).json({ 
            mensaje: "🔒 Perfil completo respaldado permanentemente en PostgreSQL.",
            candidato: resultado.rows[0] 
        });

    } catch (error) {
        console.error("Error crítico al guardar el perfil en la base de datos:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar la persistencia." });
    }
});

// --- 📑 ENDPOINT PARA LEER EL PERFIL AL INICIAR EL DASHBOARD (CORREGIDO) ---
app.get('/api/candidato/perfil', verificarToken, async (req, res) => {
    try {
        // Hacemos un JOIN para asegurarnos de traer los datos del candidato 
        // y por si acaso el email o datos de la tabla de usuarios vinculada.
        const resultado = await pool.query(
            `SELECT c.*, u.email 
             FROM candidatos c
             INNER JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.usuario_id = $1`, 
            [req.usuarioId]
        );
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Candidato no encontrado.' });
        }
        
        // Enviamos todo el registro. Asegurate de que en tu base de datos 
        // la columna se llame 'nombre_completo'
        res.json(resultado.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
