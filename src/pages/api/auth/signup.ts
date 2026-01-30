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

    // MOCK MODE: If no external API is defined, return mock success
    if (!externalApiBase) {
      console.warn("PUBLIC_EXTERNAL_API_BASE not defined. Returning MOCK response.");
      return new Response(JSON.stringify({
        message: 'Usuario registrado exitosamente (MOCK MODE)',
        user: {
          id: 'mock-user-id-' + Date.now(),
          email,
          nombre,
          role: 'customer'
        },
        token: 'mock-jwt-token-xyz-123'
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Proxy request to external API
    const response = await fetch(`${externalApiBase}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, nombre }),
    });

    // Check if the response from the external API has content
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Failed to parse JSON from external API:", text);
      return new Response(JSON.stringify({ message: "Invalid response from external API" }), { status: 502 });
    }

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
