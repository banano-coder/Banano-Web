import type { APIRoute } from 'astro';

// IMPORTANT: This endpoint is using MOCK DATA.

export const POST: APIRoute = async ({ request }) => {
  // Defensive check for the Content-Type header
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({ message: 'Unsupported Media Type. Expected application/json.' }), {
      status: 415,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;

    // MOCK MODE: If no external API is defined, return mock success
    if (!externalApiBase) {
      console.warn("PUBLIC_EXTERNAL_API_BASE not defined. Returning MOCK response.");
      return new Response(JSON.stringify({
        message: 'Login exitoso (MOCK MODE)',
        token: 'mock-jwt-token-xyz-123',
        user: {
          id: 'mock-user-id-123',
          email: email,
          nombre: 'Usuario Mock',
          role: 'customer'
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Set a cookie for the mock token
          'Set-Cookie': 'token=mock-jwt-token-xyz-123; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400'
        },
      });
    }

    // Proxy request to external API
    const response = await fetch(`${externalApiBase}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Check for Set-Cookie header from backend and forward it if present
    const setCookie = response.headers.get('Set-Cookie');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (setCookie) {
      headers['Set-Cookie'] = setCookie;
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: headers,
    });

  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    return new Response(JSON.stringify({ message: 'An internal server error occurred while processing the request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
