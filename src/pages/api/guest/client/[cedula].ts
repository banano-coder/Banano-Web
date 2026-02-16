import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, cookies }) => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    const { cedula } = params;

    if (!externalApiBase) {
        return new Response(JSON.stringify({
            error: 'Server misconfiguration',
            message: 'PUBLIC_EXTERNAL_API_BASE is not defined'
        }), { status: 500 });
    }

    try {
        const response = await fetch(`${externalApiBase}/guest/client/${cedula}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error in /api/guest/client proxy:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
