import { useState, useEffect } from 'react';
import { useServices } from '@/AppHooks';
import { Contact } from '@/itf';
import KDTable from '@/components/table/KDTable3';

interface ContactTableProps {
  title?: string;
}

const ContactTable = ({ title = "Liste des contacts" }: ContactTableProps) => {
  const { contactService } = useServices();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await contactService.getAlls();
        setContacts(response);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [contactService]);

  // Définition des colonnes pour le tableau de contacts
  const columns = [
    { key: 'region' as keyof Contact, label: 'Région' },
    { key: 'ville_nom' as keyof Contact, label: 'Ville' },
    { key: 'secteur' as keyof Contact, label: 'Secteur' },
    { key: 'categorie' as keyof Contact, label: 'Catégorie' },
    { key: 'entreprise' as keyof Contact, label: 'Entreprise' },
    { key: 'nom' as keyof Contact, label: 'Nom' },
    { key: 'prenom' as keyof Contact, label: 'Prénom' },
    { key: 'service' as keyof Contact, label: 'Service' },
    { key: 'poste' as keyof Contact, label: 'Poste' },
    { key: 'email' as keyof Contact, label: 'Email' },
    { key: 'telephone' as keyof Contact, label: 'Téléphone' }
  ];

  // Options de groupement disponibles
  const groupingOptions = [
    { key: 'region' as keyof Contact, label: 'Grouper par Région' },
    { key: 'ville_nom' as keyof Contact, label: 'Grouper par Ville' },
    { key: 'secteur' as keyof Contact, label: 'Grouper par Secteur d\'activité' },
    { key: 'categorie' as keyof Contact, label: 'Grouper par Catégorie' },
    { key: 'entreprise' as keyof Contact, label: 'Grouper par Entreprise' }
  ];

  // Clés à utiliser pour la recherche
  const searchKeys: Array<keyof Contact> = ['nom', 'prenom', 'email', 'poste', 'region', 'ville_nom', 'entreprise'];

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  return (
    <KDTable
      data={contacts}
      columns={columns}
      title={title}
      keyExtractor={(contact) => contact.id}
      searchKeys={searchKeys}
      groupingOptions={groupingOptions}
      defaultGroupBy="none"
      defaultSort={{ key: 'nom' as keyof Contact, direction: 'asc' }}
      searchPlaceholder="Rechercher un contact..."
      noGroupingLabel="Aucun groupement"
      noResultsMessage="Aucun contact trouvé"
    />
  );
};

export default ContactTable;