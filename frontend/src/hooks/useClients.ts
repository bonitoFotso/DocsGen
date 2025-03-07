import { useState, useCallback } from 'react';
import { ClientBase, ClientEdit } from '@/interfaces';
import { useServices } from '@/AppHooks';
import { ClientDetails } from '@/types/client';

export const useClients = () => {
  const { clientService } = useServices();
  const [clients, setClients] = useState<ClientBase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      console.log(err);
      setError('Erreur lors du chargement des clients');
    } finally {
      setIsLoading(false);
    }
  }, [clientService]);

  const createClient = async (clientData: ClientEdit) => {
    setIsLoading(true);
    try {
      const resp = await clientService.create(clientData);
      await loadClients();
      return resp;
    } catch (err) {
      console.log(err);

      setError('Erreur lors de la création du client');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateClient = async (id: number, clientData: ClientEdit) => {
    setIsLoading(true);
    try {
      await clientService.update(id, clientData);
      await loadClients();
      return true;
    } catch (err) {
      console.log(err);

      setError('Erreur lors de la mise à jour du client');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClient = async (id: number) => {
    setIsLoading(true);
    try {
      await clientService.delete(id);
      await loadClients();
      return true;
    } catch (err) {
      console.log(err);

      setError('Erreur lors de la suppression du client');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getClientById = async (id: number): Promise<ClientDetails | null> => {
    setIsLoading(true);
    try {
      return await clientService.getById(id);
    } catch (err) {
      console.log(err);

      setError('Erreur lors du chargement du client');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    isLoading,
    error,
    setError,
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    getClientById
  };
};