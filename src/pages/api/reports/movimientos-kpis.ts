import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, url }) => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    const token = cookies.get('token')?.value;

    if (!externalApiBase) {
        return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500 });
    }

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let targetUrl = `${externalApiBase}/reports/movimientos/kpis`;
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (params.toString()) targetUrl += `?${params.toString()}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error fetching movimientos kpis:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
