export { renderers } from '../../../renderers.mjs';

const MOCK_VALID_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwIiwiZW1haWwiOiJ2aWN0b3JkQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTc2NjA2NDYzMSwiZXhwIjoxNzY2MDcxODMxfQ.xLDjUyiRmbcFwiqM8Z9sD8DkkeZn6eRsqkqOGL8ihAk";
const GET = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ message: "Authorization header is missing or malformed" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const token = authHeader.split(" ")[1];
  if (token === MOCK_VALID_TOKEN) {
    const user = {
      id_usuario: "10",
      nombre: "Mock User (from /me)",
      email: "test@example.com",
      roles: ["admin"]
    };
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } else {
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
