import type { APIRoute } from 'astro';

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    const token = cookies.get('token')?.value;
    const { id } = params;

    if (!externalApiBase) {
        return new Response(JSON.stringify({ message: 'Estado actualizado (MOCK)', estado: 'contactado' }), { status: 200 });
    }

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await fetch(`${externalApiBase}/pedidos/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error(`Error updating order ${id} status:`, error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
