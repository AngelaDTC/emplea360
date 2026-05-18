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

// --- CONFIGURACIÓN DEL PROVEEDOR EXTERNO ---
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://api.ultramsg.com/instance12345/messages/chat'; 
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || 'tu_token_aqui';

// Función para crear una pausa artificial de tiempo
const esperarSegundos = (segundos) => new Promise(resolve => setTimeout(resolve, segundos * 1000));

async function enviarWhatsAppRealConDemora(telefonoUsuario, nombreUsuario, codigo) {
    const numeroDestino = telefonoUsuario.replace('+', '').trim();
    const mensaje = `Hola ${nombreUsuario}, tu código de verificación para entrar a Emplea 360 es: *${codigo}*`;

    try {
        console.log(`⏱️ Iniciando temporizador: El mensaje para ${nombreUsuario} se enviará en 30 segundos...`);
        
        // 🚨 AQUÍ SE APLICA LA DEMORA DE 30 SEGUNDOS MANDATORIA
        await esperarSegundos(30);

        // Hacemos el envío externo real una vez cumplido el tiempo
        const response = await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: WHATSAPP_API_TOKEN,
                to: numeroDestino,
                body: mensaje
            })
        });

        const resultado = await response.json().catch(() => ({}));
        console.log(`🚀 [WhatsApp Despachado tras 30s]`, resultado);
    } catch (error) {
        console.error("No se pudo despachar el WhatsApp tras la espera:", error.message);
    }
}

// --- ENDPOINTS ---

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

        // 🚨 LLAMAMOS A LA FUNCIÓN CON LA DEMORA INCORPORADA
        // Nota: No usamos 'await' aquí para que la API le responda rápido al frontend ("Código enviado") 
        // y el backend se quede esperando los 30 segundos en segundo plano sin colgar la página web.
        enviarWhatsAppRealConDemora(telefono, nombre, codigo);

        // Respaldo inmediato en la consola por si necesitás revisar
        console.log(`\n[LOG INTERNO] Código generado para ${email}: ${codigo} (A la espera de los 30s para impactar)\n`);

        res.status(200).json({ mensaje: "Código despachado con éxito. Llegará en unos instantes." });
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
        
        // También aplica los 30 segundos para el flujo de recuperación
        enviarWhatsAppRealConDemora(telefono, userRes.rows[0].email, codigoRecovery);

        res.json({ mensaje: "Código de recuperación enviado de forma exitosa." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor de Emplea360 listo en puerto ${PORT}`));
