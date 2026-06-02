import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, params }) => {
    const id = params.id;
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    if (!externalApiBase) {
        return new Response(JSON.stringify({ message: 'External API base not configured' }), { status: 500 });
    }

    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const targetUrl = `${externalApiBase}/solicitudes-autorizacion/${id}/responder`;
        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(`Error proxying POST responder solicitudes-autorizacion`, error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
};
