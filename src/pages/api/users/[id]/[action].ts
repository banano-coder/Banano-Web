import type { APIRoute } from 'astro';

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id, action } = params; // action can be 'roles', 'status', 'password'
  
  const externalApiBase = import.meta.env.PUBLIC_EXTERNAL_API_BASE;
  if (!externalApiBase) {
     return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500 });
  }

  const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  
  if (!token) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  // Validate allowed actions
  const allowedActions = ['roles', 'status', 'password'];
  if (!action || !allowedActions.includes(action)) {
      return new Response(JSON.stringify({ message: 'Invalid action' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const targetUrl = `${externalApiBase}/users/${id}/${action}`;
    
    // Check if the action is 'password' but body has 'password' key, API might expect 'active' typo?
    // User plan said "Also valida no desactivar" for password, likely copy paste error in description.
    // I will send the body as is.
    
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
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error proxying user action ${action}`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
