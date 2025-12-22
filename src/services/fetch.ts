// Definimos una clase de error personalizada para manejar mejor los fallos HTTP
export class HttpError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'HttpError';
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ResponseType = 'json' | 'blob' | 'text';

// Helper para cookies (sin cambios, solo tipado estricto)
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null; // Seguridad para SSR
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

interface FetchOptions extends Omit<RequestInit, 'body' | 'method'> {
  body?: BodyInit | null | object; // 'object' permite pasar POJOs para JSON
  responseType?: ResponseType;
  // Permitimos pasar token manualmente si no queremos usar la cookie
  token?: string; 
}

export async function FetchData<T>(
  url: string,
  method: HttpMethod = 'GET',
  options: FetchOptions = {}
): Promise<T> {
  const { body, responseType = 'json', token: customToken, headers: customHeaders, ...restOptions } = options;

  try {
    // 1. Headers Base: Fusionamos los que vienen por parámetro
    const headers: Record<string, string> = {
        ...((customHeaders as Record<string, string>) || {}),
    };

    // 2. Auth: Prioridad al token manual, si no, busca en cookies
    const token = customToken || getCookie('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
        cache: 'no-store',
        ...restOptions, // Pasa signal, cache, mode, etc.
    };

    // 3. Manejo inteligente del Body
    if (body) {
        if (body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
            // El navegador gestiona el Content-Type para estos tipos
            config.body = body;
        } else if (typeof body === 'string') {
             // Si es string, asumimos que el usuario gestiona el content-type o es raw
             config.body = body;
        } else {
            // Asumimos JSON para objetos planos
            headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(body);
        }
    }

    const response = await fetch(url, config);

    // 4. Manejo de Errores (Sin redirección forzada)
    if (!response.ok) {
      // Intentamos parsear el error, si falla usamos el texto de estado
      let errorData;
      const contentType = response.headers.get('content-type');
      
      try {
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            errorData = await response.text();
          }
      } catch {
          errorData = null;
      }

      const errorMessage = (typeof errorData === 'object' && errorData?.message) 
        ? errorData.message 
        : `Error ${response.status}: ${response.statusText}`;

      // Lanzamos el error con el código de estado para manejarlo fuera (ej: en el componente o un contexto)
      throw new HttpError(response.status, errorMessage, errorData);
    }

    // 5. Manejo de Respuesta Exitosa
    if (response.status === 204) {
      return null as T;
    }

    if (responseType === 'blob') return (await response.blob()) as T;
    if (responseType === 'text') return (await response.text()) as T;

    return (await response.json()) as T;

  } catch (error) {
    // Aquí puedes loguear a un servicio externo (Sentry, etc)
    console.error(`[FetchData Error] ${method} ${url}`, error);
    throw error;
  }
}
