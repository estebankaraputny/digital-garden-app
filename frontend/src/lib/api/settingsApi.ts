// src/lib/api/settingsApi.ts

const API_BASE_URL = import.meta.env.PUBLIC_API_URL; // Asume que la URL base de tu API está en las variables de entorno
// --- Perfil de Usuario ---

export const updateProfile = (data: { name?: string; profilePictureUrl?: string }) => {
  return apiFetch('/user/profile-edit', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const uploadProfilePicture = (formData: FormData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      throw new Error('Usuario no autenticado.');
    }
  
    return fetch(`${API_BASE_URL}/user/profile-picture`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // No 'Content-Type', el navegador lo establece por nosotros con el boundary correcto para FormData
        },
        body: formData,
    });
};


// --- Cuenta ---

export const changeEmail = (newEmail: string) => {
  return apiFetch('/user/edit-email', {
    method: 'POST',
    body: JSON.stringify({ newEmail }),
  });
};

export const changePassword = (data: { currentPassword?: string; newPassword?: string }) => {
  return apiFetch('/user/edit-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const requestPasswordRecovery = (email: string) => {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};


// --- Suscripción ---

export const getSubscriptionStatus = () => {
  return apiFetch('/subscription/status'), {
    method: 'GET',
    
  };
};

export const cancelSubscription = () => {
  return apiFetch('/subscription/cancel', {
    method: 'POST',
  });
};

// --- Zona de Peligro ---

export const deleteAccount = (password: string) => {
  return apiFetch('/user/delete-account', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
};
