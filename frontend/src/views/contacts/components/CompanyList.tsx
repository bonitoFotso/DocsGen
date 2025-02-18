import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, Phone, Mail, Users } from 'lucide-react';
import { useServices } from '@/AppHooks';
import { ClientBase } from '@/interfaces';

// Types definitions
interface Contact {
  id: number;
  nom: string;
  prenom: string | null;
  email: string;
  telephone: string | null;
  poste: string | null;
  service: string | null;
  role_achat: string | null;
}



const CompanyList = () => {
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);
  const [data, setData] = useState<ClientBase[]>([]);
    const { clientService } = useServices();
  
  
  // Load and parse the data when component mounts
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await clientService.getAllcc();
        setData(response);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [clientService]);

  const toggleCompany = (companyId: number) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Liste des Entreprises</h1>
      <div className="space-y-4">
        {data.map((company) => (
          <div key={company.id} className="border rounded-lg shadow-sm bg-white">
            <div 
              className="p-4 cursor-pointer flex items-center justify-between"
              onClick={() => toggleCompany(company.id)}
            >
              <div className="flex items-center space-x-4">
                <Building2 className="text-blue-600" size={24} />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{company.nom}</h2>
                  <p className="text-sm text-gray-600">{company.secteur_activite}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {company.contacts.length} contact{company.contacts.length > 1 ? 's' : ''}
                </span>
                {expandedCompany === company.id ? (
                  <ChevronUp className="text-gray-500" size={20} />
                ) : (
                  <ChevronDown className="text-gray-500" size={20} />
                )}
              </div>
            </div>
            
            {expandedCompany === company.id && (
              <div className="border-t px-4 py-3 bg-gray-50">
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="text-gray-500" size={16} />
                    <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                      {company.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="text-gray-500" size={16} />
                    <span className="text-gray-700">{company.telephone}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <Users className="mr-2" size={18} />
                    Contacts
                  </h3>
                  <div className="grid gap-4">
                    {company.contacts.map((contact) => (
                      <div key={contact.id} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-800">
                          {contact.nom} {contact.prenom}
                        </div>
                        {contact.poste && (
                          <div className="text-sm text-gray-600 mt-1">
                            {contact.poste} - {contact.service}
                          </div>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-sm text-blue-600 hover:underline mt-1 block"
                          >
                            {contact.email}
                          </a>
                        )}
                        {contact.telephone && (
                          <div className="text-sm text-gray-600 mt-1">
                            {contact.telephone}
                          </div>
                        )}
                        {contact.role_achat && (
                          <div className="text-sm text-gray-500 mt-1">
                            Role: {contact.role_achat}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyList;