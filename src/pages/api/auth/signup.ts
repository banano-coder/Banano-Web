import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({ message: 'Unsupported Media Type. Expected application/json.' }), {
      status: 415,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    let { email, password, nombre } = body;

    // Basic validation
    if (!email || !password || !nombre) {
      return new Response(JSON.stringify({ message: 'Nombre, email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Normalize email
    email = email.toLowerCase();

    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
    
    if (!externalApiBase) {
       console.error("PUBLIC_EXTERNAL_API_BASE is not defined in environment variables.");
       return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
    }

    // Proxy request to external API
    const response = await fetch(`${externalApiBase}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, nombre }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in /api/auth/signup:', error);
    return new Response(JSON.stringify({ message: 'An internal server error occurred while processing the request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
