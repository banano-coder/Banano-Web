import type { APIRoute } from 'astro';

const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;

export const GET: APIRoute = async ({ request }) => {
    if (!externalApiBase) return new Response(JSON.stringify({ message: 'API Base not defined' }), { status: 500 });

    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

    try {
        const response = await fetch(`${externalApiBase}/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Error' }), { status: 500 });
    }
};

export const PATCH: APIRoute = async ({ request }) => {
    if (!externalApiBase) return new Response(JSON.stringify({ message: 'API Base not defined' }), { status: 500 });

    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

    try {
        const body = await request.json();
        const response = await fetch(`${externalApiBase}/profile`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Error' }), { status: 500 });
    }
};
