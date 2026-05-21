export { renderers } from '../../../renderers.mjs';

const GET = async ({ params, request }) => {
  const { id } = params;
  const externalApiBase = "http://localhost:3000/api";
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  try {
    const targetUrl = `${externalApiBase}/products/${id}`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error proxying product detail`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};
const PUT = async ({ params, request }) => {
  const { id } = params;
  const externalApiBase = "http://localhost:3000/api";
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  try {
    const body = await request.json();
    const targetUrl = `${externalApiBase}/products/${id}`;
    const response = await fetch(targetUrl, {
      method: "PUT",
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
    console.error(`Error proxying product update`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};
const DELETE = async ({ params, request }) => {
  const { id } = params;
  const externalApiBase = "http://localhost:3000/api";
  const token = request.headers.get("cookie")?.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  try {
    const targetUrl = `${externalApiBase}/products/${id}`;
    const response = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (response.status === 204) {
      return new Response(JSON.stringify({ message: "Deleted successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error proxying product delete`, error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
