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

// Simulación de WhatsApp limpia sin requerir librerías externas
async function enviarWhatsAppRealConDemora(telefonoUsuario, nombreUsuario, codigo) {
    console.log(`[Simulación WhatsApp] Mensaje enviado a ${telefonoUsuario} (${nombreUsuario}): Código ${codigo}`);
    return new Promise(resolve => setTimeout(resolve, 1000));
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

        await enviarWhatsAppRealConDemora(telefono, nombre, codigo);

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
        
        let nombre = '';
        if (user.rol === 'candidato') {
            const candRes = await pool.query('SELECT nombre_completo FROM candidatos WHERE usuario_id = $1', [user.id]);
            if (candRes.rows.length > 0) nombre = candRes.rows[0].nombre_completo;
        } else {
            const empRes = await pool.query('SELECT nombre_empresa FROM empresas WHERE usuario_id = $1', [user.id]);
            if (empRes.rows.length > 0) nombre = empRes.rows[0].nombre_empresa;
        }

        res.json({ token, rol: user.rol, nombre });
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
        await enviarWhatsAppRealConDemora(telefono, userRes.rows[0].email, codigoRecovery);

        res.json({ mensaje: "Código enviado.", bypassCode: codigoRecovery });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/candidato/perfil', verificarToken, async (req, res) => {
    const { perfil_candidato, carta_presentacion } = req.body;
    try {
        const resultado = await pool.query(
            `UPDATE candidatos 
             SET perfil_candidato = COALESCE($1, perfil_candidato), 
                 carta_presentacion = COALESCE($2, carta_presentacion)
             WHERE usuario_id = $3 RETURNING *`,
            [perfil_candidato || null, carta_presentacion || null, req.usuarioId]
        );

        if (resultado.rows.length === 0) return res.status(404).json({ error: "No encontrado." });
        res.status(200).json({ mensaje: "Perfil guardado.", candidato: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/candidato/perfil', verificarToken, async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT c.*, u.email FROM candidatos c
             INNER JOIN usuarios u ON c.usuario_id = u.id WHERE c.usuario_id = $1`, 
            [req.usuarioId]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado.' });
        
        const perfilData = resultado.rows[0];
        res.json({
            ...perfilData,
            nombre: perfilData.nombre_completo, 
            nombre_completo: perfilData.nombre_completo
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor estable corriendo en puerto ${PORT}`));
