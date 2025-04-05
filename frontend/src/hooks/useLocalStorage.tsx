import { useState, useEffect } from 'react';

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * Hook personnalisé pour gérer le stockage local.
 * 
 * @param key - La clé sous laquelle stocker la valeur dans localStorage
 * @param initialValue - La valeur initiale à utiliser si aucune valeur n'existe dans localStorage
 * @returns Un tuple contenant la valeur actuelle et une fonction pour la mettre à jour
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Fonction d'état qui récupère la valeur depuis localStorage ou utilise initialValue
  const readValue = (): T => {
    // Vérification si window est disponible (pour éviter les erreurs SSR)
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Récupérer depuis localStorage
      const item = window.localStorage.getItem(key);
      // Analyser le JSON stocké ou retourner initialValue
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Erreur de lecture de localStorage pour la clé "${key}":`, error);
      return initialValue;
    }
  };

  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Mise à jour de localStorage lorsque la valeur change
  const setValue: SetValue<T> = (value) => {
    // Vérification si window est disponible
    if (typeof window === 'undefined') {
      console.warn(`Impossible de sauvegarder dans localStorage car window n'est pas disponible.`);
      return;
    }

    try {
      // Permettre à la valeur d'être une fonction
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      // Sauvegarder dans localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Déclencher un événement personnalisé pour la synchronisation entre onglets/fenêtres
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      console.warn(`Erreur d'écriture dans localStorage pour la clé "${key}":`, error);
    }
  };

  // Synchroniser l'état avec localStorage
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Synchroniser avec les changements provenant d'autres onglets/fenêtres
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    // Synchroniser avec les changements locaux
    const handleLocalChange = () => {
      setStoredValue(readValue());
    };

    // Configurer les écouteurs d'événements
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleLocalChange);

    // Nettoyage
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleLocalChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export { useLocalStorage };