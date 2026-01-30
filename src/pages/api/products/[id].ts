import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;

  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  if (!externalApiBase) {
    return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  // GET /api/products/:id requires auth per user request
  // "Header auth."
  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const targetUrl = `${externalApiBase}/products/${id}`;

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
    console.error(`Error proxying product detail`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;

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
    const targetUrl = `${externalApiBase}/products/${id}`;

    const response = await fetch(targetUrl, {
      method: "PUT",
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
    console.error(`Error proxying product update`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const { id } = params;

  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  if (!externalApiBase) {
    return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const targetUrl = `${externalApiBase}/products/${id}`;

    const response = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.status === 204) {
      return new Response(JSON.stringify({ message: 'Deleted successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error proxying product delete`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
