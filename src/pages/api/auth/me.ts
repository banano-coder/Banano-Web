import type { APIRoute } from 'astro';

// IMPORTANT: This endpoint is using MOCK DATA to simulate token validation
// because the cloud development environment may have network restrictions.

const MOCK_VALID_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwIiwiZW1haWwiOiJ2aWN0b3JkQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTc2NjA2NDYzMSwiZXhwIjoxNzY2MDcxODMxfQ.xLDjUyiRmbcFwiqM8Z9sD8DkkeZn6eRsqkqOGL8ihAk";

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ message: 'Authorization header is missing or malformed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.split(' ')[1];

  // SIMULATE A SUCCESSFUL VALIDATION
  if (token === MOCK_VALID_TOKEN) {
    const user = {
      id_usuario: "10",
      nombre: "Mock User (from /me)",
      email: "test@example.com",
      roles: ["admin"],
    };
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // SIMULATE AN INVALID TOKEN
    return new Response(JSON.stringify({ message: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
