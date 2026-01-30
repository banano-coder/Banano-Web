import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, cookies }) => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    const token = cookies.get('token')?.value;

    if (!externalApiBase) {
        console.warn("PUBLIC_EXTERNAL_API_BASE not defined. Returning Mock Data for Orders.");
        return new Response(JSON.stringify({
            data: [
                { id: 101, estado: 'nuevo', total: 150.00, created_at: new Date().toISOString(), usuario: { nombre: 'Cliente Mock 1', email: 'c1@test.com' } },
                { id: 102, estado: 'contactado', total: 85.50, created_at: new Date(Date.now() - 86400000).toISOString(), usuario: { nombre: 'Cliente Mock 2', email: 'c2@test.com' } },
            ],
            page: 1,
            limit: 20,
            total: 2
        }), { status: 200 });
    }

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const url = new URL(request.url);
        // Forward all query params (estado, from, to, search, page, limit, sort, dir)
        const externalUrl = new URL(`${externalApiBase}/pedidos`);
        url.searchParams.forEach((value, key) => {
            externalUrl.searchParams.append(key, value);
        });

        const response = await fetch(externalUrl.toString(), {
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
        console.error("Error fetching orders:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
