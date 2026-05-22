export { renderers } from '../../../../renderers.mjs';

const GET = async ({ params }) => {
  const externalApiBase = "http://localhost:3000/api";
  const { cedula } = params;
  try {
    const response = await fetch(`${externalApiBase}/guest/cliente/${cedula}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in /api/guest/client proxy:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
