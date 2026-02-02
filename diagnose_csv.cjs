const path = require('path');
const pgPath = path.resolve(__dirname, '../Proyectobanano/node_modules/pg');
const { Client } = require(pgPath);

async function check() {
    const client = new Client({
        connectionString: 'postgres://postgres:admin@localhost:5432/Bananobd'
    });

    try {
        await client.connect();
        const query = `
            SELECT
                p.id_producto,
                p.nombre,
                p.activo,
                v.id_variante_producto,
                v.sku,
                v.activo as v_activo,
                COALESCE(i.stock, 0) as stock
            FROM public.producto p
            LEFT JOIN public.variante_producto v ON v.id_producto = p.id_producto
            LEFT JOIN public.inventario i ON i.id_variante_producto = v.id_variante_producto
            ORDER BY p.id_producto;
        `;

        const res = await client.query(query);
        console.log("ID|NOMBRE|P_ACTIVO|VAR_ID|SKU|V_ACTIVO|STOCK");
        res.rows.forEach(r => {
            console.log(`${r.id_producto}|${r.nombre}|${r.activo}|${r.id_variante_producto}|${r.sku}|${r.v_activo}|${r.stock}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();
