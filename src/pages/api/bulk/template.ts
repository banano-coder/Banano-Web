import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  if (!externalApiBase) {
    return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  
  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const targetUrl = `${externalApiBase}/bulk/template`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return new Response(await response.text(), { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=plantilla_productos.xlsx'
      }
    });

  } catch (error) {
    console.error(`Error proxying bulk template`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
