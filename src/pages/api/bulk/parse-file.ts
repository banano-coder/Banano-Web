import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  if (!externalApiBase) {
    return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  
  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const targetUrl = `${externalApiBase}/bulk/parse-file`;
    const contentType = request.headers.get('content-type');
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    };
    
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: request.body,
      // @ts-ignore
      duplex: 'half'
    });

    const data = await response.text();
    console.log("PARSE FILE RESPONSE DATA START ====================");
    console.log(data);
    console.log("PARSE FILE RESPONSE DATA END ====================");

    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error proxying bulk parse-file`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
