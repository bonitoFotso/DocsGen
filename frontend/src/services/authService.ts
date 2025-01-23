import { apiClient } from './api';

export interface AuthResponse {
    access: string;
    refresh: string;
}

// Service pour obtenir le token JWT
export const logins = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/token/', {
        email,
        password,
    });
    // Stocker les tokens dans le stockage local
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    return response.data;
};

// Service pour rafraîchir le token JWT
export const refreshToken = async (refreshTokens: string): Promise<string> => {
    const response = await apiClient.post<{ access: string }>('/auth/token/refresh/', {
        refresh: refreshTokens,
    });
    // Mettre à jour l'access token dans le stockage local
    localStorage.setItem('accessToken', response.data.access);
    return response.data.access;
};

// Service pour déconnecter l'utilisateur
export const logouts = (): void => {
    // Supprimer les tokens du stockage local
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// Récupérer le token d'accès actuel
export const getAccessToken = (): string | null => localStorage.getItem('accessToken');

// Récupérer le token de rafraîchissement actuel
export const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');

// Service pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
    const token = getAccessToken();
    return !!token; // Retourne true si un access token est présent
};
