import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  const { path } = params;
  const url = new URL(request.url);
  const searchParams = url.search; // Includes ?query=...

  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  
  if (!externalApiBase) {
     return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  try {
    const targetUrl = `${externalApiBase}/catalog/${path}${searchParams}`;
    
    // Forward the request to the external API
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error proxying catalog request: ${path}`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
