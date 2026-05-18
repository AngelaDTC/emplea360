const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const nodemailer = require('nodemailer'); // <-- Para envíos de correos reales

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'emplea360_super_secret_key_2026';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Configuración de correo saliente (Usa variables de entorno o credenciales directas de Gmail/Outlook)
// Para que funcione real, en Railway deberás agregar las variables SMTP_USER y SMTP_PASS
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER || 'tu_correo_de_pruebas@gmail.com', 
        pass: process.env.SMTP_PASS || 'tu_contraseña_de_aplicacion'
    }
});

const codigosVerificacion = new Map();

// --- ENDPOINTS AUTENTICACIÓN ---

// 1. Registro con Generación de Códigos Integrado
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

        // Enlace automatizado para WhatsApp que abre el chat del usuario con su código listo para enviarse
        const mensajeWhatsApp = encodeURIComponent(`Hola ${nombre}, tu código de activación para Emplea 360 es: ${codigo}`);
        const linkWhatsApp = `https://wa.me/${telefono.replace('+', '')}?text=${mensajeWhatsApp}`;

        // Intentar envío de correo real (Failsafe)
        try {
            await transporter.sendMail({
                from: '"Emplea 360" <no-reply@emplea360.com>',
                to: email,
                subject: "Tu código de verificación - Emplea 360",
                text: `Hola ${nombre}, tu código de verificación es: ${codigo}`
            });
            console.log(`[Email] Código enviado con éxito a ${email}`);
        } catch (mailErr) {
            console.log("[Email simulado en consola] Código:", codigo);
        }

        // Devolvemos el link de WhatsApp al Frontend por si quiere auto-enviárselo
        res.status(200).json({ 
            mensaje: "Código generado con éxito.", 
            whatsappLink: linkWhatsApp 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Verificar Cuenta Creada
app.post('/api/auth/verify-register', async (req, res) => {
    const { email, code } = req.body;
    try {
        const datosTemporales = codigosVerificacion.get(email);
        if (!datosTemporales) return res.status(400).json({ error: 'Registro expirado o inexistente.' });
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

// 3. Login Dual (Email o Teléfono)
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

// 4. Solicitar Recuperación de Contraseña
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email, telefono } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND telefono = $2', [email, telefono]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Datos incorrectos.' });

        const codigoRecovery = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[RECOVERY CODE]: ${codigoRecovery}`);

        res.json({ mensaje: "Código de recuperación despachado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
