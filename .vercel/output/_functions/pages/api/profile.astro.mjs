export { renderers } from '../../renderers.mjs';

const externalApiBase = "http://localhost:3000/api";
const GET = async ({ request }) => {
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  try {
    const response = await fetch(`${externalApiBase}/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error" }), { status: 500 });
  }
};
const PATCH = async ({ request }) => {
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  try {
    const body = await request.json();
    const response = await fetch(`${externalApiBase}/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
