import { LoginCredentials, LoginResponse, User } from '@/affaireType';
import { apiClient } from './api';

export interface AuthResponse {
    access: string;
    refresh: string;
}

// Service pour obtenir le token JWT
export const logins = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', {
        email	: credentials.email	,
        password: credentials.password
    });
    // Stocker les tokens dans le stockage local
    localStorage.setItem('accessToken', response.data.token);
    return {
        success: response.data.success,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message
    };
};

// service pour stocker l'user dans le stockage local
export const storeUser = (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
};

// Service pour obtenir l'utilisateur actuel
export const getUser = (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
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
    localStorage.removeItem('user');
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
