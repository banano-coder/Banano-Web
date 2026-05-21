export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  const externalApiBase = "http://localhost:3000/api";
  const token = cookies.get("token")?.value;
  try {
    const body = await request.json();
    console.log("Proxy: Reenviando al backend:", body);
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${externalApiBase}/guest/checkout`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in /api/guest/checkout proxy:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
