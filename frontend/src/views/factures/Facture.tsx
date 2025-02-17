import React from 'react';
import { FileText, PlusCircle } from 'lucide-react';
import { FactureDetail as FactureDetailComponent } from './FactureDetail';
import { useFactures } from '@/hooks/useFactures';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SearchInput } from '@/components/ui/SearchInput';
import { FactureList } from './FactureList';

function FactureManagement() {
  const {
    factures,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedFacture,
    setSelectedFacture,
    handleViewDetails,
    handleEdit,
    handleDelete,
    isDeleting,
    handleNewFacture,
    setError,
  } = useFactures();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Gestion des Factures</h1>
                  <p className="text-sm text-gray-500 mt-1">Gérez vos factures clients</p>
                </div>
              </div>
              <button
                onClick={handleNewFacture}
                className="w-full sm:w-auto bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 
                         transition-all duration-200 transform hover:scale-105 hover:shadow-lg
                         flex items-center justify-center gap-2 group"
              >
                <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                Nouvelle Facture
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-6"
            />

            <FactureList 
              factures={factures}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </div>
        </div>

        {/* Details Slide-over */}
        {selectedFacture && (
          <FactureDetailComponent
            facture={selectedFacture}
            onClose={() => setSelectedFacture(null)}
            onEdit={() => handleEdit(selectedFacture)}
            onDelete={() => handleDelete(selectedFacture.id)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </div>
  );
}

export default FactureManagement;