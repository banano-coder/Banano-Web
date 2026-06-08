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
        const url = new URL(request.url);
        const searchParams = url.search;
        const targetUrl = `${externalApiBase}/cashea/transactions${searchParams}`;

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: response.status, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error(`Error proxying Cashea transactions request:`, error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
};
