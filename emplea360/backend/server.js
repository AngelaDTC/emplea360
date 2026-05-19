const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const https = require('https');

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'emplea360_super_secret_key_2026';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const codigosVerificacion = new Map();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || ''; 
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || '';

const esperarSegundos = (segundos) => new Promise(resolve => setTimeout(resolve, segundos * 1000));

async function enviarWhatsAppRealConDemora(telefonoUsuario, nombreUsuario, codigo) {
    if (!WHATSAPP_API_URL || WHATSAPP_API_URL.trim() === '' || !WHATSAPP_API_TOKEN) {
        console.log(`[Simulación] Esperando 30 segundos para el número ${telefonoUsuario}...`);
        await esperarSegundos(30);
        console.log(`[Simulación] Pasaron los 30s. Mensaje listo: Código ${codigo}`);
        return;
    }

    const numeroDestino = telefonoUsuario.replace('+', '').trim();
    const mensaje = `Hola ${nombreUsuario}, tu código de verificación para entrar a Emplea 360 es: *${codigo}*`;

    try {
        await esperarSegundos(30);

        const cuerpoDatos = JSON.stringify({
            token: WHATSAPP_API_TOKEN,
            to: numeroDestino,
            body: mensaje
        });

        const opciones = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(cuerpoDatos)
            }
        };

        // 🌟 CORRECCIÓN CRÍTICA: Se ejecuta directamente sin asignar variables que enojen al Linter
        https.request(WHATSAPP_API_URL, opciones, (resHttp) => {
            console.log(`🚀 [WhatsApp Real] Código de respuesta: ${resHttp.statusCode}`);
        }).on('error', (error) => {
            console.error("Error en envío externo de WhatsApp:", error.message);
        }).write(cuerpoDatos);

    } catch (error) {
        console.error("Error en bloque de envío externo:", error.message);
    }
}

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'Token no provisto.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido o expirado.' });
        req.usuarioId = decoded.id;
        next();
    });
};

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
