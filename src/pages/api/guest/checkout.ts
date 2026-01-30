import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    const token = cookies.get('token')?.value;

    if (!externalApiBase) {
        return new Response(JSON.stringify({
            error: 'Server misconfiguration',
            message: 'PUBLIC_EXTERNAL_API_BASE is not defined'
        }), { status: 500 });
    }

    try {
        const body = await request.json();
        console.log("Proxy: Reenviando al backend:", body);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        // Forward token if present (though this is a "guest" checkout, 
        // sometimes a logged-in user might want to use it or it's allowed)
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${externalApiBase}/guest/checkout`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error in /api/guest/checkout proxy:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
