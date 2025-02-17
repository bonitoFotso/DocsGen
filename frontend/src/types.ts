import { Contact } from '@/itf';

export type SortField = keyof Contact | 'ville_nom' | 'client_nom';
export type SortOrder = 'asc' | 'desc';