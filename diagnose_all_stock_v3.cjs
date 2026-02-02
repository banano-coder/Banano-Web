const path = require('path');
const pgPath = path.resolve(__dirname, '../Proyectobanano/node_modules/pg');
const { Client } = require(pgPath);

async function check() {
    const client = new Client({
        connectionString: 'postgres://postgres:admin@localhost:5432/Bananobd'
    });

    try {
        await client.connect();
        console.log('--- Diagnóstico de Stock Mejorado ---');

        const query = `
            SELECT
                p.id_producto,
                p.nombre AS producto,
                p.activo AS producto_activo,
                v.id_variante_producto,
                v.sku,
                v.activo AS variante_activa,
                COALESCE(i.stock, 0)::int AS stock
            FROM public.producto p
            LEFT JOIN public.variante_producto v ON p.id_producto = v.id_producto
            LEFT JOIN public.inventario i ON i.id_variante_producto = v.id_variante_producto
            ORDER BY p.id_producto, v.id_variante_producto;
        `;

        const res = await client.query(query);
        console.log(`Total de filas (Producto x Variante): ${res.rows.length}`);
        console.table(res.rows);

        const stockCero = res.rows.filter(r => r.stock === 0 || r.id_variante_producto === null);
        console.log(`Productos/Variantes con stock 0 o sin variantes: ${stockCero.length}`);

        const stockCeroActivos = stockCero.filter(r => r.producto_activo && (r.variante_activa !== false));
        console.log(`Productos/Variantes con stock 0/sin variantes (Activos): ${stockCeroActivos.length}`);
        console.table(stockCeroActivos);

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await client.end();
    }
}

check();
