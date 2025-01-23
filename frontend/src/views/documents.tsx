import { useState } from 'react';
import { DataTable } from '../components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { IDocument } from '../interfaces';
import { Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

const columns: ColumnDef<IDocument>[] = [
  {
    accessorKey: 'reference',
    header: 'Reference',
  },
  {
    accessorKey: 'client.nom',
    header: 'Client',
  },
  {
    accessorKey: 'date_creation',
    header: 'Creation Date',
    cell: ({ row }) => format(new Date(row.original.date_creation), 'dd/MM/yyyy'),
  },
  {
    accessorKey: 'statut',
    header: 'Status',
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium
        ${row.original.statut === 'VALIDE' ? 'bg-green-100 text-green-800' :
          row.original.statut === 'REFUSE' ? 'bg-red-100 text-red-800' :
          row.original.statut === 'ENVOYE' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'}`}>
        {row.original.statut}
      </span>
    ),
  },
  {
    accessorKey: 'doc_type',
    header: 'Type',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <button className="p-2 hover:text-blue-600">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 hover:text-blue-600">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-2 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];

const mockData: IDocument[] = [
  { 
    id: 1,
    entity: { id: 1, code: 'ABC', name: 'Entity One' },
    reference: 'DOC001',
    client: { id: 1, nom: 'Client One' },
    date_creation: '2024-03-15T10:00:00Z',
    statut: 'VALIDE',
    doc_type: 'PRF',
    sequence_number: 1
  },
  // Add more mock data as needed
];

export function Documents() {
  const [filter, setFilter] = useState('all');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        <div className="space-x-4">
          <select 
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="PRF">Proforma</option>
            <option value="FAC">Facture</option>
            <option value="RAP">Rapport</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            New Document
          </button>
        </div>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow">
        <DataTable 
          columns={columns} 
          data={filter === 'all' ? mockData : mockData.filter(doc => doc.doc_type === filter)} 
        />
      </div>
    </div>
  );
}