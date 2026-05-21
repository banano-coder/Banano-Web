export { renderers } from '../../../../renderers.mjs';

const PATCH = async ({ params, request, cookies }) => {
  const externalApiBase = "http://localhost:3000/api";
  const token = cookies.get("token")?.value;
  const { id } = params;
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const body = await request.json();
    const response = await fetch(`${externalApiBase}/pedidos/${id}/estado`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error updating order ${id} status:`, error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
