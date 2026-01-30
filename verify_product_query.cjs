const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgres://postgres:admin@localhost:5432/Bananobd'
});

async function check() {
    try {
        console.log('--- Verificando Query de Productos ---');
        const { rows } = await pool.query(`
          SELECT
            p.id_producto,
            c.nombre AS category_name,
            m.nombre AS brand_name,
            p.nombre,
            p.sku_base,
            COALESCE((
              SELECT SUM(inv.stock)::int
              FROM public.variante_producto vp
              LEFT JOIN public.inventario inv ON inv.id_variante_producto = vp.id_variante_producto
              WHERE vp.id_producto = p.id_producto
            ),0) AS total_stock
          FROM public.producto p
          LEFT JOIN public.categoria c ON c.id_categoria = p.id_categoria
          LEFT JOIN public.marca m     ON m.id_marca     = p.id_marca
          LIMIT 5;
        `);
        console.table(rows);

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await pool.end();
    }
}

check();
