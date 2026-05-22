export { renderers } from '../../renderers.mjs';

const GET = async ({ request, cookies }) => {
  const externalApiBase = "http://localhost:3000/api";
  const token = cookies.get("token")?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const externalUrl = new URL(`${externalApiBase}/pedidos`);
    url.searchParams.forEach((value, key) => {
      externalUrl.searchParams.append(key, value);
    });
    const response = await fetch(externalUrl.toString(), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
