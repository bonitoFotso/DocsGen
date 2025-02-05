import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mail, Phone, Building, MapPin, Edit } from 'lucide-react';
import { Contact } from '@/itf';

export default function ContactDetails() {
  const { id } = useParams();
  const [contact, setContact] = React.useState<Contact | null>(null);

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Détails du contact</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to={`/contacts/${id}/edit`}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Link>
        </div>
      </div>

      {contact ? (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {contact.nom} {contact.prenom}
            </h3>
            {contact.poste && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">{contact.poste}</p>
            )}
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {contact.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:text-indigo-900">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.telephone && (
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href={`tel:${contact.telephone}`} className="text-indigo-600 hover:text-indigo-900">
                        {contact.telephone}
                      </a>
                    </div>
                  )}
                </dd>
              </div>

              {contact.client_details && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Entreprise</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      {contact.client_details.nom}
                    </div>
                  </dd>
                </div>
              )}

              {(contact.adresse || contact.ville_details) && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        {contact.adresse && <div>{contact.adresse}</div>}
                        {contact.ville_details && (
                          <div>
                            {contact.ville_details.nom}
                            {contact.bp && ` - BP ${contact.bp}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </dd>
                </div>
              )}

              {contact.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {contact.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center text-gray-500">Chargement...</div>
      )}
    </div>
  );
}