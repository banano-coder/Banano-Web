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
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // SIMULATE A SUCCESSFUL LOGIN using test credentials
    if (email === 'test@example.com' && password === 'password') {
      const successfulResponse = {
        message: "Login exitoso (mocked response)",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwIiwiZW1haWwiOiJ2aWN0b3JkQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTc2NjA2NDYzMSwiZXhwIjoxNzY2MDcxODMxfQ.xLDjUyiRmbcFwiqM8Z9sD8DkkeZn6eRsqkqOGL8ihAk",
        user: {
          id_usuario: "10",
          nombre: "Mock User",
          email: "test@example.com",
          roles: ["admin"],
        },
      };

      return new Response(JSON.stringify(successfulResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // SIMULATE INVALID CREDENTIALS
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    // This catch block will now only handle truly unexpected errors
    console.error('Error in mock /api/auth/login:', error);
    return new Response(JSON.stringify({ message: 'An internal server error occurred while processing the request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
