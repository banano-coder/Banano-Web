export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({ message: "Unsupported Media Type. Expected application/json." }), {
      status: 415,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const externalApiBase = "http://localhost:3000/api";
    if (!externalApiBase) ;
    const response = await fetch(`${externalApiBase}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    const setCookie = response.headers.get("Set-Cookie");
    const headers = { "Content-Type": "application/json" };
    if (setCookie) {
      headers["Set-Cookie"] = setCookie;
    }
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers
    });
  } catch (error) {
    console.error("Error in /api/auth/login:", error);
    return new Response(JSON.stringify({ message: "An internal server error occurred while processing the request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
