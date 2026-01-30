import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = url.search;

  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;

  // MOCK MODE: Return mock users if env var is missing
  if (!externalApiBase) {
    console.warn("PUBLIC_EXTERNAL_API_BASE not defined. Returning MOCK users.");
    return new Response(JSON.stringify([
      { id: '1', nombre: 'Usuario Mock 1', email: 'mock1@example.com', role: 'customer' },
      { id: '2', nombre: 'Usuario Mock 2', email: 'mock2@example.com', role: 'admin' }
    ]), {
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
    const targetUrl = `${externalApiBase}/users${searchParams}`;

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
    console.error(`Error proxying users list`, error);
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
    const targetUrl = `${externalApiBase}/users`;

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
    console.error(`Error proxying user creation`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
