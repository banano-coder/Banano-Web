import type { APIRoute } from 'astro';

const handler: APIRoute = async ({ request, params }) => {
  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  if (!externalApiBase) {
    return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id, imgId } = params;
    console.log(`[Proxy] Image Request: Method=${request.method}, Product=${id}, Image=${imgId}`);
    
    // Construct URL based on method
    let targetUrl = '';
    
    if (request.method === 'PATCH') {
        // PATCH /api/products/:id/images/:imgId/principal
        // Usage: Fetch(".../principal", METHOD)
        // Check if the URL ends with 'principal' (frontend conventions). 
        // Actually, the frontend will likely call `/api/products/:id/images/:imgId/principal` as a distinct route URL.
        // BUT here we are catching `[imgId]`.
        // If I want to support `/principal`, I should probably check the request URL or have a separate proxy file...
        // Wait, Astro file routing: `products/[id]/images/[imgId].ts`.
        // If I call `/api/products/1/images/2`, this file handles it.
        // If I call `/api/products/1/images/2/principal`, this file DOES NOT handle it unless I use `[...path]`.
        // The backend expects `PATCH /products/:id/images/:imgId/principal`.
        // So I need a proxy for THAT too. 
        // OR I can make the frontend call `/api/products/1/images/2?action=principal` and handle it here.
        // I will follow the backend structure for simplicity if possible, but creating a new file for `principal` is tedious.
        // I will use query param `?principal=true` or just handle it here if the method is PATCH, since the backend ONLY has PATCH for principal on this path?
        // Backend: `PATCH /api/products/:id/images/:imgId/principal`. It DOES NOT have `PATCH /api/products/:id/images/:imgId`.
        // So `PATCH` on this resource basically doesn't exist on backend.
        // I should stick to the map.
        
        // I'll assume the frontend calls `/api/products/1/images/2?principal=true`.
        // And I rewrite the URL to the backend.
        const url = new URL(request.url);
        if (url.searchParams.has('principal')) {
             targetUrl = `${externalApiBase}/products/${id}/images/${imgId}/principal`;
        } else {
             // Fallback or error?
             return new Response(JSON.stringify({ message: 'Bad Request: Missing action' }), { status: 400 });
        }
    } else {
        // DELETE
        targetUrl = `${externalApiBase}/products/${id}/images/${imgId}`;
    }
    console.log(`[Proxy] Forwarding to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error proxying image details request`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};

export const PATCH = handler;
export const DELETE = handler;
