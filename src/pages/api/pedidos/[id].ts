import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, cookies }) => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    const token = cookies.get('token')?.value;
    const { id } = params;

    if (!externalApiBase) {
        return new Response(JSON.stringify({
            id: id,
            estado: 'nuevo',
            total: 150.00,
            created_at: new Date().toISOString(),
            usuario: { nombre: 'Cliente Mock 1', email: 'c1@test.com', telefono: '555-1234' },
            items: [
                { id: 1, product_name: 'Banano Box', quantity: 10, unit_price: 15.00, total: 150.00 }
            ]
        }), { status: 200 });
    }

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const response = await fetch(`${externalApiBase}/pedidos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error(`Error fetching order ${id}:`, error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
