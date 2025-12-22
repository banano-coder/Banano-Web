import type { APIRoute } from 'astro';

const handler: APIRoute = async ({ request, params }) => {
  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  if (!externalApiBase) {
    return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  // Note: GET images might be public, but check roles on backend. Frontend shouldn't block public GET if backend allows it.
  // The provided backend route says: "GET: Sin auth aplicada". "POST: Roles admin, manager".
  // So for POST we need token. For GET we might not need it, but sending it doesn't hurt.
  
  if (request.method !== 'GET' && !token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id } = params;
    const targetUrl = `${externalApiBase}/products/${id}/images`;

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let body: BodyInit | null | undefined;

    if (request.method === 'POST') {
        // For file uploads, we want to forward the raw body stream and the Content-Type header (which includes the boundary)
        const contentType = request.headers.get('content-type');
        if (contentType) {
            headers['Content-Type'] = contentType;
        }
        // Clone the request to get the body stream since we can't read it twice if we were parsing
        body = request.body; 
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      // @ts-ignore - dupex: 'half' is a node-fetch specific option, might not be needed for native fetch but useful for debugging streams
      duplex: 'half' 
    });

    // Determine response types. Images GET returns JSON { data: [...] }. POST returns JSON.
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error proxying images request`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};

export const GET = handler;
export const POST = handler;
