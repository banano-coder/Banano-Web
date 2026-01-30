import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE; // e.g., http://localhost:3000/api

    if (!externalApiBase) {
        return new Response('API Base not configured', { status: 500 });
    }

    // Extract base URL (remove /api if present) to get to the root of the backend
    const baseUrl = externalApiBase.replace(/\/api$/, '');
    const { path } = params;

    if (!path) {
        return new Response('Not Found', { status: 404 });
    }

    // Target URL will be something like http://localhost:3000/uploads/products/image.jpg
    const targetUrl = `${baseUrl}/uploads/${path}`;

    try {
        const response = await fetch(targetUrl);

        if (!response.ok) {
            // Return a simpler 404 if the backend doesn't have the file
            return new Response('File Not Found on Backend', { status: response.status });
        }

        // Proxy the blob with its original content type
        const blob = await response.blob();
        return new Response(blob, {
            status: 200,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
                'Cache-Control': 'public, max-age=31536000',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error(`Error manual-proxying upload: ${path}`, error);
        return new Response('Internal Server Error Proxying File', { status: 500 });
    }
};
