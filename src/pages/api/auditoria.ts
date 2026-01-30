import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const searchParams = url.search;

    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;

    // MOCK MODE: If no external API is defined, return mock data
    if (!externalApiBase) {
        console.warn("PUBLIC_EXTERNAL_API_BASE not defined. Returning MOCK audit logs.");
        return new Response(JSON.stringify({
            data: [
                { id: 1, action: 'LOGIN', actor_name: 'Admin User', target_type: 'user', created_at: new Date().toISOString(), details: 'User logged in' },
                { id: 2, action: 'UPDATE_PRODUCT', actor_name: 'Manager', target_type: 'product', created_at: new Date(Date.now() - 86400000).toISOString(), details: 'Price updated for Banano Premium' }
            ],
            page: 1,
            limit: 20,
            total: 2
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Extract token from cookie (Astro SSR)
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    try {
        const targetUrl = `${externalApiBase}/auditoria${searchParams}`;

        const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`Error proxying audit request`, error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
};
