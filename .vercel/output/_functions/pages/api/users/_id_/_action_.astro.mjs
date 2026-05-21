export { renderers } from '../../../../renderers.mjs';

const PATCH = async ({ params, request }) => {
  const { id, action } = params;
  const externalApiBase = "http://localhost:3000/api";
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  const allowedActions = ["roles", "status", "password"];
  if (!action || !allowedActions.includes(action)) {
    return new Response(JSON.stringify({ message: "Invalid action" }), { status: 400 });
  }
  try {
    const body = await request.json();
    const targetUrl = `${externalApiBase}/users/${id}/${action}`;
    const response = await fetch(targetUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error proxying user action ${action}`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
