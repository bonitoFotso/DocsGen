// Fonction d'intercepteur de requêtes (ajout du token si disponible)
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

// import { removeAuth } from '../app/modules/auth';

// Récupérer l'URL de l'API depuis le fichier .env
export const API_URL = import.meta.env.VITE_APP_API_URL ;


// Instance principale d'Axios pour les requêtes avec authentification (JSON)
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json', // Par défaut on envoie du JSON
  },
});

// Instance d'Axios pour les requêtes multipart (utile pour l'upload de fichiers)
const apiClientFile: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data', // Pour les requêtes avec fichiers
  },
});

// 
const addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const auth = localStorage.getItem('accessToken'); // Récupérer les informations d'authentification
  if (auth && auth) {
    config.headers!.Authorization = `Bearer ${auth}`;
  }
  return config;
};

// Fonction pour gérer les erreurs d'authentification
const handleAuthError = (error: import('axios').AxiosError) => {
  if (error.response && error.response.status === 401) {
    // removeAuth(); // Supprimer les informations d'authentification
    window.location.href = '/login'; // Rediriger vers la page de connexion
  }
  return Promise.reject(error);
};

// Ajout des intercepteurs sur l'instance principale (apiClient)
apiClient.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));



apiClient.interceptors.response.use(
  (response: AxiosResponse) => response, // Si la requête réussit, retourner la réponse
  handleAuthError // Si une erreur 401 survient, gérer l'authentification
);

// Ajout des intercepteurs sur l'instance pour les fichiers (apiClientFile)
apiClientFile.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

apiClientFile.interceptors.response.use(
  (response: AxiosResponse) => response, // Retourner la réponse si tout va bien
  handleAuthError // Gérer les erreurs d'authentification
);

// Service sans authentification pour les requêtes publiques
const apiPublic: AxiosInstance = axios.create({
  baseURL: API_URL, // URL de base
  headers: {
    'Content-Type': 'application/json', // Par défaut, du JSON
  },
});

export { apiClient, apiPublic, apiClientFile };
