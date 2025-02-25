import { useState, useMemo } from 'react';
import { ClientBase } from '@/interfaces';

export const useClientSearch = (clients: ClientBase[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => 
    clients.filter(client => 
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.telephone && client.telephone.includes(searchTerm))
    ),
    [clients, searchTerm]
  );

  return { searchTerm, setSearchTerm, filteredClients };
};