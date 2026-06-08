import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ request }) => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    if (!externalApiBase) {
        return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
    }

    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    try {
        const targetUrl = `${externalApiBase}/cashea/liquidar`;
        const body = request.method !== 'GET' ? await request.text() : undefined;

        const response = await fetch(targetUrl, {
            method: request.method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: response.status, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error(`Error proxying Cashea liquidar request:`, error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
};
