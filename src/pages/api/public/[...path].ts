import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ params, request }) => {
    const { path } = params;
    const url = new URL(request.url);
    const searchParams = url.search;

    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;

    if (!externalApiBase) {
        return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
    }

    try {
        const targetUrl = `${externalApiBase}/public/${path}${searchParams}`;

        // Read body for POST/PUT if needed
        const body = request.method !== 'GET' ? await request.text() : undefined;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`Error proxying public request: ${path}`, error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
};
