import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = url.search;
  
  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  if (!externalApiBase) {
     return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  // GET /api/products is public (no auth required per user request)
  // "Sin auth ni params; lista todos los productos ordenados por fecha_creacion desc."

  try {
    const targetUrl = `${externalApiBase}/products${searchParams}`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error proxying products list`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  if (!externalApiBase) {
     return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  
  if (!token) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const targetUrl = `${externalApiBase}/products`;
    
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error proxying product creation`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
