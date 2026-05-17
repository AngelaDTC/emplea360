const fs = require('fs');
const path = require('path');
const { pool } = require('./config/db'); // Tu archivo de conexión

// ... (todo tu código actual de express) ...

app.listen(PORT, async () => {
    console.log(`Servidor EMPLEA 360 corriendo en puerto ${PORT}`);
    
    // ESTO CREA LAS TABLAS AUTOMÁTICAMENTE EN RAILWAY AL SUBIR A GITHUB:
    try {
        const sqlPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(sqlPath)) {
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await pool.query(sql);
            console.log("¡Tablas sincronizadas y creadas con éxito en Railway!");
        }
    } catch (err) {
        console.error("Nota: Las tablas ya existían o hubo un problema al sincronizar:", err.message);
    }
});
