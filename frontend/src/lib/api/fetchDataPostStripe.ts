const API_URL = import.meta.env.PUBLIC_API_URL;

interface SubscriptionResponse {
  clientSecret: string;
  subscriptionId?: string;
}

const createSubscriptionIntent = async (priceId: string, token: string): Promise<SubscriptionResponse> => {
  if (!priceId || !token) {
    throw new Error("Faltan datos requeridos (Price ID o Token)");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

  try {
    const response = await fetch(`${API_URL}/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ priceId }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'El servidor respondió con un error no válido.' }));
      throw new Error(errorData.message || 'Error al conectar con el servidor');
    }

    return await response.json();

  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Inténtalo de nuevo más tarde.');
    }
    console.error("Error en createSubscriptionIntent:", error);
    throw error; 
  }
};


export default createSubscriptionIntent;