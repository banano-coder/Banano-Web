import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, cookies }) => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    const token = cookies.get('token')?.value;

    if (!externalApiBase) {
        // Mock Mode
        console.warn("PUBLIC_EXTERNAL_API_BASE not defined. Returning Mock Data.");
        return new Response(JSON.stringify({
            data: [
                { id: 101, title: 'Banano Importado - Caja', sku: 'BAN-IMP-BOX', stock: 5, min_stock: 10, variant: 'Caja 18kg' },
                { id: 102, title: 'Banano Criollo', sku: 'BAN-CRIO', stock: 2, min_stock: 50, variant: 'Unidad' },
                { id: 105, title: 'Plátano Verde', sku: 'PLA-VER', stock: 8, min_stock: 20, variant: 'Racimo' },
            ]
        }), { status: 200 });
    }

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const threshold = url.searchParams.get('threshold') || '10';

        // Forward request to external backend
        const response = await fetch(`${externalApiBase}/reports/alertas/stock-bajo?threshold=${threshold}`, {
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
        console.error("Error fetching low stock report:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
