import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgres://postgres:admin@localhost:5432/Bananobd'
});

async function check() {
    try {
        console.log('Connecting to database...');
        const { rows } = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'categoria'
        `);
        console.log('Columns in categoria:');
        if (rows.length === 0) {
            console.log('Table "categoria" not found or no columns.');
        } else {
            rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
