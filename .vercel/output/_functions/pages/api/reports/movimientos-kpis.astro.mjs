export { renderers } from '../../../renderers.mjs';

const GET = async ({ cookies, url }) => {
  const externalApiBase = "http://localhost:3000/api";
  const token = cookies.get("token")?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  let targetUrl = `${externalApiBase}/reports/movimientos/kpis`;
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (params.toString()) targetUrl += `?${params.toString()}`;
  try {
    const response = await fetch(targetUrl, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching movimientos kpis:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
