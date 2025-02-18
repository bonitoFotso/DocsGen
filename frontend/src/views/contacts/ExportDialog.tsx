import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { Contact, ContactList } from '@/itf';
import * as Papa from 'papaparse';


interface ExportDialogProps {
  contacts: Contact[] | ContactList[];
  selectedColumns: Set<string>;
}

// Labels français pour les colonnes
const columnLabels: Record<string, string> = {
  region: 'Région',
  ville_nom: 'Ville',
  secteur: 'Secteur',
  entreprise: 'Entreprise',
  prenom: 'Prénom',
  nom: 'Nom',
  poste: 'Fonction',
  service: 'Service',
  role_achat: 'Rôle Achat',
  telephone: 'Téléphone',
  email: 'Email',
  status: 'Statut',
  agrement: 'Agrément'
};

const ExportDialog: React.FC<ExportDialogProps> = ({ contacts, selectedColumns }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [columnsToExport, setColumnsToExport] = useState<Set<string>>(selectedColumns);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');

  const toggleColumn = (column: string) => {
    const newColumns = new Set(columnsToExport);
    if (newColumns.has(column)) {
      newColumns.delete(column);
    } else {
      newColumns.add(column);
    }
    setColumnsToExport(newColumns);
  };

  const formatData = (contacts: Contact[]) => {
    return contacts.map(contact => {
      const formattedContact: Record<string, any> = {};
      Array.from(columnsToExport).forEach(column => {
        const value = contact[column as keyof Contact];
        if (column === 'agrement') {
          formattedContact[columnLabels[column]] = value ? 'Oui' : 'Non';
        } else {
          formattedContact[columnLabels[column]] = value || '';
        }
      });
      return formattedContact;
    });
  };

  const exportToCSV = () => {
    const formattedData = formatData(contacts);
    const csv = Papa.unparse(formattedData, {
      delimiter: ';',
      header: true
    });
    
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToXLSX = () => {
    const formattedData = formatData(contacts);
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    
    // Ajustement automatique de la largeur des colonnes
    const maxWidth = formattedData.reduce((acc, row) => {
      Object.entries(row).forEach(([key, value]) => {
        const length = String(value).length;
        acc[key] = Math.max(acc[key] || 0, length);
      });
      return acc;
    }, {} as Record<string, number>);

    ws['!cols'] = Object.values(maxWidth).map(width => ({ width: Math.min(width + 2, 50) }));

    XLSX.writeFile(wb, `contacts_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExport = () => {
    if (columnsToExport.size === 0) return;
    
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToXLSX();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors" 
        title="Exporter"
      >
        <Download className="h-5 w-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg m-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Exporter les contacts</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Format d'export</label>
                <div className="mt-2 flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-indigo-600"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                    />
                    <span className="ml-2">CSV</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-indigo-600"
                      name="exportFormat"
                      value="xlsx"
                      checked={exportFormat === 'xlsx'}
                      onChange={() => setExportFormat('xlsx')}
                    />
                    <span className="ml-2">Excel</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Colonnes à exporter</label>
                <div className="mt-2 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {Array.from(selectedColumns).map(column => (
                      <label key={column} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={columnsToExport.has(column)}
                          onChange={() => toggleColumn(column)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{columnLabels[column]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleExport}
                disabled={columnsToExport.size === 0}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md flex items-center",
                  "hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDialog;