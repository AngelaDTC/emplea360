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

// --- CONFIGURACIÓN DEL NÚMERO DE WHATSAPP ---
const NUMERO_ADMIN = "542644514587"; // Tu número sin el + ni el 9, formato internacional limpio

// Función para enviar la notificación
async function notificarRegistroWhatsApp(nombreUsuario, telefonoUsuario, codigo) {
    try {
        console.log(`\n==============================================`);
        console.log(`📱 [WHATSAPP OUTBOUND]`);
        console.log(`Destinatario: ${nombreUsuario} (${telefonoUsuario})`);
        console.log(`Mensaje: Tu código de verificación para Emplea 360 es: ${codigo}`);
        console.log(`==============================================\n`);
        
        // Aquí dejamos lista la llamada fetch en caso de que acoples un proveedor de mensajería (ej. UltraMsg, Wassame, ManyChat)
        /*
        await fetch(`https://api.tu-proveedor.com/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: 'tu_token', to: NUMERO_ADMIN, body: `Código: ${codigo}` })
        });
        */
    } catch (e) {
        console.error("Error al despachar el paquete de WhatsApp:", e.message);
    }
}

// --- ENDPOINTS ---

// 1. Registro
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

        // Dispara la acción hacia tu número configurado
        await notificarRegistroWhatsApp(nombre, telefono, codigo);

        res.status(200).json({ mensaje: "Código enviado con éxito." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Verificar Registro
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

// 3. Login Dual
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

// 4. Olvidé mi contraseña
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email, telefono } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND telefono = $2', [email, telefono]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Datos no encontrados.' });

        const codigoRecovery = Math.floor(100000 + Math.random() * 900000).toString();
        
        await notificarRegistroWhatsApp(userRes.rows[0].email, telefono, codigoRecovery);

        res.json({ mensaje: "Código de recuperación enviado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PUERTO ADAPTADO A RAILWAY (EVITA CRASH) ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor Emplea360 corriendo en puerto ${PORT}`));
